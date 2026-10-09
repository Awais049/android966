import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X, Trash2 } from "lucide-react";
import { sb, type OrderRow, type OrderStatus } from "@/lib/adminApi";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

function AdminOrders() {
  const qc = useQueryClient();
  const [open, setOpen] = useState<OrderRow | null>(null);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: async () => {
      try {
        const { data, error } = await sb.from("orders").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        return (data ?? []) as OrderRow[];
      } catch (err) {
        console.warn("[AdminOrders] Supabase connection unavailable:", err);
        return [];
      }
    },
    retry: false,
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
      const { error } = await sb.from("orders").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "orders"] });
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await sb.from("orders").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "orders"] });
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      setOpen(null);
    },
  });

  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {isLoading ? (
          <p className="p-6 text-sm text-slate-500">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Order #</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((o) => (
                <tr key={o.id} className="cursor-pointer hover:bg-slate-50" onClick={() => setOpen(o)}>
                  <td className="px-4 py-3 font-medium text-slate-900">#{o.order_number}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {o.customer_name}
                    <br />
                    <span className="text-xs text-slate-500">{o.phone}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-900">Rs {Number(o.total).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {new Date(o.created_at).toLocaleString("en-PK")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-base font-semibold">Order #{open.order_number}</h2>
                <p className="text-xs text-slate-500">{new Date(open.created_at).toLocaleString("en-PK")}</p>
              </div>
              <button onClick={() => setOpen(null)}><X className="h-5 w-5 text-slate-500" /></button>
            </div>
            <div className="max-h-[70vh] space-y-5 overflow-y-auto p-6 text-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                <Info label="Customer" value={open.customer_name} />
                <Info label="Phone" value={open.phone ?? "—"} />
                <Info label="Email" value={open.email ?? "—"} />
                <Info label="City" value={open.city ?? "—"} />
                <Info label="Address" value={`${open.address ?? ""} ${open.postal_code ?? ""}`.trim() || "—"} />
                <Info label="Province" value={open.province ?? "—"} />
              </div>

              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Items</p>
                <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                  {open.items.map((it, i) => (
                    <li key={i} className="flex items-center justify-between px-3 py-2">
                      <span>{it.name} × {it.quantity}</span>
                      <span className="font-medium">Rs {(it.price * it.quantity).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg bg-slate-50 p-3">
                <Row label="Subtotal" value={`Rs ${Number(open.subtotal).toLocaleString()}`} />
                <Row label="Delivery" value={`Rs ${Number(open.shipping).toLocaleString()}`} />
                <Row label="Total" value={`Rs ${Number(open.total).toLocaleString()}`} bold />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">Status</label>
                <select
                  className="input"
                  value={open.status}
                  onChange={(e) => {
                    const status = e.target.value as OrderStatus;
                    setStatus.mutate({ id: open.id, status });
                    setOpen({ ...open, status });
                  }}
                >
                  {(["pending", "processing", "shipped", "delivered", "cancelled"] as OrderStatus[]).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => confirm("Delete this order?") && del.mutate(open.id)}
                  className="inline-flex items-center gap-1 rounded-md border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3" /> Delete order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const colors: Record<OrderStatus, string> = {
    pending: "bg-amber-50 text-amber-700",
    processing: "bg-blue-50 text-blue-700",
    shipped: "bg-indigo-50 text-indigo-700",
    delivered: "bg-emerald-50 text-emerald-700",
    cancelled: "bg-red-50 text-red-700",
  };
  return <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${colors[status]}`}>{status}</span>;
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-sm text-slate-900">{value}</p>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between py-0.5 ${bold ? "text-base font-semibold" : "text-sm"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
