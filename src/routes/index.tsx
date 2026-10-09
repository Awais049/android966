import { useState } from "react";
import { Link, useNavigate, createFileRoute } from "@tanstack/react-router";
import { Youtube, Facebook, Store, Play, Search, Sparkles } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { BlogCard } from "@/components/BlogCard";
import { SectionHeader } from "@/components/SectionHeader";
import { useMergedProducts, useMergedBlogPosts } from "@/lib/publicContent";
import { useSiteSettings } from "@/lib/siteSettings";
import { BannerSlot } from "@/components/PromoBanner";
import { useLogoUrl } from "@/lib/useLogo";
import { createPageHead } from "@/lib/seo";

const filterChips = [
  { label: "All", value: "all" },
  { label: "Tech Products", value: "tech" },
  { label: "Perfumes", value: "perfume" },
  { label: "Blogs", value: "blog" },
];

export const Route = createFileRoute("/")({
  head: () =>
    createPageHead({
      title: "Android 966 — Tech Reviews, Gadgets & Online Store",
      description:
        "Pakistan's trusted tech channel & online store. Watch honest smartphone reviews, tech unboxings, and buy premium tech gadgets and fragrances with JazzCash.",
      path: "/",
      keywords: [
        "Android 966 official store",
        "tech reviews Pakistan",
        "Awais Ahmed YouTube",
        "buy smartphones Pakistan",
        "fragrances online Pakistan",
        "best tech gadgets Pakistan",
      ],
      ogType: "website",
    }),
  component: HomePage,
});

