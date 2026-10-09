import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Pencil, X, Loader2 } from "lucide-react";
import { sb, type VideoRow } from "@/lib/adminApi";
import { extractYouTubeId } from "@/lib/youtube";

export const Route = createFileRoute("/admin/videos")({
  component: AdminVideos,
});

type EditState = { id?: string; url: string; title: string; description: string };
const empty: EditState = { url: "", title: "", description: "" };

async function fetchYouTubeTitle(videoId: string): Promise<string> {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    );
    if (!res.ok) return "";
    const json = (await res.json()) as { title?: string };
    return json.title ?? "";
  } catch {
    return "";
  }
}

import { mockVideos } from "@/data/videos";

function AdminVideos() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<EditState | null>(null);
  const [fetchingTitle, setFetchingTitle] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin", "videos"],
    queryFn: async () => {
      try {
        const { data, error } = await sb
          .from("videos")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        const list = (data ?? []) as VideoRow[];
        return list.length > 0 ? list : mockVideos;
      } catch (err) {
        console.warn("[AdminVideos] Supabase connection unavailable:", err);
        return mockVideos;
      }
    },
    retry: false,
  });

  const save = useMutation({
    mutationFn: async (row: EditState) => {
      const videoId = extractYouTubeId(row.url);
      if (!videoId || videoId.length !== 11) {
        throw new Error("Please paste a valid YouTube link.");
      }
      let title = row.title.trim();
      if (!title) {
        setFetchingTitle(true);
        title = (await fetchYouTubeTitle(videoId)) || "Untitled video";
        setFetchingTitle(false);
      }
      const payload = {
        title,
        youtube_id: videoId,
        thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        description: row.description,
      };
      if (row.id) {
        const { error } = await sb.from("videos").update(payload).eq("id", row.id);
        if (error) throw error;
      } else {
        const { error } = await sb.from("videos").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "videos"] });
      qc.invalidateQueries({ queryKey: ["public", "videos"] });
      setEditing(null);
      setError(null);
    },
    onError: (e: Error) => setError(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await sb.from("videos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "videos"] });
      qc.invalidateQueries({ queryKey: ["public", "videos"] });
    },
  });

  const startEdit = (v: VideoRow) =>
    setEditing({
      id: v.id,
      url: `https://youtu.be/${v.youtube_id}`,
      title: v.title ?? "",
      description: v.description ?? "",
    });

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-slate-600">
          {rows.length} video{rows.length === 1 ? "" : "s"}
        </p>
        <button
          onClick={() => {
            setError(null);
            setEditing(empty);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> Add YouTube link
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading && <p className="text-sm text-slate-500">Loading…</p>}
        {!isLoading && rows.length === 0 && (
          <p className="text-sm text-slate-500">No videos yet.</p>
        )}
        {rows.map((v) => {
          const id = extractYouTubeId(v.youtube_id);
          return (
            <div key={v.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <a href={`https://youtube.com/watch?v=${id}`} target="_blank" rel="noreferrer">
                <img
                  src={v.thumbnail || `https://img.youtube.com/vi/${id}/hqdefault.jpg`}
                  alt={v.title}
                  className="aspect-video w-full object-cover"
                />
              </a>
              <div className="p-4">
                <p className="line-clamp-2 text-sm font-medium text-slate-900">{v.title}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => startEdit(v)}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    <Pencil className="h-3 w-3" /> Edit
                  </button>
                  <button
                    onClick={() => confirm(`Delete "${v.title}"?`) && del.mutate(v.id)}
                    className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-base font-semibold">
                {editing.id ? "Edit Video" : "Add YouTube Video"}
              </h2>
              <button onClick={() => setEditing(null)}>
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setError(null);
                save.mutate(editing);
              }}
              className="space-y-4 p-6"
            >
              <Field label="YouTube link">
                <input
                  required
                  autoFocus
                  placeholder="https://youtu.be/… or https://www.youtube.com/watch?v=…"
                  className="input"
                  value={editing.url}
                  onChange={(e) => setEditing({ ...editing, url: e.target.value })}
                />
                <p className="mt-1 text-xs text-slate-500">
                  Paste any YouTube link — we'll pull the title and thumbnail automatically.
                </p>
              </Field>
              <Field label="Title (optional — auto-filled from YouTube)">
                <input
                  className="input"
                  placeholder="Leave blank to fetch automatically"
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                />
              </Field>
              <Field label="Description (optional)">
                <textarea
                  rows={3}
                  className="input"
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                />
              </Field>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={save.isPending || fetchingTitle}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {(save.isPending || fetchingTitle) && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {save.isPending || fetchingTitle ? "Saving…" : "Save"}
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
