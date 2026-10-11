if (typeof globalThis.WebSocket === "undefined") {
  globalThis.WebSocket = class DummyWebSocket {} as any;
}

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
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const LIVE_SUPABASE_URL = "https://tztgtdyyrgxmbzkomlkh.supabase.co";
export const LIVE_SUPABASE_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6dGd0ZHl5cmd4bWJ6a29tbGtoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTcwOTcyNiwiZXhwIjoyMTA3Mjg1NzI2fQ.LvlsTTQLfMC4NTIx5oZZrNvSpD_ZVyG7lQ1CdTg1hYk";

// Global in-memory cache to persist across warm serverless requests
const globalDb: Record<string, any[]> = ((globalThis as any).__A9_SERVER_DB__ =
  (globalThis as any).__A9_SERVER_DB__ || {});

const missingTableNotices = new Set<string>();
const seededTables = new Set<string>();

const isServerless = Boolean(
  process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.NETLIFY,
);

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

export function isTableMissingError(err: any): boolean {
  if (!err) return false;
  const msg = String(err.message || "").toLowerCase();
  const code = String(err.code || "");
  return (
    code === "PGRST205" ||
    code === "42P01" ||
    msg.includes("could not find the table") ||
    (msg.includes("relation") && msg.includes("does not exist"))
  );
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

async function autoSeedIfEmpty(table: string, currentData: any[]): Promise<any[]> {
  if (seededTables.has(table)) return currentData;
  if (!Array.isArray(currentData) || currentData.length > 0) return currentData;

  const seedables = [
    "products",
    "services",
    "blog_posts",
    "videos",
    "promo_banners",
    "founder_content",
    "site_settings",
  ];
  if (!seedables.includes(table)) return currentData;

  const initial = getInitialTableData(table);
  try {
    const client = supabaseAdmin as any;
    const { error } = await client.from(table).insert(initial);
    if (!error) {
      console.log(`[ServerDB] Successfully auto-seeded ${initial.length} records into Supabase table: ${table}`);
      seededTables.add(table);
      globalDb[table] = initial;
      return initial;
    } else {
      console.warn(`[ServerDB] Auto-seed warning for ${table}:`, error.message);
    }
  } catch (err: any) {
    console.warn(`[ServerDB] Auto-seed exception on ${table}:`, err?.message || err);
  }
  return initial;
}

// ----------------------------------------------------
// TABLE READ / WRITE FALLBACKS
// ----------------------------------------------------

export function readServerTable(table: string): any[] {
  if (globalDb[table] && Array.isArray(globalDb[table]) && globalDb[table].length > 0) {
    return globalDb[table];
  }

  ensureDbDir();
  const filePath = path.join(DB_DIR, `${table}.json`);

  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        globalDb[table] = parsed;
        return parsed;
      }
    } catch {}
  }

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

  const initial = getInitialTableData(table);
  globalDb[table] = initial;
  return initial;
}

export async function readServerTableAsync(table: string): Promise<any[]> {
  if (globalDb[table] && Array.isArray(globalDb[table]) && globalDb[table].length > 0) {
    return globalDb[table];
  }
  return readServerTable(table);
}

export function writeServerTable(table: string, items: any[]): void {
  globalDb[table] = items;
  ensureDbDir();
  const filePath = path.join(DB_DIR, `${table}.json`);
  try {
    fs.writeFileSync(filePath, JSON.stringify(items, null, 2), "utf-8");
  } catch {}
}