function HomePage() {
  const [activeChip, setActiveChip] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate({ from: "/" });
  const settings = useSiteSettings();
  const logoUrl = useLogoUrl();
  const { products } = useMergedProducts();
  const { posts } = useMergedBlogPosts();
  const featuredProducts = (
    products.filter((p) => p.badge).length > 0 ? products.filter((p) => p.badge) : products
  ).slice(0, 4);
  const latestPosts = posts.slice(0, 3);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate({ to: "/store", search: { q: searchQuery.trim() } });
    } else {
      navigate({ to: "/store" });
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="overflow-hidden border-b border-border bg-white">
        <div className="a9-container grid min-w-0 gap-8 pt-4 pb-8 sm:pt-6 sm:pb-10 lg:grid-cols-2 lg:pt-8 lg:pb-12 lg:items-center">
          {/* Left */}
          <div className="flex min-w-0 flex-col justify-center overflow-hidden">
            <div className="mb-5 flex min-w-0 max-w-full items-center gap-3 overflow-hidden">
              <img
                src={logoUrl}
                alt="Android 966 logo"
                className="a9-logo-img h-14 w-14 shrink-0 overflow-hidden rounded-xl object-cover shadow-sm"
              />
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <span className="h-2 w-2 shrink-0 rounded-full bg-brand" />
                <span className="truncate text-xs font-medium uppercase tracking-wider text-secondary-label">
                  {settings.hero_tag}
                </span>
              </div>
            </div>
            <h1 className="max-w-full break-words text-[clamp(1.75rem,7vw,2.25rem)] font-semibold leading-tight text-text sm:text-4xl lg:text-5xl">
              {settings.hero_title}{" "}
              <span className="text-brand">{settings.hero_title_highlight}</span>
            </h1>
            <p className="mt-4 max-w-lg break-words text-base leading-relaxed text-text2">
              {settings.hero_subtitle}
            </p>
            <div className="mt-6 grid min-w-0 grid-cols-1 gap-3 min-[360px]:grid-cols-2 sm:flex sm:flex-wrap">
              <Link to="/store" className="btn-primary w-full sm:w-auto">
                Shop Now
              </Link>
              <a
                href={settings.youtube_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline w-full sm:w-auto"
              >
                <Play className="mr-2 h-4 w-4" />
                Watch Videos
              </a>
            </div>
            <div className="mt-8 grid min-w-0 grid-cols-3 gap-3 sm:flex sm:gap-8">
              <Stat value={settings.stat_1_value} label={settings.stat_1_label} />
              <Stat value={settings.stat_2_value} label={settings.stat_2_label} />
              <Stat value={settings.stat_3_value} label={settings.stat_3_label} />
            </div>
          </div>

          {/* Right */}
          <div className="flex min-w-0 flex-col gap-4">
            <SocialCard
              icon={<Youtube className="h-6 w-6 text-red-600" />}
              label="YouTube"
              handle="@Android966"
              href={settings.youtube_url}
              bg="#fff1f2"
            />
            <SocialCard
              icon={<Facebook className="h-6 w-6 text-blue-600" />}
              label="Facebook"
              handle="/Android966"
              href={settings.facebook_url}
              bg="#eff6ff"
            />
            <Link to="/store" className="block">
              <div className="rounded-xl border border-brand bg-brand-soft p-5 transition-colors hover:bg-[#e0eaff]">
                <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
                    <Store className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-brand">Official Store</p>
                    <p className="truncate text-sm text-secondary-label">Tech & Perfumes</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Admin banner slot — home top */}
      <div className="a9-container pt-4">
        <BannerSlot placement="home_top" />
      </div>

      {/* Search + Filter */}
      <section className="border-b border-border bg-bg2">
        <div className="a9-container grid min-w-0 gap-3 py-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div className="relative min-w-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral" />
            <input
              type="text"
              placeholder="Search products, reviews, tips..."
              className="a9-input w-full pl-10!"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <div className="-mx-1 flex min-w-0 items-center gap-2 overflow-x-auto px-1 py-1.5 md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:py-0">
            {filterChips.map((chip) => (
              <button
                key={chip.value}
                className={activeChip === chip.value ? "chip-active" : "chip"}
                onClick={() => setActiveChip(chip.value)}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-background py-16">
        <div className="a9-container">
          <SectionHeader title="Shop by Category" linkTo="/store" linkLabel="View all" />
          <div className="grid gap-5 sm:grid-cols-2">
            <Link
              to="/store"
              search={{ category: "tech" }}
              className="group block focus:outline-none focus:ring-2 focus:ring-brand rounded-2xl"
            >
              <div className="a9-card overflow-hidden transition-all duration-300 group-hover:shadow-md group-hover:-translate-y-0.5">
                <img
                  src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=400&fit=crop"
                  alt="Curated collection of smartphones, wireless earbuds, smartwatches and tech accessories at Android 966 Pakistan"
                  className="h-36 sm:h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-text group-hover:text-brand transition-colors">
                    Tech Products
                  </h3>
                  <p className="mt-1 text-sm text-neutral">
                    Smartphones, Accessories, Gadgets & More
                  </p>
                  <span className="mt-3 inline-block text-sm font-medium text-brand">
                    Shop Now →
                  </span>
                </div>
              </div>
            </Link>
            <Link
              to="/store"
              search={{ category: "perfume" }}
              className="group block focus:outline-none focus:ring-2 focus:ring-brand rounded-2xl"
            >
              <div className="a9-card overflow-hidden transition-all duration-300 group-hover:shadow-md group-hover:-translate-y-0.5">
                <img
                  src="https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&h=400&fit=crop"
                  alt="Premium luxury fragrances, designer attars and body mists collection by Android 966"
                  className="h-36 sm:h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-text group-hover:text-brand transition-colors">
                    Perfumes
                  </h3>
                  <p className="mt-1 text-sm text-neutral">Fragrances, Attars, Body Mist</p>
                  <span className="mt-3 inline-block text-sm font-medium text-brand">
                    Shop Now →
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="border-t border-border bg-bg2 py-16">
        <div className="a9-container">
          <div className="mb-6">
            <BannerSlot placement="home_middle" />
          </div>
          <SectionHeader title="Featured Products" linkTo="/store" linkLabel="View store" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Latest Blog */}
      <section className="border-t border-border bg-background py-16">
        <div className="a9-container">
          <SectionHeader title="Latest from Blog" linkTo="/blog" linkLabel="All blogs" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {latestPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="min-w-0 overflow-hidden">
      <p className="truncate font-serif text-xl text-foreground sm:text-3xl">{value}</p>
      <p className="mt-1 break-words text-[10px] uppercase tracking-[0.08em] text-neutral sm:text-[11px] sm:tracking-[0.18em]">
        {label}
      </p>
    </div>
  );
}

function GoldStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-serif text-3xl text-[#c9a84c]">{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-white/60">{label}</p>
    </div>
  );
}

function DarkSocialCard({
  icon,
  label,
  handle,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  handle: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-4 rounded-md border border-white/15 bg-white/[0.03] p-5 text-white transition-colors hover:bg-white/[0.07]"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-md border border-[#c9a84c]/40 text-[#c9a84c]">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-sm text-white/60">{handle}</p>
      </div>
    </a>
  );
}

function SocialCard({
  icon,
  label,
  handle,
  href,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  handle: string;
  href: string;
  bg: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="a9-card grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 p-5"
    >
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: bg }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-text">{label}</p>
        <p className="truncate text-sm text-neutral">{handle}</p>
      </div>
    </a>
  );
}
