import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Play, Youtube } from "lucide-react";
import { sb, type VideoRow } from "@/lib/adminApi";
import { extractYouTubeId } from "@/lib/youtube";
import { createPageHead, getBreadcrumbSchema } from "@/lib/seo";

export const Route = createFileRoute("/videos/")({
  head: () =>
    createPageHead({
      title: "Latest Tech Videos & Reviews | Android 966",
      description:
        "Watch unbiased smartphone reviews, unboxings, gadget testing, and Urdu tech tutorials on the official Android 966 video hub.",
      path: "/videos",
      keywords: [
        "tech videos pakistan",
        "smartphone reviews urdu",
        "android 966 youtube",
        "gadget unboxings",
        "tech tutorials urdu",
      ],
      jsonLd: [
        getBreadcrumbSchema([
          { name: "Home", item: "/" },
          { name: "Videos", item: "/videos" },
        ]),
      ],
    }),
  component: VideosPage,
});

const CHANNEL_URL = "https://www.youtube.com/@Android966";

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  if (diff < 2592000) return `${Math.floor(diff / 604800)}w ago`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)}mo ago`;
  return `${Math.floor(diff / 31536000)}y ago`;
}

import { mockVideos } from "@/data/videos";

function VideosPage() {
  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["public", "videos"],
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
        console.warn("[Videos] Supabase connection unavailable, using local mock videos:", err);
        return mockVideos;
      }
    },
    staleTime: 5000,
    refetchOnMount: true,
    retry: false,
  });

  return (
    <div className="min-h-screen bg-bg">
      {/* Hero */}
      <section className="border-b border-border bg-bg2">
        <div className="a9-container pt-6 pb-12 text-center sm:pt-8 sm:pb-16 lg:pt-10 lg:pb-16">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-neutral">
            <Youtube className="h-3.5 w-3.5 text-brand" />
            YouTube · @Android966
          </div>
          <h1 className="mt-4 text-3xl font-bold text-text sm:text-4xl md:text-5xl">
            Latest Videos
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-neutral sm:text-base">
            Stay updated with the latest tech, tutorials, and reviews from Android 966.
          </p>
          <a
            href={CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary mt-6 inline-flex items-center gap-2"
          >
            <Youtube className="h-4 w-4" />
            Subscribe on YouTube
          </a>
        </div>
      </section>

      {/* Grid */}
      <section className="a9-container py-10 sm:py-14">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-text sm:text-2xl">
            Latest Reviews, Unboxings & Guides
          </h2>
          <p className="mt-1 text-sm text-neutral">
            Watch unbiased tests, performance benchmarks, and tech breakdowns.
          </p>
        </div>
        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-border bg-white">
                <div className="aspect-video w-full animate-pulse bg-bg2" />
                <div className="space-y-2 p-4">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-bg2" />
                  <div className="h-3 w-1/3 animate-pulse rounded bg-bg2" />
                </div>
              </div>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="rounded-2xl border border-border bg-white p-10 text-center">
            <Youtube className="mx-auto h-10 w-10 text-brand" />
            <h3 className="mt-3 text-lg font-semibold text-text">No videos yet</h3>
            <p className="mt-1 text-sm text-neutral">
              Head over to our YouTube channel for the latest uploads.
            </p>
            <a
              href={CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-5 inline-flex min-h-[44px] items-center gap-2"
            >
              <Youtube className="h-4 w-4" />
              Visit Channel
            </a>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {videos.map((v) => (
              <Link
                key={v.id}
                to="/videos/$videoId"
                params={{ videoId: v.id }}
                className="group overflow-hidden rounded-xl border border-border bg-white text-left transition-all hover:-translate-y-0.5 hover:border-brand"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-bg2">
                  <img
                    src={
                      v.thumbnail || `https://img.youtube.com/vi/${extractYouTubeId(v.youtube_id)}/hqdefault.jpg`
                    }
                    alt={`${v.title} — Android 966 tech video review`}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/30 group-hover:opacity-100">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-brand shadow-lg">
                      <Play className="h-6 w-6 fill-current" />
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="line-clamp-2 text-sm font-semibold text-text">{v.title}</h3>
                  <div className="mt-2 flex items-center gap-2 text-xs text-neutral">
                    <span>{timeAgo(v.created_at)}</span>
                  </div>
                  {v.description && (
                    <p className="mt-2 line-clamp-2 text-xs text-neutral">{v.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

