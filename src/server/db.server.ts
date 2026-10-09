import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import {
  getDefaultProducts,
  getDefaultServices,
  getDefaultBlogPosts,
  getDefaultVideos,
  getDefaultBanners,
  getDefaultOrders,
  DEFAULT_FOUNDER_DATA,
  DEFAULT_SITE_SETTINGS_DATA,
} from "@/lib/syncStore";
import { supabase as realSupabase } from "@/integrations/supabase/client";

// Global in-memory cache to persist across warm serverless requests
const globalDb: Record<string, any[]> = ((globalThis as any).__A9_SERVER_DB__ =
  (globalThis as any).__A9_SERVER_DB__ || {});

const isServerless = Boolean(
  process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.NETLIFY,
);

// In serverless environments (e.g. Vercel), the project root is strictly read-only.
// Use os.tmpdir() for safe writable disk cache while reading bundled files as fallback.
const DB_DIR = isServerless
  ? path.join(os.tmpdir(), "a9_server_db")
  : path.resolve(process.cwd(), "src/data/server-db");

function ensureDbDir() {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
  } catch (err) {
    // Graceful fallback for strictly read-only environments
  }
}

export function getInitialTableData(table: string): any[] {
  switch (table) {
    case "products":
      return getDefaultProducts();
    case "services":
      return getDefaultServices();
    case "blog_posts":
      return getDefaultBlogPosts();
    case "videos":
      return getDefaultVideos();
    case "promo_banners":
      return getDefaultBanners();
    case "orders":
      return getDefaultOrders();
    case "founder_content":
      return [{ id: "main", data: DEFAULT_FOUNDER_DATA, updated_at: new Date().toISOString() }];
    case "site_settings":
      return [{ id: "main", data: DEFAULT_SITE_SETTINGS_DATA, updated_at: new Date().toISOString() }];
    case "profiles":
      return [];
    default:
      return [];
  }
}

// ----------------------------------------------------
// REMOTE CLOUD PERSISTENCE (Vercel KV / Upstash / Supabase)
// ----------------------------------------------------

function getKvConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) return { url, token };
  return null;
}

