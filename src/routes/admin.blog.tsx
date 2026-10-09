import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Pencil, X } from "lucide-react";
import { sb, type BlogRow } from "@/lib/adminApi";
import ImagePicker from "@/components/admin/ImagePicker";

export const Route = createFileRoute("/admin/blog")({
  component: AdminBlog,
});

const empty: Partial<BlogRow> = {
  slug: "",
  title: "",
  excerpt: "",
  category: "",
  image: "",
  content: "",
  published: true,
};

function AdminBlog() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<BlogRow> | null>(null);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin", "blog"],
    queryFn: async () => {
      try {
        const { data, error } = await sb.from("blog_posts").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        return (data ?? []) as BlogRow[];
      } catch (err) {
        console.warn("[AdminBlog] Supabase connection unavailable:", err);
        return [];
      }
    },
    retry: false,
  });

  const save = useMutation({
    mutationFn: async (row: Partial<BlogRow>) => {
      if (row.id) {
        const { error } = await sb.from("blog_posts").update(row).eq("id", row.id);
        if (error) throw error;
      } else {
        const { error } = await sb.from("blog_posts").insert(row);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "blog"] });
      qc.invalidateQueries({ queryKey: ["public", "blog"] });
      qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      setEditing(null);
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await sb.from("blog_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "blog"] });
      qc.invalidateQueries({ queryKey: ["public", "blog"] });
      qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-slate-600">{rows.length} post{rows.length === 1 ? "" : "s"}</p>
        <button
          onClick={() => setEditing(empty)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> New post
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {isLoading ? (
          <p className="p-6 text-sm text-slate-500">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No posts yet.</p>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{r.title}</p>
                    <p className="text-xs text-slate-500">{r.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{r.category ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${r.published ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      {r.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setEditing(r)} className="mr-2 inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50">
                      <Pencil className="h-3 w-3" /> Edit
                    </button>
                    <button onClick={() => confirm(`Delete "${r.title}"?`) && del.mutate(r.id)} className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-base font-semibold">{editing.id ? "Edit Post" : "New Post"}</h2>
              <button onClick={() => setEditing(null)}><X className="h-5 w-5 text-slate-500" /></button>
            </div>
            <form
              onSubmit={(e) => { e.preventDefault(); save.mutate(editing); }}
              className="max-h-[70vh] space-y-4 overflow-y-auto p-6"
            >
              <Field label="Title">
                <input required className="input" value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              </Field>
              <Field label="Slug">
                <input required className="input" value={editing.slug ?? ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
              </Field>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Category">
                  <input className="input" value={editing.category ?? ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
                </Field>
                <ImagePicker label="Image" value={editing.image ?? ""} onChange={(v) => setEditing({ ...editing, image: v })} />
              </div>
              <Field label="Excerpt">
                <textarea rows={2} className="input" value={editing.excerpt ?? ""} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} />
              </Field>
              <Field label="Content (Markdown or HTML)">
                <textarea rows={10} className="input font-mono text-xs" value={editing.content ?? ""} onChange={(e) => setEditing({ ...editing, content: e.target.value })} />
              </Field>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.published ?? true} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} />
                Published
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm">Cancel</button>
                <button type="submit" disabled={save.isPending} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                  {save.isPending ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
