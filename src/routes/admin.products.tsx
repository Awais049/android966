import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Pencil, X } from "lucide-react";
import { sb, type ProductRow, type ProductVariantRow } from "@/lib/adminApi";
import ImagePicker from "@/components/admin/ImagePicker";


export const Route = createFileRoute("/admin/products")({
  component: AdminProducts,
});

const empty: Partial<ProductRow> = {
  slug: "",
  name: "",
  category: "tech",
  subcategory: "",
  price: 0,
  original_price: 0,
  rating: 5,
  reviews: 0,
  badge: "",
  image: "",
  description: "",
  in_stock: true,
  sku: "",
  variants: [],
};


function AdminProducts() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<ProductRow> | null>(null);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: async () => {
      try {
        const { data, error } = await sb
          .from("products")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        return (data ?? []) as ProductRow[];
      } catch (err) {
        console.warn("[AdminProducts] Supabase connection unavailable:", err);
        return [];
      }
    },
    retry: false,
  });

  const save = useMutation({
    mutationKey: ["products", "save"],
    mutationFn: async (row: Partial<ProductRow>) => {
      const payload = JSON.parse(JSON.stringify(row));
      if (payload.id) {
        const targetId = String(payload.id);
        const { error } = await sb.from("products").update(payload).eq("id", targetId);
        if (error) throw error;
      } else {
        const { error } = await sb.from("products").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      setEditing(null);
    },
    onSettled: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "products"] });
      await qc.invalidateQueries({ queryKey: ["public", "products"] });
      await qc.invalidateQueries({ queryKey: ["products"] });
      await qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });

  const del = useMutation({
    mutationKey: ["products", "delete"],
    mutationFn: async (id: string) => {
      const targetId = String(id);
      const { error } = await sb.from("products").delete().eq("id", targetId);
      if (error) throw error;
    },
    onMutate: async (id: string) => {
      const targetId = String(id);
      await qc.cancelQueries({ queryKey: ["admin", "products"] });
      await qc.cancelQueries({ queryKey: ["public", "products"] });
      await qc.cancelQueries({ queryKey: ["products"] });

      const prevAdmin = qc.getQueryData<ProductRow[]>(["admin", "products"]);
      const prevPublic = qc.getQueryData<any[]>(["public", "products"]);
      const prevProducts = qc.getQueryData<any[]>(["products"]);

      qc.setQueryData<ProductRow[]>(["admin", "products"], (old) =>
        old ? old.filter((p) => String(p.id) !== targetId && String(p.slug) !== targetId) : old,
      );
      qc.setQueryData<any[]>(["public", "products"], (old) =>
        old ? old.filter((p) => String(p.id) !== targetId && String(p.slug) !== targetId) : old,
      );
      qc.setQueryData<any[]>(["products"], (old) =>
        old ? old.filter((p) => String(p.id) !== targetId && String(p.slug) !== targetId) : old,
      );

      return { prevAdmin, prevPublic, prevProducts };
    },
    onError: (_err, _vars, context) => {
      if (context?.prevAdmin) qc.setQueryData(["admin", "products"], context.prevAdmin);
      if (context?.prevPublic) qc.setQueryData(["public", "products"], context.prevPublic);
      if (context?.prevProducts) qc.setQueryData(["products"], context.prevProducts);
    },
    onSettled: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "products"] });
      await qc.invalidateQueries({ queryKey: ["public", "products"] });
      await qc.invalidateQueries({ queryKey: ["products"] });
      await qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });

  const toggleStock = useMutation({
    mutationKey: ["products", "stock"],
    mutationFn: async (row: ProductRow) => {
      const targetId = String(row.id || row.slug);
      const nextStock = !row.in_stock;

      const { error } = await sb
        .from("products")
        .update({ in_stock: nextStock })
        .eq("id", targetId);
      if (error) throw error;
      return { id: targetId, nextStock };
    },
    onMutate: async (row: ProductRow) => {
      const targetId = String(row.id || row.slug);
      const nextStock = !row.in_stock;

      // Cancel outgoing queries to prevent overwriting optimistic UI
      await qc.cancelQueries({ queryKey: ["admin", "products"] });
      await qc.cancelQueries({ queryKey: ["public", "products"] });
      await qc.cancelQueries({ queryKey: ["products"] });

      // Snapshot previous states for rollback
      const prevAdmin = qc.getQueryData<ProductRow[]>(["admin", "products"]);
      const prevPublic = qc.getQueryData<any[]>(["public", "products"]);
      const prevProducts = qc.getQueryData<any[]>(["products"]);

      // Immediately reflect stock change across admin and public caches
      if (prevAdmin) {
        qc.setQueryData<ProductRow[]>(["admin", "products"], (old) => {
          if (!old) return old;
          return old.map((p) => {
            const pId = String(p.id ?? "");
            const pSlug = String(p.slug ?? "");
            if (pId === targetId || pSlug === targetId) {
              return { ...p, in_stock: nextStock };
            }
            return p;
          });
        });
      }

      if (prevPublic) {
        qc.setQueryData<any[]>(["public", "products"], (old) => {
          if (!old) return old;
          return old.map((p) => {
            const pId = String(p.id ?? "");
            const pSlug = String(p.slug ?? "");
            if (pId === targetId || pSlug === targetId) {
              return { ...p, in_stock: nextStock };
            }
            return p;
          });
        });
      }

      if (prevProducts) {
        qc.setQueryData<any[]>(["products"], (old) => {
          if (!old) return old;
          return old.map((p) => {
            const pId = String(p.id ?? "");
            const pSlug = String(p.slug ?? "");
            if (pId === targetId || pSlug === targetId) {
              return { ...p, in_stock: nextStock };
            }
            return p;
          });
        });
      }

      return { prevAdmin, prevPublic, prevProducts };
    },
    onError: (_err, _vars, context) => {
      if (context?.prevAdmin) {
        qc.setQueryData(["admin", "products"], context.prevAdmin);
      }
      if (context?.prevPublic) {
        qc.setQueryData(["public", "products"], context.prevPublic);
      }
      if (context?.prevProducts) {
        qc.setQueryData(["products"], context.prevProducts);
      }
    },
    onSettled: async () => {
      // Invalidate strictly after promise settles. If another stock toggle is in flight, let the last one trigger it.
      if (qc.isMutating({ mutationKey: ["products", "stock"] }) <= 1) {
        await qc.invalidateQueries({ queryKey: ["admin", "products"] });
        await qc.invalidateQueries({ queryKey: ["public", "products"] });
        await qc.invalidateQueries({ queryKey: ["products"] });
        await qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      }
    },
  });

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-slate-600">{rows.length} product{rows.length === 1 ? "" : "s"}</p>
        <button
          onClick={() => setEditing(empty)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> New product
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {isLoading ? (
          <p className="p-6 text-sm text-slate-500">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No products yet. Add your first product.</p>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{r.name}</p>
                    <p className="text-xs text-slate-500">{r.slug}</p>
                  </td>
                  <td className="px-4 py-3 capitalize text-slate-600">{r.category}</td>
                  <td className="px-4 py-3 text-slate-900">Rs {Number(r.price).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleStock.mutate(r)}
                      className={`rounded-full px-2 py-0.5 text-xs transition-colors ${
                        r.in_stock
                          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          : "bg-red-50 text-red-700 hover:bg-red-100"
                      }`}
                      title="Click to toggle stock"
                    >
                      {r.in_stock ? "In stock" : "Out of stock"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setEditing(r)}
                      className="mr-2 inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                    >
                      <Pencil className="h-3 w-3" /> Edit
                    </button>
                    <button
                      onClick={() => confirm(`Delete "${r.name}"?`) && del.mutate(r.id)}
                      className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {editing && (
        <EditModal
          value={editing}
          onClose={() => setEditing(null)}
          onSave={(v) => save.mutate(v)}
          saving={save.isPending}
        />
      )}
    </div>
  );
}

function EditModal({
  value,
  onClose,
  onSave,
  saving,
}: {
  value: Partial<ProductRow>;
  onClose: () => void;
  onSave: (v: Partial<ProductRow>) => void;
  saving: boolean;
}) {
  const [v, setV] = useState<Partial<ProductRow>>(value);
  const set = <K extends keyof ProductRow>(k: K, val: ProductRow[K]) => setV((p) => ({ ...p, [k]: val }));

  const variants: ProductVariantRow[] = Array.isArray(v.variants) ? v.variants : [];
  const setVariants = (next: ProductVariantRow[]) => set("variants", next);
  const addVariant = () =>
    setVariants([...variants, { size: "", price: 0, original_price: null, sku: "", in_stock: true }]);
  const updateVariant = (i: number, patch: Partial<ProductVariantRow>) =>
    setVariants(variants.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  const removeVariant = (i: number) => setVariants(variants.filter((_, idx) => idx !== i));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-base font-semibold">{v.id ? "Edit Product" : "New Product"}</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-slate-500" /></button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(v);
          }}
          className="max-h-[70vh] space-y-4 overflow-y-auto p-6"
        >
          <Field label="Name">
            <input required className="input" value={v.name ?? ""} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field label="Slug (URL id, e.g. wireless-earbuds-pro)">
            <input required className="input" value={v.slug ?? ""} onChange={(e) => set("slug", e.target.value)} />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Category">
              <select className="input" value={v.category ?? "tech"} onChange={(e) => set("category", e.target.value)}>
                <option value="tech">Tech</option>
                <option value="perfume">Perfume</option>
              </select>
            </Field>
            <Field label="Subcategory">
              <input className="input" value={v.subcategory ?? ""} onChange={(e) => set("subcategory", e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Price (Rs)">
              <input type="number" required className="input" value={v.price ?? 0} onChange={(e) => set("price", Number(e.target.value))} />
            </Field>
            <Field label="Original Price">
              <input type="number" className="input" value={v.original_price ?? 0} onChange={(e) => set("original_price", Number(e.target.value))} />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Rating">
              <input type="number" step="0.1" max={5} className="input" value={v.rating ?? 5} onChange={(e) => set("rating", Number(e.target.value))} />
            </Field>
            <Field label="Reviews">
              <input type="number" className="input" value={v.reviews ?? 0} onChange={(e) => set("reviews", Number(e.target.value))} />
            </Field>
            <Field label="Badge">
              <select className="input" value={v.badge ?? ""} onChange={(e) => set("badge", e.target.value || null)}>
                <option value="">None</option>
                <option value="New">New</option>
                <option value="Sale">Sale</option>
                <option value="Bestseller">Bestseller</option>
              </select>
            </Field>
          </div>
          <ImagePicker label="Image" value={v.image ?? ""} onChange={(val) => set("image", val)} />
          <Field label="SKU">
            <input className="input" value={v.sku ?? ""} onChange={(e) => set("sku", e.target.value)} />
          </Field>
          <Field label="Description">
            <textarea rows={4} className="input" value={v.description ?? ""} onChange={(e) => set("description", e.target.value)} />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={v.in_stock ?? true} onChange={(e) => set("in_stock", e.target.checked)} />
            In stock
          </label>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">Size / Variant options</p>
                <p className="text-xs text-slate-500">
                  Add sizes (e.g. 5ml, 50ml, 100ml) with their own prices. If empty, only the base price above is used.
                </p>
              </div>
              <button
                type="button"
                onClick={addVariant}
                className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-slate-700"
              >
                <Plus className="h-3 w-3" /> Add size
              </button>
            </div>
            {variants.length === 0 ? (
              <p className="py-2 text-xs text-slate-500">No variants yet.</p>
            ) : (
              <div className="space-y-2">
                {variants.map((vr, i) => (
                  <div key={i} className="grid grid-cols-2 gap-2 rounded-md border border-slate-200 bg-white p-2 sm:grid-cols-12">
                    <input
                      className="input sm:col-span-3"
                      placeholder="Size (e.g. 50ml)"
                      value={vr.size}
                      onChange={(e) => updateVariant(i, { size: e.target.value })}
                    />
                    <input
                      type="number"
                      className="input sm:col-span-3"
                      placeholder="Price"
                      value={vr.price}
                      onChange={(e) => updateVariant(i, { price: Number(e.target.value) })}
                    />
                    <input
                      type="number"
                      className="input sm:col-span-2"
                      placeholder="Orig."
                      value={vr.original_price ?? ""}
                      onChange={(e) =>
                        updateVariant(i, { original_price: e.target.value ? Number(e.target.value) : null })
                      }
                    />
                    <input
                      className="input sm:col-span-3"
                      placeholder="SKU"
                      value={vr.sku ?? ""}
                      onChange={(e) => updateVariant(i, { sku: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => removeVariant(i)}
                      className="col-span-2 inline-flex items-center justify-center rounded-md border border-red-200 py-2 text-red-600 hover:bg-red-50 sm:col-span-1 sm:py-0"
                      aria-label="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-sm">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-700">{label}</label>
      {children}
    </div>
  );
}
