import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Pencil, X, Search } from "lucide-react";
import { sb, type ProductRow } from "@/lib/adminApi";
import ImagePicker from "@/components/admin/ImagePicker";
import {
  PLACEMENTS,
  THEMES,
  STYLES,
  type BannerPlacement,
  type BannerStyle,
  type BannerTheme,
  type BannerType,
  type PromoBanner,
} from "@/lib/banners";

export const Route = createFileRoute("/admin/banners")({
  component: AdminBanners,
});

const empty: Partial<PromoBanner> = {
  title: "",
  subtitle: "",
  cta_text: "",
  cta_link: "",
  image: "",
  theme: "brand",
  style: "strip",
  placement: "home_top",
  banner_type: "promo",
  discount_percent: 0,
  product_slugs: [],
  active: true,
  sort_order: 0,
};

function AdminBanners() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<PromoBanner> | null>(null);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin", "banners"],
    queryFn: async () => {
      try {
        const { data, error } = await sb
          .from("promo_banners")
          .select("*")
          .order("sort_order", { ascending: true });
        if (error) throw error;
        return (data ?? []) as PromoBanner[];
      } catch (err) {
        console.warn("[AdminBanners] Supabase connection unavailable:", err);
        return [];
      }
    },
    retry: false,
  });

  const save = useMutation({
    mutationFn: async (row: Partial<PromoBanner>) => {
      const payload: Record<string, unknown> = { ...row };
      // Normalise
      if (payload.discount_percent == null || payload.discount_percent === "")
        payload.discount_percent = 0;
      if (!Array.isArray(payload.product_slugs)) payload.product_slugs = [];
      if (payload.starts_at === "") payload.starts_at = null;
      if (payload.ends_at === "") payload.ends_at = null;
      if (payload.id) {
        const { error } = await sb.from("promo_banners").update(payload).eq("id", payload.id);
        if (error) throw error;
      } else {
        const { error } = await sb.from("promo_banners").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "banners"] });
      qc.invalidateQueries({ queryKey: ["public", "banners"] });
      setEditing(null);
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await sb.from("promo_banners").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "banners"] });
      qc.invalidateQueries({ queryKey: ["public", "banners"] });
    },
  });

  const toggleActive = useMutation({
    mutationFn: async (b: PromoBanner) => {
      const { error } = await sb
        .from("promo_banners")
        .update({ active: !b.active })
        .eq("id", b.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "banners"] });
      qc.invalidateQueries({ queryKey: ["public", "banners"] });
    },
  });

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-slate-600">
          {rows.length} banner{rows.length === 1 ? "" : "s"}
        </p>
        <button
          onClick={() => setEditing(empty)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> New banner
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {isLoading ? (
          <p className="p-6 text-sm text-slate-500">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">
            No banners yet. Create your first promotional banner.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {rows.map((r) => (
              <div key={r.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-slate-900">{r.title}</p>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-600">
                      {r.placement.replace(/_/g, " ")}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-600">
                      {r.style}
                    </span>
                    {r.banner_type === "discount" && (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                        {Math.round(Number(r.discount_percent) || 0)}% OFF
                      </span>
                    )}
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        r.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {r.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  {r.subtitle && (
                    <p className="mt-1 truncate text-xs text-slate-500">{r.subtitle}</p>
                  )}
                  {r.banner_type === "discount" && r.product_slugs?.length > 0 && (
                    <p className="mt-1 text-xs text-slate-500">
                      Applies to {r.product_slugs.length} product
                      {r.product_slugs.length === 1 ? "" : "s"}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleActive.mutate(r)}
                    className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    {r.active ? "Disable" : "Enable"}
                  </button>
                  <button
                    onClick={() => setEditing(r)}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    <Pencil className="h-3 w-3" /> Edit
                  </button>
                  <button
                    onClick={() => confirm(`Delete banner "${r.title}"?`) && del.mutate(r.id)}
                    className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </div>
              </div>
            ))}
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
  value: Partial<PromoBanner>;
  onClose: () => void;
  onSave: (v: Partial<PromoBanner>) => void;
  saving: boolean;
}) {
  const [v, setV] = useState<Partial<PromoBanner>>(value);
  const set = <K extends keyof PromoBanner>(k: K, val: PromoBanner[K]) =>
    setV((p) => ({ ...p, [k]: val }));

  const [productSearch, setProductSearch] = useState("");
  const { data: products = [] } = useQuery({
    queryKey: ["admin", "products", "for-banner"],
    queryFn: async () => {
      const { data, error } = await sb
        .from("products")
        .select("slug,name,category,price")
        .order("name", { ascending: true });
      if (error) throw error;
      return data as Pick<ProductRow, "slug" | "name" | "category" | "price">[];
    },
  });

  const selected = new Set(v.product_slugs ?? []);
  const toggleProduct = (slug: string) => {
    const next = new Set(selected);
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    set("product_slugs", Array.from(next));
  };

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    );
  }, [products, productSearch]);

  const isDiscount = v.banner_type === "discount";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-base font-semibold">
            {v.id ? "Edit Banner" : "New Banner"}
          </h2>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(v);
          }}
          className="max-h-[75vh] space-y-4 overflow-y-auto p-6"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Type">
              <select
                className="input"
                value={v.banner_type ?? "promo"}
                onChange={(e) => set("banner_type", e.target.value as BannerType)}
              >
                <option value="promo">Promo (announcement)</option>
                <option value="discount">Discount (applies % off products)</option>
              </select>
            </Field>
            <Field label="Placement">
              <select
                className="input"
                value={v.placement ?? "home_top"}
                onChange={(e) => set("placement", e.target.value as BannerPlacement)}
              >
                {PLACEMENTS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Title">
            <input
              required
              className="input"
              value={v.title ?? ""}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Big Summer Sale"
            />
          </Field>
          <Field label="Subtitle (optional)">
            <input
              className="input"
              value={v.subtitle ?? ""}
              onChange={(e) => set("subtitle", e.target.value)}
              placeholder="Up to 30% off selected tech & fragrances"
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Style">
              <select
                className="input"
                value={v.style ?? "strip"}
                onChange={(e) => set("style", e.target.value as BannerStyle)}
              >
                {STYLES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Theme">
              <select
                className="input"
                value={v.theme ?? "brand"}
                onChange={(e) => set("theme", e.target.value as BannerTheme)}
              >
                {THEMES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="CTA text (optional)">
              <input
                className="input"
                value={v.cta_text ?? ""}
                onChange={(e) => set("cta_text", e.target.value)}
                placeholder="Shop now"
              />
            </Field>
            <Field label="CTA link (optional)">
              <input
                className="input"
                value={v.cta_link ?? ""}
                onChange={(e) => set("cta_link", e.target.value)}
                placeholder="/store or https://…"
              />
            </Field>
          </div>

          <ImagePicker
            label="Background image (optional)"
            value={v.image ?? ""}
            onChange={(val) => set("image", val)}
          />

          {isDiscount && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4">
              <p className="text-sm font-semibold text-emerald-800">Discount configuration</p>
              <p className="text-xs text-emerald-700/80">
                Discount % is automatically applied to the selected products across the site.
              </p>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Discount percent (0–100)">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step="0.5"
                    className="input"
                    value={v.discount_percent ?? 0}
                    onChange={(e) => set("discount_percent", Number(e.target.value))}
                  />
                </Field>
                <Field label="Selected">
                  <p className="input flex items-center bg-white text-sm text-slate-700">
                    {(v.product_slugs ?? []).length} product
                    {(v.product_slugs ?? []).length === 1 ? "" : "s"}
                  </p>
                </Field>
              </div>

              <div className="mt-3">
                <div className="relative mb-2">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    className="input w-full pl-9"
                    placeholder="Search products…"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                  />
                </div>
                <div className="max-h-64 overflow-y-auto rounded-lg border border-emerald-200 bg-white">
                  {filteredProducts.length === 0 ? (
                    <p className="p-3 text-xs text-slate-500">No products.</p>
                  ) : (
                    filteredProducts.map((p) => (
                      <label
                        key={p.slug}
                        className="flex cursor-pointer items-center gap-2 border-b border-slate-100 px-3 py-2 text-sm last:border-b-0 hover:bg-slate-50"
                      >
                        <input
                          type="checkbox"
                          checked={selected.has(p.slug)}
                          onChange={() => toggleProduct(p.slug)}
                        />
                        <span className="flex-1 truncate">{p.name}</span>
                        <span className="text-xs capitalize text-slate-500">{p.category}</span>
                        <span className="text-xs text-slate-500">
                          Rs {Number(p.price).toLocaleString()}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Starts at (optional)">
              <input
                type="datetime-local"
                className="input"
                value={toLocalInput(v.starts_at)}
                onChange={(e) => set("starts_at", fromLocalInput(e.target.value))}
              />
            </Field>
            <Field label="Ends at (optional)">
              <input
                type="datetime-local"
                className="input"
                value={toLocalInput(v.ends_at)}
                onChange={(e) => set("ends_at", fromLocalInput(e.target.value))}
              />
            </Field>
            <Field label="Sort order">
              <input
                type="number"
                className="input"
                value={v.sort_order ?? 0}
                onChange={(e) => set("sort_order", Number(e.target.value))}
              />
            </Field>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={v.active ?? true}
              onChange={(e) => set("active", e.target.checked)}
            />
            Active (show on site)
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
            >
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

function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

function fromLocalInput(v: string): string | null {
  if (!v) return null;
  const d = new Date(v);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-700">{label}</label>
      {children}
    </div>
  );
}
