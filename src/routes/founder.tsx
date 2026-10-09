import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, Phone, MapPin, Linkedin, Youtube, Award, Briefcase, GraduationCap, User } from "lucide-react";
import founderAsset from "@/assets/awais-ahmed.jpg.asset.json";
import { useFounderContent } from "@/lib/founderContent";
import { FounderPinGate } from "@/components/FounderPinGate";
import { createPageHead, getBreadcrumbSchema, SITE_URL } from "@/lib/seo";

export const Route = createFileRoute("/founder")({
  head: () =>
    createPageHead({
      title: "Awais Ahmed — Founder of Android 966",
      description:
        "Meet Awais Ahmed: Software engineer, digital marketer, and founder of Android 966 Pakistan. Discover his story, skills, and portfolio.",
      path: "/founder",
      image: founderAsset.url,
      ogType: "profile",
      keywords: [
        "awais ahmed",
        "founder android 966",
        "software engineer pakistan",
        "tech youtuber awais ahmed",
      ],
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "Person",
          name: "Awais Ahmed",
          jobTitle: "Founder & Software Engineer",
          worksFor: {
            "@type": "Organization",
            name: "Android 966",
            url: SITE_URL,
          },
          url: `${SITE_URL}/founder`,
          sameAs: [
            "https://www.youtube.com/@Android966",
            "https://www.facebook.com/Android966/",
            "https://www.instagram.com/android966/",
          ],
        },
        getBreadcrumbSchema([
          { name: "Home", item: "/" },
          { name: "Founder", item: "/founder" },
        ]),
      ],
    }),
  component: FounderPageGated,
});

function FounderPageGated() {
  return (
    <FounderPinGate>
      <FounderPage />
    </FounderPinGate>
  );
}


