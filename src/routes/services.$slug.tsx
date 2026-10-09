import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { useMergedServices, useServiceBySlug } from "@/lib/publicContent";
import { services as staticServices } from "@/data/services";
import { createPageHead, getServiceSchema, getBreadcrumbSchema } from "@/lib/seo";

export const Route = createFileRoute("/services/$slug")({
  head: ({ params }) => {
    const s = staticServices.find((item) => item.slug === params.slug);
    const title = s ? `${s.name} Services | Android 966` : "Service Details | Android 966";
    const description = s
      ? (s.intro ? s.intro.slice(0, 155) : `${s.name} professional services by Android 966 Pakistan.`)
      : "Professional digital marketing, development, and tech consulting services in Pakistan.";

    const jsonLd = s
      ? [
          getServiceSchema(s),
          getBreadcrumbSchema([
            { name: "Home", item: "/" },
            { name: "Services", item: "/services" },
            { name: s.name, item: `/services/${s.slug}` },
          ]),
        ]
      : [
          getBreadcrumbSchema([
            { name: "Home", item: "/" },
            { name: "Services", item: "/services" },
          ]),
        ];

    return createPageHead({
      title,
      description,
      path: `/services/${params.slug}`,
      keywords: s ? [s.name, s.shortName, "services pakistan", "android 966 agency"] : ["services pakistan"],
      jsonLd,
    });
  },
  component: ServiceDetail,
});

function ServiceDetail() {
  const { slug } = Route.useParams();
  const { service, isLoading } = useServiceBySlug(slug);
  const { services } = useMergedServices();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  if (isLoading) {
    return <div className="a9-container py-16 text-center text-sm text-neutral">Loading…</div>;
  }

  if (!service) {
    return (
      <div className="a9-container py-20 text-center">
        <h1 className="text-2xl font-semibold text-text">Service not found</h1>
        <Link to="/services" className="mt-4 inline-block text-brand hover:underline">
          Back to services
        </Link>
      </div>
    );
  }

  const others = services.filter((s) => s.slug !== service.slug).slice(0, 3);


  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-white">
        <div className="a9-container grid gap-10 py-12 lg:grid-cols-2 lg:items-center lg:py-16">
          <div>
            <nav className="mb-4 flex items-center gap-2 text-xs text-neutral">
              <Link to="/" className="hover:text-brand">Home</Link>
              <span>/</span>
              <Link to="/services" className="hover:text-brand">Services</Link>
              <span>/</span>
              <span className="text-text">{service.shortName}</span>
            </nav>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-bg2 px-3 py-1 text-xs font-medium uppercase tracking-wider text-secondary-label">
              <span className="text-base">{service.icon}</span>
              {service.shortName}
            </div>
            <h1 className="mt-4 text-3xl font-semibold leading-tight text-text lg:text-4xl">
              {service.hero}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-text2">{service.intro}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="https://wa.me/923091726858"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary min-h-[44px]"
              >
                Get a Free Quote
              </a>
              <Link to="/services" className="btn-outline min-h-[44px]">
                All Services
              </Link>
            </div>
          </div>
          <div className="relative">
            <img
              src={service.heroImage}
              alt={`${service.name} — Expert Digital Services by Android 966`}
              className="h-72 w-full rounded-2xl object-cover lg:h-96"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="bg-bg2 py-14">
        <div className="a9-container max-w-3xl">
          <h2 className="text-2xl font-semibold text-text lg:text-3xl">Overview</h2>
          <p className="mt-4 text-text2">{service.description}</p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {service.benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3 text-sm text-text">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-14">
        <div className="a9-container">
          <h2 className="text-2xl font-semibold text-text lg:text-3xl">What's included</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {service.features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-border bg-white p-6 transition-colors hover:border-brand"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-soft text-brand">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-text">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text2">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="bg-bg2 py-14">
        <div className="a9-container">
          <h2 className="text-2xl font-semibold text-text lg:text-3xl">Our process</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {service.process.map((step) => (
              <div key={step.step} className="rounded-2xl border border-border bg-white p-6">
                <span className="text-2xl font-semibold text-brand">{step.step}</span>
                <h3 className="mt-2 font-semibold text-text">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text2">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-14">
        <div className="a9-container max-w-3xl">
          <h2 className="text-2xl font-semibold text-text lg:text-3xl">Frequently Asked Questions</h2>
          <div className="mt-8 space-y-3">
            {service.faqs.map((faq, i) => {
              const open = openFaq === i;
              return (
                <div key={faq.q} className="rounded-xl border border-border bg-white">
                  <button
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="flex w-full items-center justify-between gap-4 p-5 text-left"
                  >
                    <span className="font-medium text-text">{faq.q}</span>
                    {open ? (
                      <ChevronUp className="h-4 w-4 shrink-0 text-brand" />
                    ) : (
                      <ChevronDown className="h-4 w-4 shrink-0 text-neutral" />
                    )}
                  </button>
                  {open && (
                    <div className="border-t border-border p-5 text-sm leading-relaxed text-text2">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Other services */}
      <section className="bg-bg2 py-14">
        <div className="a9-container">
          <h2 className="text-2xl font-semibold text-text lg:text-3xl">Explore other services</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((s) => (
              <Link
                key={s.slug}
                to="/services/$slug"
                params={{ slug: s.slug }}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white transition-all hover:border-brand hover:-translate-y-1"
              >
                <img
                  src={s.heroImage}
                  alt={`${s.name} — Professional Services by Android 966`}
                  className="h-36 w-full object-cover"
                  loading="lazy"
                />
                <div className="p-5">
                  <h3 className="font-semibold text-text">{s.name}</h3>
                  <p className="mt-1 text-sm text-text2 line-clamp-2">{s.tagline}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand">
                    Learn more <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand py-14">
        <div className="a9-container text-center text-white">
          <h2 className="text-2xl font-semibold lg:text-3xl">Let's talk about your project</h2>
          <p className="mt-3 text-white/90">Get a free, no-obligation quote within 24 hours.</p>
          <a
            href="https://wa.me/923091726858"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-brand transition-colors hover:bg-bg2"
          >
            Message us on WhatsApp <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </div>
  );
}
