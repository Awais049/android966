import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Youtube, ArrowLeft, Play } from "lucide-react";
import { sb, type VideoRow } from "@/lib/adminApi";
import { extractYouTubeId } from "@/lib/youtube";
import { mockVideos } from "@/data/videos";
import { createPageHead, getVideoSchema, getBreadcrumbSchema } from "@/lib/seo";

export const Route = createFileRoute("/videos/$videoId")({
  head: ({ params }) => {
    const v = mockVideos.find((item) => item.id === params.videoId);
    const title = v ? `${v.title} | Android 966` : "Tech Video Review | Android 966";
    const description = v
      ? (v.description ? v.description.slice(0, 155) : `Watch ${v.title} review and unboxing by Android 966.`)
      : "Watch smartphone unboxings and tech gadget video reviews by Android 966.";

    const jsonLd = v
      ? [
          getVideoSchema(v),
          getBreadcrumbSchema([
            { name: "Home", item: "/" },
            { name: "Videos", item: "/videos" },
            { name: v.title, item: `/videos/${v.id}` },
          ]),
        ]
      : [
          getBreadcrumbSchema([
            { name: "Home", item: "/" },
            { name: "Videos", item: "/videos" },
          ]),
        ];

    return createPageHead({
      title,
      description,
      path: `/videos/${params.videoId}`,
      keywords: v ? [v.title, "tech review", "android 966", "urdu tech video"] : ["tech videos"],
      jsonLd,
      ogType: "video",
    });
  },
  component: VideoDetailPage,
});

function VideoDetailPage() {
  const { videoId } = Route.useParams();

  const { data: video, isLoading } = useQuery({
    queryKey: ["public", "video", videoId],
    queryFn: async () => {
      try {
        const { data, error } = await sb.from("videos").select("*").eq("id", videoId).maybeSingle();
        if (error) throw error;
        return (data as VideoRow | null) ?? mockVideos.find((v) => v.id === videoId) ?? mockVideos[0] ?? null;
      } catch (err) {
        console.warn("[VideoDetail] Supabase connection unavailable, using local mock data:", err);
        return mockVideos.find((v) => v.id === videoId) ?? mockVideos[0] ?? null;
      }
    },
    retry: false,
  });

  const { data: related = [] } = useQuery({
    queryKey: ["public", "videos", "related", videoId],
    queryFn: async () => {
      try {
        const { data, error } = await sb
          .from("videos")
          .select("*")
          .neq("id", videoId)
          .order("created_at", { ascending: false })
          .limit(6);
        if (error) throw error;
        const list = (data ?? []) as VideoRow[];
        return list.length > 0 ? list : mockVideos.filter((v) => v.id !== videoId);
      } catch (err) {
        console.warn("[VideoRelated] Supabase connection unavailable, using local mock data:", err);
        return mockVideos.filter((v) => v.id !== videoId);
      }
    },
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="a9-container py-16 text-center text-sm text-neutral">Loading…</div>
    );
  }

  if (!video) {
    return (
      <div className="a9-container py-16 text-center">
        <h1 className="text-2xl font-semibold text-text">Video not found</h1>
        <p className="mt-2 text-sm text-neutral">This video may have been removed.</p>
        <Link to="/videos" className="btn-primary mt-6 inline-block">
          Back to Videos
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="a9-container">
        <Link
          to="/videos"
          className="inline-flex items-center gap-1 text-sm text-neutral hover:text-brand"
        >
          <ArrowLeft className="h-4 w-4" /> All videos
        </Link>

        <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            <div className="overflow-hidden rounded-xl border border-border bg-black">
              <div className="aspect-video w-full">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${extractYouTubeId(video.youtube_id)}`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
            </div>

            <h1 className="mt-5 text-xl font-semibold text-text sm:text-2xl">{video.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-neutral">
              <span>{new Date(video.created_at).toLocaleDateString()}</span>
              <a
                href={`https://www.youtube.com/watch?v=${extractYouTubeId(video.youtube_id)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-brand hover:underline"
              >
                <Youtube className="h-3.5 w-3.5" /> Watch on YouTube
              </a>
            </div>

            {video.description && (
              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-text">
                {video.description}
              </p>
            )}
          </div>

          <aside className="min-w-0">
            <h2 className="mb-3 text-sm font-semibold text-text">More videos</h2>
            <div className="space-y-3">
              {related.map((v) => (
                <Link
                  key={v.id}
                  to="/videos/$videoId"
                  params={{ videoId: v.id }}
                  className="group flex gap-3 overflow-hidden rounded-lg border border-border bg-white p-2 hover:border-brand"
                >
                  <div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded bg-bg2">
                    <img
                      src={
                        v.thumbnail ||
                        `https://img.youtube.com/vi/${extractYouTubeId(v.youtube_id)}/hqdefault.jpg`
                      }
                      alt={`${v.title} — Android 966 video review`}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/30 group-hover:opacity-100">
                      <Play className="h-5 w-5 fill-white text-white" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-xs font-medium text-text group-hover:text-brand">
                      {v.title}
                    </p>
                  </div>
                </Link>
              ))}
              {related.length === 0 && (
                <p className="text-xs text-neutral">No other videos yet.</p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