function FounderPage() {
  const { content: c, isLoading } = useFounderContent();
  // Only fall back to the bundled default AFTER the query has resolved with no image,
  // otherwise a hard refresh briefly flashes the old default before the DB image loads.
  const image = c.image || (isLoading ? "" : founderAsset.url);
  const waNumber = (c.whatsapp_number || "923091726858").replace(/\D/g, "");

  return (
    <div className="bg-white pt-5 pb-10 sm:pt-6 sm:pb-12 lg:pt-8 lg:pb-14">
      <div className="a9-container">
        {/* Hero */}
        <div className="mb-10 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-brand-soft/50 via-white to-white p-6 lg:mb-14 lg:p-10">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            {image ? (
              <img
                src={image}
                alt={`${c.name} — Founder of Android 966`}
                className="h-64 w-64 rounded-2xl object-cover shadow-xl ring-4 ring-white lg:h-80 lg:w-80"
              />
            ) : (
              <div className="h-64 w-64 rounded-2xl bg-brand-soft/40 ring-4 ring-white animate-pulse lg:h-80 lg:w-80" />
            )}
            <span className="mt-6 inline-block rounded-full bg-brand-soft px-3 py-1 text-xs font-medium text-brand">
              {c.role_tag}
            </span>
            <h1 className="mt-3 text-4xl font-semibold text-text lg:text-5xl">{c.name}</h1>
            <p className="mt-2 text-sm text-neutral lg:text-base">{c.role_line}</p>
            <p className="mt-4 text-sm leading-relaxed text-text whitespace-pre-line lg:text-[15px] lg:leading-7">
              {c.bio}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {c.linkedin_url && (
                <a href={c.linkedin_url} target="_blank" rel="noopener noreferrer" className="btn-outline flex min-h-[44px] items-center gap-2 px-4 py-2">
                  <Linkedin className="h-4 w-4 text-blue-600" /> LinkedIn
                </a>
              )}
              {c.email && (
                <a href={`mailto:${c.email}`} className="btn-outline flex min-h-[44px] items-center gap-2 px-4 py-2">
                  <Mail className="h-4 w-4" /> {c.email}
                </a>
              )}
              {c.phone && (
                <a href={`tel:${c.phone.replace(/\s+/g, "")}`} className="btn-outline flex min-h-[44px] items-center gap-2 px-4 py-2">
                  <Phone className="h-4 w-4" /> {c.phone}
                </a>
              )}
              {c.youtube_url && (
                <a href={c.youtube_url} target="_blank" rel="noopener noreferrer" className="btn-outline flex min-h-[44px] items-center gap-2 px-4 py-2">
                  <Youtube className="h-4 w-4 text-red-600" /> YouTube
                </a>
              )}
              {c.location && (
                <span className="btn-outline flex min-h-[44px] items-center gap-2 px-4 py-2">
                  <MapPin className="h-4 w-4" /> {c.location}
                </span>
              )}
            </div>
          </div>
        </div>



        {/* Stats */}
        {c.stats.length > 0 && (
          <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {c.stats.map((s, i) => (
              <div key={`${s.label}-${i}`} className="rounded-xl border border-border bg-bg2 p-5 text-center">
                <div className="text-2xl font-semibold text-brand">{s.value}</div>
                <div className="text-xs text-neutral">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-2">
          {c.experience.length > 0 && (
            <section>
              <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-text">
                <Briefcase className="h-5 w-5 text-brand" /> Experience
              </h2>
              <div className="space-y-4">
                {c.experience.map((e, i) => (
                  <div key={`${e.role}-${i}`} className="rounded-xl border border-border p-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-semibold text-text">{e.role}</h3>
                      <span className="text-xs text-secondary-label">{e.period}</span>
                    </div>
                    <p className="text-sm text-brand">{e.company}</p>
                    {e.points.length > 0 && (
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral">
                        {e.points.map((p, j) => <li key={j}>{p}</li>)}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {c.education.length > 0 && (
            <section>
              <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-text">
                <GraduationCap className="h-5 w-5 text-brand" /> Education
              </h2>
              <div className="space-y-4">
                {c.education.map((e, i) => (
                  <div key={`${e.school}-${i}`} className="rounded-xl border border-border p-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-semibold text-text">{e.school}</h3>
                      <span className="text-xs text-secondary-label">{e.period}</span>
                    </div>
                    <p className="text-sm text-text">{e.degree}</p>
                    {e.detail && <p className="mt-1 text-xs text-neutral">{e.detail}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {c.skills.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-6 text-xl font-semibold text-text">Skills & Tools</h2>
            <div className="flex flex-wrap gap-2">
              {c.skills.map((s, i) => (
                <span key={`${s}-${i}`} className="rounded-full border border-border bg-bg2 px-3 py-1.5 text-xs font-medium text-text">
                  {s}
                </span>
              ))}
            </div>
          </section>
        )}

        {c.projects.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-6 text-xl font-semibold text-text">Selected Projects</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {c.projects.map((p, i) => (
                <div key={`${p}-${i}`} className="rounded-xl border border-border p-4 text-sm text-text">
                  {p}
                </div>
              ))}
            </div>
          </section>
        )}

        {c.certificates.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-text">
              <Award className="h-5 w-5 text-brand" /> Certifications
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {c.certificates.map((cert, i) => (
                <div key={`${cert}-${i}`} className="rounded-xl border border-border p-4 text-sm text-text">
                  {cert}
                </div>
              ))}
            </div>
          </section>
        )}

        {c.languages.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-6 text-xl font-semibold text-text">Languages</h2>
            <div className="grid grid-cols-3 gap-4">
              {c.languages.map((l, i) => (
                <div key={`${l.name}-${i}`} className="rounded-xl border border-border p-4 text-center">
                  <div className="text-lg font-semibold text-brand">{l.percent}%</div>
                  <div className="text-xs text-neutral">{l.name}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="mt-10 rounded-xl border border-border bg-bg2 p-8 text-center">
          <h2 className="text-xl font-semibold text-text">{c.cta_heading}</h2>
          <p className="mt-2 text-sm text-neutral">{c.cta_body}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" className="btn-primary">
              Chat on WhatsApp
            </a>
            <Link to="/services" className="btn-outline">
              Explore Services
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
