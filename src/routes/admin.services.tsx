import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Pencil, X } from "lucide-react";
import { sb, type ServiceRow } from "@/lib/adminApi";
import ImagePicker from "@/components/admin/ImagePicker";

export const Route = createFileRoute("/admin/services")({
  component: AdminServices,
});

const empty: Partial<ServiceRow> = {
  slug: "",
  name: "",
  short_name: "",
  tagline: "",
  icon: "✨",
  hero: "",
  hero_image: "",
  intro: "",
  description: "",
  features: [],
  process: [],
  benefits: [],
  faqs: [],
  sort_order: 0,
  published: true,
};

function AdminServices() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<ServiceRow> | null>(null);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin", "services"],
    queryFn: async () => {
      try {
        const { data, error } = await sb
          .from("services")
          .select("*")
          .order("sort_order", { ascending: true });
        if (error) throw error;
        return (data ?? []) as ServiceRow[];
      } catch (err) {
        console.warn("[AdminServices] Supabase connection unavailable:", err);
        return [];
      }
    },
    retry: false,
  });

  const save = useMutation({
    mutationFn: async (row: Partial<ServiceRow>) => {
      const payload = { ...row };
      if (payload.id) {
        const { error } = await sb.from("services").update(payload).eq("id", payload.id);
        if (error) throw error;
      } else {
        const { error } = await sb.from("services").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "services"] });
      qc.invalidateQueries({ queryKey: ["public", "services"] });
      setEditing(null);
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await sb.from("services").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "services"] });
      qc.invalidateQueries({ queryKey: ["public", "services"] });
    },
  });

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-slate-600">
          {rows.length} service{rows.length === 1 ? "" : "s"} in database (defaults shown on public site until overridden)
        </p>
        <button
          onClick={() => setEditing(empty)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> New service
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {isLoading ? (
          <p className="p-6 text-sm text-slate-500">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No services yet. Add one to override the default list.</p>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Published</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">
                      <span className="mr-2">{r.icon}</span>
                      {r.name}
                    </p>
                    <p className="text-xs text-slate-500">{r.tagline}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{r.slug}</td>
                  <td className="px-4 py-3 text-slate-600">{r.sort_order}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        r.published ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {r.published ? "Live" : "Draft"}
                    </span>
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
  value: Partial<ServiceRow>;
  onClose: () => void;
  onSave: (v: Partial<ServiceRow>) => void;
  saving: boolean;
}) {
  const [v, setV] = useState<Partial<ServiceRow>>(value);
  const set = <K extends keyof ServiceRow>(k: K, val: ServiceRow[K]) =>
    setV((p) => ({ ...p, [k]: val }));

  const [featuresText, setFeaturesText] = useState(JSON.stringify(value.features ?? [], null, 2));
  const [processText, setProcessText] = useState(JSON.stringify(value.process ?? [], null, 2));
  const [benefitsText, setBenefitsText] = useState(JSON.stringify(value.benefits ?? [], null, 2));
  const [faqsText, setFaqsText] = useState(JSON.stringify(value.faqs ?? [], null, 2));
  const [err, setErr] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: Partial<ServiceRow> = {
        ...v,
        features: JSON.parse(featuresText),
        process: JSON.parse(processText),
        benefits: JSON.parse(benefitsText),
        faqs: JSON.parse(faqsText),
      };
      setErr(null);
      onSave(payload);
    } catch (e: unknown) {
      setErr(`Invalid JSON: ${(e as Error).message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-base font-semibold">{v.id ? "Edit Service" : "New Service"}</h2>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>
        <form onSubmit={submit} className="max-h-[75vh] space-y-4 overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Name">
              <input required className="input" value={v.name ?? ""} onChange={(e) => set("name", e.target.value)} />
            </Field>
            <Field label="Short name">
              <input required className="input" value={v.short_name ?? ""} onChange={(e) => set("short_name", e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Slug (e.g. web-development)">
              <input required className="input" value={v.slug ?? ""} onChange={(e) => set("slug", e.target.value)} />
            </Field>
            <Field label="Icon (emoji)">
              <input className="input" value={v.icon ?? ""} onChange={(e) => set("icon", e.target.value)} />
            </Field>
          </div>
          <Field label="Tagline">
            <input className="input" value={v.tagline ?? ""} onChange={(e) => set("tagline", e.target.value)} />
          </Field>
          <Field label="Hero headline">
            <input className="input" value={v.hero ?? ""} onChange={(e) => set("hero", e.target.value)} />
          </Field>
          <ImagePicker label="Hero image" value={v.hero_image ?? ""} onChange={(val) => set("hero_image", val)} />
          <Field label="Intro (short)">
            <textarea rows={2} className="input" value={v.intro ?? ""} onChange={(e) => set("intro", e.target.value)} />
          </Field>
          <Field label="Description (long)">
            <textarea rows={4} className="input" value={v.description ?? ""} onChange={(e) => set("description", e.target.value)} />
          </Field>

          <Field label='Features (JSON: [{"title":"","description":""}])'>
            <textarea rows={5} className="input font-mono text-xs" value={featuresText} onChange={(e) => setFeaturesText(e.target.value)} />
          </Field>
          <Field label='Process (JSON: [{"step":"01","title":"","description":""}])'>
            <textarea rows={5} className="input font-mono text-xs" value={processText} onChange={(e) => setProcessText(e.target.value)} />
          </Field>
          <Field label='Benefits (JSON: ["benefit 1","benefit 2"])'>
            <textarea rows={4} className="input font-mono text-xs" value={benefitsText} onChange={(e) => setBenefitsText(e.target.value)} />
          </Field>
          <Field label='FAQs (JSON: [{"q":"","a":""}])'>
            <textarea rows={5} className="input font-mono text-xs" value={faqsText} onChange={(e) => setFaqsText(e.target.value)} />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Sort order">
              <input type="number" className="input" value={v.sort_order ?? 0} onChange={(e) => set("sort_order", Number(e.target.value))} />
            </Field>
            <label className="mt-6 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={v.published ?? true} onChange={(e) => set("published", e.target.checked)} />
              Published
            </label>
          </div>

          {err && <p className="rounded-md bg-red-50 p-3 text-xs text-red-700">{err}</p>}

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