async function fetchFromRemoteKv(table: string): Promise<any[] | null> {
  const kv = getKvConfig();
  if (!kv) return null;
  try {
    const res = await fetch(`${kv.url}/get/a9_table_${table}`, {
      headers: { Authorization: `Bearer ${kv.token}` },
    });
    if (res.ok) {
      const json = await res.json();
      const raw = json?.result;
      if (raw) {
        const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    }
  } catch (err) {
    console.warn(`[ServerDB] Error reading KV for ${table}:`, err);
  }
  return null;
}

async function saveToRemoteKv(table: string, items: any[]): Promise<void> {
  const kv = getKvConfig();
  if (!kv) return;
  try {
    await fetch(`${kv.url}/set/a9_table_${table}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${kv.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(items),
    });
  } catch (err) {
    console.warn(`[ServerDB] Error writing KV for ${table}:`, err);
  }
}

function isSupabaseConfigured(): boolean {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  return Boolean(
    url &&
      !url.includes("placeholder-project") &&
      !url.includes("aklwdviwldimctxnbixp") &&
      url.startsWith("https://"),
  );
}

// ----------------------------------------------------
// TABLE READ / WRITE
// ----------------------------------------------------

export function readServerTable(table: string): any[] {
  // 1. Fast in-memory cache
  if (globalDb[table] && Array.isArray(globalDb[table]) && globalDb[table].length > 0) {
    return globalDb[table];
  }

  ensureDbDir();
  const filePath = path.join(DB_DIR, `${table}.json`);

  // 2. Read from disk if exists
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        globalDb[table] = parsed;
        return parsed;
      }
    } catch (err) {
      console.warn(`[ServerDB] Error reading ${filePath}:`, err);
    }
  }

  // 3. Check bundled seed file in process.cwd() if running locally or bundled
  const bundledPath = path.resolve(process.cwd(), "src/data/server-db", `${table}.json`);
  if (bundledPath !== filePath && fs.existsSync(bundledPath)) {
    try {
      const content = fs.readFileSync(bundledPath, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        globalDb[table] = parsed;
        return parsed;
      }
    } catch {}
  }

  // 4. Fallback to in-code seed generator
  const initial = getInitialTableData(table);
  globalDb[table] = initial;
  try {
    fs.writeFileSync(filePath, JSON.stringify(initial, null, 2), "utf-8");
  } catch {}
  return initial;
}

export async function readServerTableAsync(table: string): Promise<any[]> {
  // Check remote KV store first if available
  const kvData = await fetchFromRemoteKv(table);
  if (kvData && Array.isArray(kvData) && kvData.length > 0) {
    globalDb[table] = kvData;
    writeServerTable(table, kvData);
    return kvData;
  }
  return readServerTable(table);
}

export function writeServerTable(table: string, items: any[]): void {
  globalDb[table] = items;
  ensureDbDir();
  const filePath = path.join(DB_DIR, `${table}.json`);
  try {
    fs.writeFileSync(filePath, JSON.stringify(items, null, 2), "utf-8");
  } catch (err) {
    // Never crash on read-only serverless filesystems
    console.warn(`[ServerDB] Notice: Local disk write failed (${table}):`, err);
  }
}

// ----------------------------------------------------
// QUERY & MUTATION EXECUTION
// ----------------------------------------------------

export type QueryFilter = {
  column: string;
  op: "eq" | "neq";
  value: any;
};

export type QueryParams = {
  selectCols?: string;
  filters?: QueryFilter[];
  orderField?: string;
  orderAsc?: boolean;
  limitCount?: number;
  isSingle?: boolean;
  isMaybeSingle?: boolean;
  countOnly?: boolean;
};

export async function executeServerQuery(
  table: string,
  params: QueryParams = {},
): Promise<{ data: any; count?: number; error: null }> {
  // If a real external Supabase database is connected, query Supabase first
  if (isSupabaseConfigured()) {
    try {
      const client = realSupabase as any;
      if (client?.from) {
        let q = client.from(table).select(params.selectCols || "*", {
          count: params.countOnly ? "exact" : undefined,
          head: params.countOnly ? true : false,
        });
        if (params.filters) {
          for (const f of params.filters) {
            if (f.op === "eq") q = q.eq(f.column, f.value);
            if (f.op === "neq") q = q.neq(f.column, f.value);
          }
        }
        if (params.orderField) {
          q = q.order(params.orderField, { ascending: params.orderAsc ?? true });
        }
        if (params.limitCount) {
          q = q.limit(params.limitCount);
        }
        const { data, error, count } = await q;
        if (!error && (data != null || count != null)) {
          if (params.isSingle || params.isMaybeSingle) {
            return { data: Array.isArray(data) ? data[0] ?? null : data, count, error: null };
          }
          return { data, count, error: null };
        }
      }
    } catch (err) {
      console.warn(`[ServerDB] Supabase query fallback for ${table}:`, err);
    }
  }

  let items = [...(await readServerTableAsync(table))];

  if (params.filters && params.filters.length > 0) {
    items = items.filter((item) => {
      if (!item) return false;
      return params.filters!.every((f) => {
        const val = item[f.column];
        if (f.op === "eq") {
          if (val === undefined && f.column === "id" && item.slug !== undefined) {
            return String(item.slug) === String(f.value);
          }
          return String(val) === String(f.value);
        }
        if (f.op === "neq") {
          if (val === undefined && f.column === "id" && item.slug !== undefined) {
            return String(item.slug) !== String(f.value);
          }
          return String(val) !== String(f.value);
        }
        return true;
      });
    });
  }

  const totalCount = items.length;

  if (params.countOnly) {
    return { data: null, count: totalCount, error: null };
  }

  if (params.orderField) {
    const field = params.orderField;
    const asc = params.orderAsc ?? true ? 1 : -1;
    items.sort((a, b) => {
      const va = a[field];
      const vb = b[field];
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === "number" && typeof vb === "number") return (va - vb) * asc;
      if (field === "created_at" || field === "updated_at") {
        return (new Date(va).getTime() - new Date(vb).getTime()) * asc;
      }
      return String(va).localeCompare(String(vb)) * asc;
    });
  }

  if (params.limitCount != null) {
    items = items.slice(0, params.limitCount);
  }

  if (params.selectCols && params.selectCols !== "*") {
    const cols = params.selectCols.split(",").map((c) => c.trim());
    if (cols.length === 1 && cols[0] === "data") {
      items = items.map((it) => ({ data: it.data ?? it }));
    } else {
      items = items.map((it) => {
        const res: Record<string, any> = {};
        for (const c of cols) res[c] = it[c];
        return res;
      });
    }
  }

  if (params.isSingle || params.isMaybeSingle) {
    return { data: items[0] ?? null, count: totalCount, error: null };
  }

  return { data: items, count: totalCount, error: null };
}

export type MutationParams = {
  action: "insert" | "update" | "delete" | "upsert" | "reset";
  payload?: any;
  filters?: QueryFilter[];
  upsertOptions?: { onConflict?: string };
};

export async function executeServerMutation(
  table: string,
  params: MutationParams,
): Promise<{ data: any; error: string | null }> {
  let items = [...(await readServerTableAsync(table))];

  // Sync to remote Supabase if connected
  if (isSupabaseConfigured()) {
    try {
      const client = realSupabase as any;
      if (client?.from) {
        if (params.action === "insert") {
          await client.from(table).insert(params.payload);
        } else if (params.action === "upsert") {
          await client.from(table).upsert(params.payload, params.upsertOptions);
        } else if (params.action === "update" && params.filters?.length) {
          let q = client.from(table).update(params.payload);
          for (const f of params.filters) {
            if (f.op === "eq") q = q.eq(f.column, f.value);
          }
          await q;
        } else if (params.action === "delete" && params.filters?.length) {
          let q = client.from(table).delete();
          for (const f of params.filters) {
            if (f.op === "eq") q = q.eq(f.column, f.value);
          }
          await q;
        }
      }
    } catch (err) {
      console.warn(`[ServerDB] Supabase mutation error on ${table}:`, err);
    }
  }

  if (params.action === "reset") {
    const initial = getInitialTableData(table);
    writeServerTable(table, initial);
    await saveToRemoteKv(table, initial);
    return { data: initial, error: null };
  }

  if (params.action === "insert") {
    const records = Array.isArray(params.payload) ? params.payload : [params.payload];
    const inserted = records.map((r) => {
      const id =
        r.id || r.slug || `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      return {
        ...r,
        id,
        created_at: r.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    });
    items = [...inserted, ...items];
    writeServerTable(table, items);
    await saveToRemoteKv(table, items);
    return { data: Array.isArray(params.payload) ? inserted : inserted[0], error: null };
  }

  if (params.action === "update") {
    const payload = params.payload;
    const updated: any[] = [];
    const filters = params.filters ?? [];
    items = items.map((item) => {
      const matches =
        filters.length === 0 ||
        filters.every((f) => {
          const val = item[f.column];
          if (f.op === "eq") {
            if (val === undefined && f.column === "id" && item.slug !== undefined) {
              return String(item.slug) === String(f.value);
            }
            return String(val) === String(f.value);
          }
          return true;
        });
      if (matches) {
        const next = { ...item, ...payload, updated_at: new Date().toISOString() };
        updated.push(next);
        return next;
      }
      return item;
    });
    writeServerTable(table, items);
    await saveToRemoteKv(table, items);
    return { data: updated, error: null };
  }

  if (params.action === "delete") {
    const filters = params.filters ?? [];
    items = items.filter((item) => {
      return !filters.every((f) => {
        const val = item[f.column];
        if (f.op === "eq") {
          if (val === undefined && f.column === "id" && item.slug !== undefined) {
            return String(item.slug) === String(f.value);
          }
          return String(val) === String(f.value);
        }
        return true;
      });
    });
    writeServerTable(table, items);
    await saveToRemoteKv(table, items);
    return { data: null, error: null };
  }

  if (params.action === "upsert") {
    const records = Array.isArray(params.payload) ? params.payload : [params.payload];
    const conflictKey = params.upsertOptions?.onConflict || "id";
    for (const rec of records) {
      const matchVal = rec[conflictKey] || rec.id || rec.slug;
      const idx = items.findIndex((it) => (it[conflictKey] || it.id || it.slug) === matchVal);
      const itemToSave = {
        ...rec,
        id: rec.id || (idx >= 0 ? items[idx].id : rec.slug || `rec_${Date.now()}`),
        updated_at: new Date().toISOString(),
        created_at: idx >= 0 ? items[idx].created_at : rec.created_at || new Date().toISOString(),
      };
      if (idx >= 0) {
        items[idx] = { ...items[idx], ...itemToSave };
      } else {
        items.push(itemToSave);
      }
    }
    writeServerTable(table, items);
    await saveToRemoteKv(table, items);
    return { data: params.payload, error: null };
  }

  return { data: null, error: "Unknown action" };
}
