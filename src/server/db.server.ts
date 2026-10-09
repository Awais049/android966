import fs from "node:fs";
import path from "node:path";
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

const DB_DIR = path.resolve(process.cwd(), "src/data/server-db");

function ensureDbDir() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
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

export function readServerTable(table: string): any[] {
  ensureDbDir();
  const filePath = path.join(DB_DIR, `${table}.json`);

  if (!fs.existsSync(filePath)) {
    const initial = getInitialTableData(table);
    try {
      fs.writeFileSync(filePath, JSON.stringify(initial, null, 2), "utf-8");
    } catch (err) {
      console.warn(`[ServerDB] Failed to initialize ${table}.json:`, err);
    }
    return initial;
  }

  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const essential = [
        "products",
        "services",
        "blog_posts",
        "videos",
        "promo_banners",
        "founder_content",
        "site_settings",
      ];
      if (essential.includes(table)) {
        const initial = getInitialTableData(table);
        fs.writeFileSync(filePath, JSON.stringify(initial, null, 2), "utf-8");
        return initial;
      }
    }
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn(`[ServerDB] Error reading ${filePath}:`, err);
    const initial = getInitialTableData(table);
    return initial;
  }
}

export function writeServerTable(table: string, items: any[]): void {
  ensureDbDir();
  const filePath = path.join(DB_DIR, `${table}.json`);
  try {
    fs.writeFileSync(filePath, JSON.stringify(items, null, 2), "utf-8");
  } catch (err) {
    console.error(`[ServerDB] Error writing ${filePath}:`, err);
    throw err;
  }
}

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

export function executeServerQuery(table: string, params: QueryParams = {}): { data: any; count?: number; error: null } {
  let items = [...readServerTable(table)];

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
  params: MutationParams
): Promise<{ data: any; error: string | null }> {
  let items = [...readServerTable(table)];

  // Background sync to remote Supabase if connected
  try {
    const client = realSupabase as any;
    if (client?.from) {
      if (params.action === "insert") {
        Promise.resolve(client.from(table).insert(params.payload)).catch(() => {});
      } else if (params.action === "upsert") {
        Promise.resolve(client.from(table).upsert(params.payload, params.upsertOptions)).catch(() => {});
      } else if (params.action === "update" && params.filters?.length) {
        let q = client.from(table).update(params.payload);
        for (const f of params.filters) {
          if (f.op === "eq") q = q.eq(f.column, f.value);
        }
        Promise.resolve(q).catch(() => {});
      } else if (params.action === "delete" && params.filters?.length) {
        let q = client.from(table).delete();
        for (const f of params.filters) {
          if (f.op === "eq") q = q.eq(f.column, f.value);
        }
        Promise.resolve(q).catch(() => {});
      }
    }
  } catch {
    // Graceful background sync failure
  }

  if (params.action === "reset") {
    const initial = getInitialTableData(table);
    writeServerTable(table, initial);
    return { data: initial, error: null };
  }

  if (params.action === "insert") {
    const records = Array.isArray(params.payload) ? params.payload : [params.payload];
    const inserted = records.map((r) => {
      const id = r.id || r.slug || `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      return {
        ...r,
        id,
        created_at: r.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    });
    items = [...inserted, ...items];
    writeServerTable(table, items);
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
    return { data: params.payload, error: null };
  }

  return { data: null, error: "Unknown action" };
}
