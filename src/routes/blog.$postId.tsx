import { createFileRoute, Link } from "@tanstack/react-router";
import { Youtube, Facebook, Link as LinkIcon, CheckCircle2, Play, ExternalLink, Sparkles } from "lucide-react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { BlogCard } from "@/components/BlogCard";
import { getFeaturedProducts } from "@/data/products";
import { blogPosts as staticBlogPosts } from "@/data/blogPosts";
import { useBlogPostBySlug, useMergedBlogPosts } from "@/lib/publicContent";
import { createPageHead, getArticleSchema, getBreadcrumbSchema } from "@/lib/seo";
import { extractYouTubeId } from "@/lib/youtube";

export const Route = createFileRoute("/blog/$postId")({
  head: ({ params }) => {
    const post = staticBlogPosts.find((item) => item.id === params.postId);
    const title = post ? `${post.title} | Android 966` : "Tech Article | Android 966";
    const description = post
      ? (post.metaDescription
          ? post.metaDescription.slice(0, 158)
          : (post.intro ? post.intro.slice(0, 155) : `${post.title} - Read in-depth review & guide by Android 966 Pakistan.`))
      : "Read in-depth tech reviews, buying guides, and news on Android 966 Pakistan.";

    const jsonLd = post
      ? [
          getArticleSchema(post),
          getBreadcrumbSchema([
            { name: "Home", item: "/" },
            { name: "Blog", item: "/blog" },
            { name: post.title, item: `/blog/${post.id}` },
          ]),
        ]
      : [
          getBreadcrumbSchema([
            { name: "Home", item: "/" },
            { name: "Blog", item: "/blog" },
          ]),
        ];

    return createPageHead({
      title,
      description,
      path: `/blog/${params.postId}`,
      keywords: post ? [post.title, post.tag, "tech review pakistan", "android 966 blog"] : ["tech blog"],
      jsonLd,
      ogType: "article",
    });
  },
  component: BlogPostPage,
});

