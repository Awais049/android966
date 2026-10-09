import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { BlogCard } from "@/components/BlogCard";
import { blogTags } from "@/data/blogPosts";
import { useMergedBlogPosts } from "@/lib/publicContent";
import { createPageHead, getBreadcrumbSchema } from "@/lib/seo";

export const Route = createFileRoute("/blog/")({
  head: () =>
    createPageHead({
      title: "Tech Blog, Reviews & Guides | Android 966",
      description:
        "Read smartphone reviews, tech buying guides, comparisons, and fragrance insights tailored for Pakistani consumers from Android 966.",
      path: "/blog",
      keywords: [
        "tech blog pakistan",
        "smartphone reviews urdu",
        "budget phones pakistan",
        "android 966 blog",
        "tech guides karachi",
      ],
      jsonLd: [
        getBreadcrumbSchema([
          { name: "Home", item: "/" },
          { name: "Blog", item: "/blog" },
        ]),
      ],
    }),
  component: BlogPage,
});

function BlogPage() {
  const [activeTag, setActiveTag] = useState("All Posts");
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(6);
  const { posts: blogPosts } = useMergedBlogPosts();

  const filtered = useMemo(() => {
    let result = blogPosts;
    if (activeTag !== "All Posts") {
      result = result.filter((p) => p.tag === activeTag);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter((p) => p.title.toLowerCase().includes(q));
    }
    return result;
  }, [blogPosts, activeTag, query]);

  const featured = blogPosts.filter((p) => p.featured).slice(0, 3);
  const featuredMain = featured[0];
  const featuredSide = featured.slice(1, 3);
  const latest = filtered.slice(0, visibleCount);

  return (
    <div className="bg-white pt-5 pb-10 sm:pt-6 sm:pb-12">
      <div className="a9-container">
        {/* Hero */}
        <div className="mb-8 rounded-xl border border-border bg-bg2 p-8 text-center sm:py-10">
          <h1 className="text-3xl font-bold tracking-tight text-text sm:text-4xl">
            Tech Blog, Buying Guides & Reviews
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-neutral sm:text-base">
            Latest smartphone reviews, tech tips, unboxings, fragrance guides, and budget picks
            tailored for Pakistan.
          </p>
          <div className="mx-auto mt-5 max-w-xl">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral" />
              <input
                type="text"
                placeholder="Search articles..."
                className="a9-input w-full pl-10!"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="-mx-1 mb-8 flex items-center gap-2 overflow-x-auto px-1 py-2.5 no-scrollbar">
          {blogTags.map((tag) => (
            <button
              key={tag}
              className={`min-h-[38px] px-4 py-1.5 transition-colors ${
                activeTag === tag ? "chip-active whitespace-nowrap" : "chip whitespace-nowrap"
              }`}
              onClick={() => setActiveTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Featured */}
        {query === "" && activeTag === "All Posts" && (
          <div className="mb-10">
            <h2 className="mb-4 text-xl font-bold text-text">Featured Stories</h2>
            <div className="grid gap-5 lg:grid-cols-2">
              {featuredMain && <BlogCard post={featuredMain} size="large" />}
              <div className="flex flex-col gap-5">
                {featuredSide.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Latest Articles */}
        <h2 className="mb-6 text-xl font-bold text-text">Latest Articles</h2>
        {latest.length === 0 ? (
          <p className="text-center text-neutral py-10">No articles found matching your search.</p>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {latest.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
            {visibleCount < filtered.length && (
              <div className="mt-8 text-center">
                <button
                  className="btn-outline min-h-[44px]"
                  onClick={() => setVisibleCount((c) => c + 3)}
                >
                  Load More Articles
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
