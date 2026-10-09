import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useMergedServices } from "@/lib/publicContent";
import { createPageHead, getBreadcrumbSchema } from "@/lib/seo";

export const Route = createFileRoute("/services/")({
  head: () =>
    createPageHead({
      title: "Web Development & Digital Services | Android 966",
      description:
        "Expert web development, SEO, WordPress, Google Ads, and AI graphic design services in Pakistan. Grow your brand with proven results.",
      path: "/services",
      keywords: [
        "web development pakistan",
        "seo services karachi",
        "digital marketing agency pakistan",
        "wordpress development",
        "google ads management",
      ],
      jsonLd: [
        getBreadcrumbSchema([
          { name: "Home", item: "/" },
          { name: "Services", item: "/services" },
        ]),
      ],
    }),
  component: ServicesIndex,
});

function ServicesIndex() {
  const { services } = useMergedServices();

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-border bg-white">
        <div className="a9-container pt-6 pb-12 sm:pt-8 sm:pb-16 lg:pt-10 lg:pb-16">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-bg2 px-3 py-1 text-xs font-medium uppercase tracking-wider text-secondary-label">
              <span className="h-2 w-2 rounded-full bg-brand" />
              Our Services
            </span>
            <h1 className="mt-5 text-3xl font-bold leading-tight text-text sm:text-4xl lg:text-5xl">
              Web Development & Digital Services to <span className="text-brand">Scale Your Brand</span>
            </h1>
            <p className="mt-5 text-base leading-relaxed text-text2 sm:text-lg">
              An expert mix of digital marketing, modern software engineering, and creative design — engineered to deliver real results,
              measurable ROI, and sustainable business growth.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="https://wa.me/923091726858"
                className="btn-primary min-h-[44px]"
                target="_blank"
                rel="noopener noreferrer"
              >
                Get a Free Consultation
              </a>
              <Link to="/about" className="btn-outline min-h-[44px]">
                About Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services grid */}
      <section className="bg-bg2 py-14">
        <div className="a9-container">
          <div className="mb-8 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-text sm:text-3xl">
              Our Professional Digital Services
            </h2>
            <p className="mt-2 text-sm text-neutral sm:text-base max-w-xl">
              End-to-end solutions customized to your business goals and audience demographics.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Link
                key={service.slug}
                to="/services/$slug"
                params={{ slug: service.slug }}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white transition-all hover:border-brand hover:-translate-y-1"
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={service.heroImage}
                    alt={`${service.name} — Professional Services by Android 966`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-2xl shadow-sm">
                    {service.icon}
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-lg font-semibold text-text">{service.name}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-text2">{service.intro}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand">
                    Learn more <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="bg-white py-14">
        <div className="a9-container">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-2xl font-semibold text-text lg:text-3xl">
                Why work with Android 966?
              </h2>
              <p className="mt-4 text-text2">
                We blend creativity with data-driven strategies to help brands stand out and scale
                with confidence. From startups to enterprises, our goal is simple — turn your
                digital presence into a powerful growth engine.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Founded in 2022 with 50+ projects delivered",
                  "Transparent reporting and clear ROI",
                  "Certified specialists across every channel",
                  "Month-to-month — no long-term lock-ins",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-text">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <StatBox value="2022" label="Founded" />
              <StatBox value="50+" label="Projects" />
              <StatBox value="$5M+" label="Ad Spend Managed" />
              <StatBox value="98%" label="Client Satisfaction" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand py-14">
        <div className="a9-container text-center text-white">
          <h2 className="text-2xl font-semibold lg:text-3xl">Ready to grow your business?</h2>
          <p className="mt-3 text-white/90">
            Book a free consultation and discover the right digital solutions for your business.
          </p>
          <a
            href="https://wa.me/923091726858"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-brand transition-colors hover:bg-bg2"
          >
            Talk to an Expert <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </div>
  );
}

function StatBox({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-border bg-bg2 p-6 text-center">
      <p className="text-2xl font-semibold text-text lg:text-3xl">{value}</p>
      <p className="mt-1 text-xs text-neutral">{label}</p>
    </div>
  );
}