// ----------------------------------------------------
// QUERY & MUTATION EXECUTION ON LIVE SUPABASE DATABASE
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
  // 1. Direct operation on live Supabase production database
  try {
    const client = supabaseAdmin as any;
    if (client?.from) {
      let q = client.from(table).select(params.selectCols || "*", {
        count: params.countOnly ? "exact" : undefined,
        head: params.countOnly ? true : false,
      });

      if (params.filters && params.filters.length > 0) {
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
        let finalData = data;

        // If the Supabase table exists but is empty on an unfiltered query, auto-seed default records
        if (
          Array.isArray(finalData) &&
          finalData.length === 0 &&
          (!params.filters || params.filters.length === 0) &&
          !params.countOnly
        ) {
          finalData = await autoSeedIfEmpty(table, finalData);
        }

        if (Array.isArray(finalData)) {
          globalDb[table] = finalData;
        }

        if (params.isSingle || params.isMaybeSingle) {
          return {
            data: Array.isArray(finalData) ? finalData[0] ?? null : finalData,
            count: count ?? (Array.isArray(finalData) ? finalData.length : undefined),
            error: null,
          };
        }

        return { data: finalData, count, error: null };
      }

      if (error) {
        if (isTableMissingError(error)) {
          if (!missingTableNotices.has(table)) {
            missingTableNotices.add(table);
            console.log(
              `[ServerDB] Supabase table "${table}" not found in schema cache. Safely serving initial schema fallback.`,
            );
          }
        } else {
          console.warn(`[ServerDB] Supabase query notice for ${table}:`, error.message);
        }
      }
    }
  } catch (err: any) {
    console.warn(`[ServerDB] Supabase query exception on ${table}:`, err?.message || err);
  }

  // 2. Safe initial schema setup fallback (if Supabase table is not yet provisioned)
  let items: any[] = JSON.parse(JSON.stringify(await readServerTableAsync(table)));

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
        const diff = (new Date(va).getTime() - new Date(vb).getTime()) * asc;
        if (diff !== 0) return diff;
        return String(a.id || a.slug || "").localeCompare(String(b.id || b.slug || ""));
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

// Sequential queue per table to prevent concurrent read-modify-write race conditions
const tableMutexMap = new Map<string, Promise<any>>();

function runWithTableLock<T>(table: string, task: () => Promise<T>): Promise<T> {
  const current = tableMutexMap.get(table) || Promise.resolve();
  const next = current.catch(() => {}).then(task);
  tableMutexMap.set(table, next);
  return next;
}