function BlogPostPage() {
  const { postId } = Route.useParams();
  const { post, isLoading } = useBlogPostBySlug(postId);
  const { posts: blogPosts } = useMergedBlogPosts();
  const storeProduct = getFeaturedProducts(1)[0];

  if (isLoading) {
    return <div className="a9-container py-16 text-center text-sm text-neutral">Loading…</div>;
  }
  if (!post) {
    return (
      <div className="a9-container py-16 text-center">
        <h1 className="text-2xl font-semibold text-text">Post not found</h1>
        <p className="mt-2 text-sm text-neutral">The blog post you are looking for does not exist.</p>
        <Link to="/blog" className="mt-6 inline-block btn-primary">
          Browse Blog
        </Link>
      </div>
    );
  }

  const related = blogPosts.filter((p) => p.id !== post.id && p.tag === post.tag).slice(0, 3);
  const relatedOther = blogPosts.filter((p) => p.id !== post.id).slice(0, 3);


  return (
    <div className="bg-white pt-5 pb-10 sm:pt-6 sm:pb-12">
      <div className="a9-container">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Article */}
          <article className="flex-1">
            <Breadcrumb
              items={[
                { label: "Home", to: "/" },
                { label: "Blog", to: "/blog" },
                { label: post.tag, to: "/blog" },
                { label: post.title },
              ]}
            />

            <span className="mt-4 inline-block text-xs font-medium uppercase tracking-wider text-secondary-label">
              {post.tag}
            </span>
            <h1 className="mt-2 text-2xl font-semibold leading-snug text-text lg:text-3xl">
              {post.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">
                A9
              </div>
              <div className="text-sm">
                <p className="font-medium text-text">Android 966</p>
                <p className="text-neutral">
                  {post.date} · {post.readTime} read
                </p>
              </div>
              <span className="chip">{post.tag}</span>
            </div>

            <div
              className="mt-6 overflow-hidden rounded-xl border border-border"
              style={{ backgroundColor: post.bgColor }}
            >
              <img
                src={post.image}
                alt={`${post.title} — Tech Review by Android 966 Pakistan`}
                className="h-[280px] sm:h-[400px] w-full object-cover"
                loading="eager"
              />
            </div>

            <div className="mt-6 space-y-4 text-sm leading-relaxed text-text">
              <p className="text-base text-text leading-relaxed font-normal">{post.intro}</p>
              {post.quote && (
                <blockquote className="rounded-r-lg border-l-4 border-brand bg-bg2 p-4 text-base font-medium italic">
                  {post.quote}
                </blockquote>
              )}

              {/* Dedicated YouTube Video Embed Block */}
              {(post.videoId || post.videoUrl) && (
                <div className="my-8 overflow-hidden rounded-2xl border border-red-200/80 bg-gradient-to-br from-red-50/70 via-white to-white p-5 shadow-sm sm:p-6 dark:border-red-900/40 dark:from-red-950/20 dark:via-bg2 dark:to-bg2">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white shadow-md">
                        <Youtube className="h-5 w-5" />
                      </span>
                      <div>
                        <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-red-600">
                          Video Walkthrough & Demonstration
                        </span>
                        <h2 className="text-base font-bold text-text sm:text-lg">
                          {post.videoTitle || `Watch Video Tutorial: ${post.title}`}
                        </h2>
                      </div>
                    </div>
                    <a
                      href={post.videoUrl || `https://www.youtube.com/watch?v=${extractYouTubeId(post.videoId)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-red-700 active:scale-95 sm:self-auto"
                    >
                      <Youtube className="h-4 w-4" /> Subscribe @Android966
                    </a>
                  </div>

                  <div className="overflow-hidden rounded-xl border border-border bg-black shadow-md">
                    <div className="aspect-video w-full">
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${extractYouTubeId(post.videoId || post.videoUrl)}`}
                        title={post.videoTitle || post.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                        className="h-full w-full"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral">
                    <span>Follow step-by-step alongside the official YouTube video by @Android966.</span>
                    <a
                      href="https://www.youtube.com/@Android966"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-brand hover:underline"
                    >
                      Visit Channel <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}

              {/* Structured Article Sections */}
              {post.body.map((section: any, idx: number) => (
                <div key={idx} className="space-y-3 pt-2">
                  <h2 className="border-b border-border/60 pb-2 text-xl font-bold tracking-tight text-text sm:text-2xl">
                    {section.heading}
                  </h2>
                  {section.paragraphs?.map((para: string, pIdx: number) => (
                    <p key={pIdx} className="leading-relaxed text-text/90">
                      {para}
                    </p>
                  ))}

                  {/* Bullet points if present */}
                  {Array.isArray(section.bullets) && section.bullets.length > 0 && (
                    <ul className="my-3 space-y-2 rounded-xl border border-border/80 bg-bg2/50 p-4">
                      {section.bullets.map((bullet: string, bIdx: number) => (
                        <li key={bIdx} className="flex items-start gap-2.5 text-sm text-text">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Subsections if present */}
                  {Array.isArray(section.subsections) && section.subsections.length > 0 && (
                    <div className="space-y-4 pt-2">
                      {section.subsections.map((sub: any, sIdx: number) => (
                        <div key={sIdx} className="rounded-xl border border-border/70 bg-white p-4 shadow-xs">
                          <h3 className="text-base font-semibold text-text sm:text-lg">
                            {sub.title}
                          </h3>
                          {sub.paragraphs?.map((sp: string, spIdx: number) => (
                            <p key={spIdx} className="mt-2 text-sm leading-relaxed text-text2">
                              {sp}
                            </p>
                          ))}
                          {Array.isArray(sub.bullets) && sub.bullets.length > 0 && (
                            <ul className="mt-3 space-y-1.5 pl-1">
                              {sub.bullets.map((sb: string, sbIdx: number) => (
                                <li key={sbIdx} className="flex items-start gap-2 text-xs text-text sm:text-sm">
                                  <span className="font-bold text-brand">•</span>
                                  <span>{sb}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-emerald-50/50 p-5">
                <h3 className="mb-3 font-semibold text-emerald-700">Pros</h3>
                <ul className="space-y-2">
                  {post.pros.map((pro: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-text">
                      <span className="text-emerald-600">✓</span>
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-border bg-accent-warm-soft/50 p-5">
                <h3 className="mb-3 font-semibold text-accent-warm">Cons</h3>
                <ul className="space-y-2">
                  {post.cons.map((con: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-text">
                      <span className="text-accent-warm">✕</span>
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {post.tags.map((tag: string) => (
                <span key={tag} className="chip">
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-text">Share:</span>
              <a
                href={`https://www.youtube.com/@Android966`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline flex min-h-[44px] items-center gap-2 px-4 py-2"
              >
                <Youtube className="h-4 w-4 text-red-600" />
                YouTube
              </a>
              <a
                href={`https://www.facebook.com/Android966/`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline flex min-h-[44px] items-center gap-2 px-4 py-2"
              >
                <Facebook className="h-4 w-4 text-blue-600" />
                Facebook
              </a>
              <button
                className="btn-outline flex min-h-[44px] items-center gap-2 px-4 py-2"
                onClick={() => navigator.clipboard.writeText(window.location.href)}
              >
                <LinkIcon className="h-4 w-4" />
                Copy Link
              </button>
            </div>

            {/* Related Articles */}
            <div className="mt-10">
              <h2 className="mb-6 text-xl font-semibold text-text">Related Articles</h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {relatedOther.map((p) => (
                  <BlogCard key={p.id} post={p} />
                ))}
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="w-full shrink-0 lg:w-[200px]">
            <div className="rounded-xl border border-border p-4">
              <h3 className="mb-4 text-sm font-semibold text-text">Related Posts</h3>
              <div className="space-y-4">
                {related.map((p) => (
                  <Link
                    key={p.id}
                    to="/blog/$postId"
                    params={{ postId: p.id }}
                    className="block group"
                  >
                    <span className="text-xs font-medium text-secondary-label">{p.tag}</span>
                    <p className="mt-1 text-sm font-medium text-text group-hover:text-brand">
                      {p.title}
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            {storeProduct && (
              <div className="mt-4 rounded-xl border border-brand bg-brand-soft p-4">
                <p className="text-xs font-medium text-brand">From Store</p>
                <p className="mt-1 text-sm font-semibold text-text">{storeProduct.name}</p>
                <p className="mt-1 text-sm font-semibold text-brand">
                  Rs. {storeProduct.price.toLocaleString()}
                </p>
                <Link
                  to="/store/$productId"
                  params={{ productId: storeProduct.id }}
                  className="mt-3 block w-full text-center btn-primary py-2 text-sm"
                >
                  Shop Now
                </Link>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
