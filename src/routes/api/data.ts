import { createFileRoute } from "@tanstack/react-router";
import {
  executeServerQuery,
  executeServerMutation,
  readServerTable,
  type QueryParams,
  type MutationParams,
} from "@/server/db.server";

export const Route = createFileRoute("/api/data")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        try {
          const url = new URL(request.url);
          const table = url.searchParams.get("table");
          if (!table) {
            return Response.json({ data: null, error: "Missing table parameter" }, { status: 400 });
          }

          const selectCols = url.searchParams.get("select") || "*";
          const orderField = url.searchParams.get("order") || undefined;
          const orderAsc = url.searchParams.get("ascending") !== "false";
          const limitStr = url.searchParams.get("limit");
          const limitCount = limitStr ? parseInt(limitStr, 10) : undefined;
          const isSingle = url.searchParams.get("single") === "true";
          const isMaybeSingle = url.searchParams.get("maybeSingle") === "true";
          const countOnly = url.searchParams.get("countOnly") === "true";

          const filterKeys = Array.from(url.searchParams.keys()).filter((k) => k.startsWith("eq_") || k.startsWith("neq_"));
          const filters = filterKeys.map((k) => {
            const op = k.startsWith("eq_") ? "eq" : "neq";
            const column = k.slice(op.length + 1);
            return { column, op: op as "eq" | "neq", value: url.searchParams.get(k) };
          });

          const params: QueryParams = {
            selectCols,
            filters,
            orderField,
            orderAsc,
            limitCount,
            isSingle,
            isMaybeSingle,
            countOnly,
          };

          const result = executeServerQuery(table, params);
          return Response.json(result);
        } catch (err: any) {
          console.error("[API /api/data GET error]:", err);
          return Response.json({ data: null, error: err.message || "Server error" }, { status: 500 });
        }
      },

      POST: async ({ request }: { request: Request }) => {
        try {
          const body = await request.json().catch(() => null);
          if (!body || !body.table) {
            return Response.json({ data: null, error: "Invalid payload or missing table" }, { status: 400 });
          }

          const { table, action, queryParams, payload, filters, upsertOptions } = body;

          if (action === "query") {
            const result = executeServerQuery(table, queryParams || {});
            return Response.json(result);
          }

          const mutationParams: MutationParams = {
            action: action || "upsert",
            payload,
            filters,
            upsertOptions,
          };

          const result = await executeServerMutation(table, mutationParams);
          return Response.json(result);
        } catch (err: any) {
          console.error("[API /api/data POST error]:", err);
          return Response.json({ data: null, error: err.message || "Server error" }, { status: 500 });
        }
      },
    },
  },
});
