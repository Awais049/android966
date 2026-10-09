import { createFileRoute, Link } from "@tanstack/react-router";
import { Youtube, Facebook, Instagram, MessageCircle, Mail, Globe } from "lucide-react";
import { products } from "@/data/products";
import { blogPosts } from "@/data/blogPosts";
import { useLogoUrl } from "@/lib/useLogo";
import { createPageHead, getBreadcrumbSchema } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () =>
    createPageHead({
      title: "About Android 966 | Pakistan Tech & Scents",
      description:
        "Learn the story of Android 966 — Pakistan's honest tech reviews, perfume guides, digital services, and curated online store.",
      path: "/about",
      keywords: [
        "about android 966",
        "tech reviewer pakistan",
        "awais ahmed android 966",
        "tech and fragrance reviews urdu",
      ],
      jsonLd: [
        getBreadcrumbSchema([
          { name: "Home", item: "/" },
          { name: "About", item: "/about" },
        ]),
      ],
    }),
  component: AboutPage,
});

const stats = [
  { label: "Subscribers", value: "20K+", icon: "👥" },
  { label: "Videos", value: "600+", icon: "🎬" },
  { label: "Products", value: products.length.toString(), icon: "📦" },
  { label: "Blog Posts", value: blogPosts.length.toString(), icon: "📝" },
];

const socialLinks = [
  {
    label: "YouTube",
    icon: Youtube,
    color: "text-red-600",
    href: "https://www.youtube.com/@Android966",
  },
  {
    label: "Facebook",
    icon: Facebook,
    color: "text-blue-600",
    href: "https://www.facebook.com/Android966/",
  },
  {
    label: "Instagram",
    icon: Instagram,
    color: "text-pink-600",
    href: "https://www.instagram.com/android966/",
  },
  {
    label: "WhatsApp",
    icon: MessageCircle,
    color: "text-emerald-600",
    href: "https://wa.me/923001234567",
  },
  { label: "Email", icon: Mail, color: "text-text", href: "mailto:contact@android966.com" },
  { label: "Website", icon: Globe, color: "text-brand", href: "https://android966.com" },
];

const milestones = [
  {
    year: "2018",
    title: "Channel Started",
    description:
      "Android 966 was launched on YouTube with a mission to simplify tech for Pakistanis.",
  },
  {
    year: "2020",
    title: "100K Subscribers",
    description:
      "Reached the first major milestone thanks to honest reviews and relatable content.",
  },
  {
    year: "2022",
    title: "Fragrance Content",
    description: "Started reviewing perfumes, ouds, and attars — a huge hit with the audience.",
  },
  {
    year: "2025",
    title: "Official Store",
    description:
      "Launched the Android 966 store to sell curated tech and fragrance products directly.",
  },
];

const values = [
  {
    title: "Honest Reviews",
    description: "No paid bias. Every product is tested before recommendation.",
  },
  {
    title: "Local Context",
    description: "Prices, availability, and use cases explained for Pakistan.",
  },
  {
    title: "Community First",
    description: "Built by listening to viewer comments, DMs, and suggestions.",
  },
  {
    title: "Quality Curation",
    description: "Store products are hand-picked to match the channel's standards.",
  },
];

function AboutPage() {
  const logoUrl = useLogoUrl();
  return (
    <div className="bg-white pt-5 pb-10 sm:pt-6 sm:pb-12">
      <div className="a9-container">
        {/* Hero Profile */}
        <div className="mb-10 flex flex-col items-center gap-6 text-center lg:flex-row lg:text-left">
          <img
            src={logoUrl}
            alt="Android 966 — Pakistan Tech and Fragrance Content Creator"
            className="a9-logo-img h-36 w-36 shrink-0 rounded-full object-cover shadow-lg ring-4 ring-brand-soft"
          />
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-text sm:text-4xl">
              About Android 966
            </h1>
            <p className="mt-2 text-sm font-medium text-brand sm:text-base">
              Pakistan's Premier Tech & Fragrance Content Creator
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-text sm:text-base">
              Android 966 is dedicated to helping people make smart, informed buying decisions.
              From smartphones, accessories, and gadgets to luxury perfumes, ouds, and attars —
              every review is honest, practical, and made specifically for the Pakistani consumer.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2 lg:justify-start">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline flex min-h-[44px] items-center gap-2 px-4 py-2"
                >
                  <link.icon className={`h-4 w-4 ${link.color}`} />
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-bg2 p-5 text-center"
            >
              <div className="text-3xl">{stat.icon}</div>
              <div className="mt-2 text-2xl font-semibold text-brand">{stat.value}</div>
              <div className="text-xs text-neutral">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Journey + Values */}
        <div className="grid gap-8 lg:grid-cols-2">
          <section>
            <h2 className="mb-6 text-xl font-semibold text-text">The Journey</h2>
            <div className="relative border-l border-border pl-5">
              {milestones.map((m, idx) => (
                <div key={idx} className="mb-6">
                  <div className="absolute -left-1.5 h-3 w-3 rounded-full bg-brand" />
                  <span className="text-xs font-semibold text-secondary-label">{m.year}</span>
                  <h3 className="mt-1 font-semibold text-text">{m.title}</h3>
                  <p className="mt-1 text-sm text-neutral">{m.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-6 text-xl font-semibold text-text">What We Stand For</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {values.map((v) => (
                <div key={v.title} className="rounded-xl border border-border p-5">
                  <h3 className="font-semibold text-text">{v.title}</h3>
                  <p className="mt-1 text-sm text-neutral">{v.description}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* CTA */}
        <div className="mt-10 rounded-xl border border-border bg-bg2 p-8 text-center">
          <h2 className="text-xl font-semibold text-text">Want to collab or have a question?</h2>
          <p className="mt-2 text-sm text-neutral">
            Reach out via email or social media. We read every message.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <a href="mailto:contact@android966.com" className="btn-primary min-h-[44px]">
              Send Email
            </a>
            <Link to="/founder" className="btn-outline min-h-[44px]">
              Meet the Founder
            </Link>
            <Link to="/store" className="btn-outline min-h-[44px]">
              Visit Store
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