export async function executeServerMutation(
  table: string,
  params: MutationParams,
): Promise<{ data: any; error: string | null }> {
  return runWithTableLock(table, async () => {
    const client = supabaseAdmin as any;

    // Reset action: reset Supabase table and local cache to fresh defaults
    if (params.action === "reset") {
      const initial = getInitialTableData(table);
      try {
        if (client?.from) {
          await client.from(table).delete().neq("id", "___never_matched___");
          await client.from(table).insert(initial);
        }
      } catch (err: any) {
        console.warn(`[ServerDB] Supabase reset fallback for ${table}:`, err?.message || err);
      }
      globalDb[table] = initial;
      writeServerTable(table, initial);
      return { data: initial, error: null };
    }

    // Insert action
    if (params.action === "insert") {
      const rawRecords = Array.isArray(params.payload) ? params.payload : [params.payload];
      const records = JSON.parse(JSON.stringify(rawRecords));
      const inserted = records.map((r: any) => {
        const id =
          r.id || r.slug || `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        return {
          ...r,
          id,
          created_at: r.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      });

      // DIRECT OPERATION ON SUPABASE
      try {
        if (client?.from) {
          const { data: sbData, error: sbError } = await client
            .from(table)
            .insert(inserted)
            .select();
          if (!sbError && sbData) {
            const current = globalDb[table] || [];
            const resultData = Array.isArray(params.payload) ? sbData : sbData[0];
            globalDb[table] = [...(Array.isArray(sbData) ? sbData : [sbData]), ...current];
            writeServerTable(table, globalDb[table]);
            return { data: resultData, error: null };
          }
          if (sbError && !isTableMissingError(sbError)) {
            console.warn(`[ServerDB] Supabase insert warning on ${table}:`, sbError.message);
          }
        }
      } catch (err: any) {
        console.warn(`[ServerDB] Supabase insert exception on ${table}:`, err?.message || err);
      }

      // Safe fallback if Supabase table is not yet provisioned
      const rawItems = await readServerTableAsync(table);
      const items = [...inserted, ...(rawItems || [])];
      globalDb[table] = items;
      writeServerTable(table, items);
      return { data: Array.isArray(params.payload) ? inserted : inserted[0], error: null };
    }

    // Update action
    if (params.action === "update") {
      const payload = JSON.parse(JSON.stringify(params.payload || {}));
      const filters = params.filters ?? [];
      const idFilter = filters.find((f) => f.column === "id" || f.column === "slug");
      const targetId =
        idFilter != null && idFilter.value != null ? String(idFilter.value).trim() : null;

      // DIRECT OPERATION ON SUPABASE
      try {
        if (client?.from) {
          let q = client.from(table).update({ ...payload, updated_at: new Date().toISOString() });
          if (targetId) {
            q = q.or(`id.eq.${targetId},slug.eq.${targetId}`);
          } else {
            for (const f of filters) {
              if (f.op === "eq") q = q.eq(f.column, f.value);
              if (f.op === "neq") q = q.neq(f.column, f.value);
            }
          }
          const { data: sbData, error: sbError } = await q.select();
          if (!sbError && sbData) {
            const current = globalDb[table] || [];
            const updatedRows = Array.isArray(sbData) ? sbData : [sbData];
            const updatedMap = new Map(updatedRows.map((r: any) => [String(r.id || r.slug), r]));
            const next = current.map((item: any) => {
              const k = String(item.id || item.slug);
              return updatedMap.has(k) ? updatedMap.get(k) : item;
            });
            globalDb[table] = next;
            writeServerTable(table, next);
            return { data: sbData, error: null };
          }
          if (sbError && !isTableMissingError(sbError)) {
            console.warn(`[ServerDB] Supabase update warning on ${table}:`, sbError.message);
          }
        }
      } catch (err: any) {
        console.warn(`[ServerDB] Supabase update exception on ${table}:`, err?.message || err);
      }

      // Safe fallback
      const rawItems = await readServerTableAsync(table);
      const clonedItems: any[] = JSON.parse(JSON.stringify(rawItems || []));
      const updated: any[] = [];

      if (targetId) {
        const targetIndex = clonedItems.findIndex((it) => {
          if (!it) return false;
          const itemId = String(it.id ?? "").trim();
          const itemSlug = String(it.slug ?? "").trim();
          return itemId === targetId || itemSlug === targetId;
        });

        if (targetIndex !== -1) {
          const existing = clonedItems[targetIndex];
          const next = {
            ...existing,
            ...payload,
            id: payload.id !== undefined && payload.id !== "" ? payload.id : existing.id || targetId,
            slug: payload.slug !== undefined && payload.slug !== "" ? payload.slug : existing.slug || targetId,
            updated_at: new Date().toISOString(),
          };
          clonedItems[targetIndex] = next;
          updated.push(next);
        }
      } else if (filters.length > 0) {
        for (let i = 0; i < clonedItems.length; i++) {
          const item = clonedItems[i];
          if (!item) continue;
          const isMatch = filters.every((f) => {
            const val = item[f.column];
            if (f.op === "eq") return String(val) === String(f.value);
            if (f.op === "neq") return String(val) !== String(f.value);
            return true;
          });
          if (isMatch) {
            const next = { ...item, ...payload, updated_at: new Date().toISOString() };
            clonedItems[i] = next;
            updated.push(next);
          }
        }
      }

      globalDb[table] = clonedItems;
      writeServerTable(table, clonedItems);
      return { data: updated, error: null };
    }

    // Delete action
    if (params.action === "delete") {
      const filters = params.filters ?? [];
      const idFilter = filters.find((f) => f.column === "id");
      const slugFilter = filters.find((f) => f.column === "slug");
      const targetId = idFilter != null ? String(idFilter.value) : null;
      const targetSlug = slugFilter != null ? String(slugFilter.value) : null;

      // DIRECT OPERATION ON SUPABASE
      try {
        if (client?.from) {
          let q = client.from(table).delete();
          if (targetId) {
            q = q.eq("id", targetId);
          } else if (targetSlug) {
            q = q.eq("slug", targetSlug);
          } else {
            for (const f of filters) {
              if (f.op === "eq") q = q.eq(f.column, f.value);
              if (f.op === "neq") q = q.neq(f.column, f.value);
            }
          }
          const { error: sbError } = await q;
          if (!sbError) {
            const current = globalDb[table] || [];
            const next = current.filter((it: any) => {
              if (targetId && String(it.id) === targetId) return false;
              if (targetSlug && String(it.slug) === targetSlug) return false;
              return true;
            });
            globalDb[table] = next;
            writeServerTable(table, next);
            return { data: null, error: null };
          }
          if (sbError && !isTableMissingError(sbError)) {
            console.warn(`[ServerDB] Supabase delete warning on ${table}:`, sbError.message);
          }
        }
      } catch (err: any) {
        console.warn(`[ServerDB] Supabase delete exception on ${table}:`, err?.message || err);
      }

      // Safe fallback
      const rawItems = await readServerTableAsync(table);
      const filtered = (rawItems || []).filter((rawItem) => {
        if (!rawItem) return false;
        const itemId = String(rawItem.id ?? "");
        const itemSlug = String(rawItem.slug ?? "");
        if (targetId != null) return itemId !== targetId && itemSlug !== targetId;
        if (targetSlug != null) return itemSlug !== targetSlug && itemId !== targetSlug;
        return !filters.every((f) => {
          const val = rawItem[f.column];
          return f.op === "eq" ? String(val) === String(f.value) : true;
        });
      });
      globalDb[table] = filtered;
      writeServerTable(table, filtered);
      return { data: null, error: null };
    }

    // Upsert action
    if (params.action === "upsert") {
      const rawRecords = Array.isArray(params.payload) ? params.payload : [params.payload];
      const records = JSON.parse(JSON.stringify(rawRecords));
      const conflictKey = params.upsertOptions?.onConflict || "id";

      // DIRECT OPERATION ON SUPABASE
      try {
        if (client?.from) {
          const { data: sbData, error: sbError } = await client
            .from(table)
            .upsert(records, params.upsertOptions)
            .select();
          if (!sbError && sbData) {
            const current = globalDb[table] || [];
            const upsertedList = Array.isArray(sbData) ? sbData : [sbData];
            const map = new Map(upsertedList.map((r: any) => [String(r[conflictKey] || r.id || r.slug), r]));
            const next = current.map((item: any) => {
              const k = String(item[conflictKey] || item.id || item.slug);
              return map.has(k) ? map.get(k) : item;
            });
            for (const [k, v] of map.entries()) {
              if (!next.some((it: any) => String(it[conflictKey] || it.id || it.slug) === k)) {
                next.push(v);
              }
            }
            globalDb[table] = next;
            writeServerTable(table, next);
            return { data: sbData, error: null };
          }
          if (sbError && !isTableMissingError(sbError)) {
            console.warn(`[ServerDB] Supabase upsert warning on ${table}:`, sbError.message);
          }
        }
      } catch (err: any) {
        console.warn(`[ServerDB] Supabase upsert exception on ${table}:`, err?.message || err);
      }

      // Safe fallback
      const rawItems = await readServerTableAsync(table);
      let items: any[] = JSON.parse(JSON.stringify(rawItems || []));
      for (const rec of records) {
        const matchVal = String(rec[conflictKey] || rec.id || rec.slug || "");
        const idx = items.findIndex((it) => {
          const itVal = String(it[conflictKey] || it.id || it.slug || "");
          return itVal === matchVal;
        });
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
      globalDb[table] = items;
      writeServerTable(table, items);
      return { data: params.payload, error: null };
    }

    return { data: null, error: "Unknown action" };
  });
}
