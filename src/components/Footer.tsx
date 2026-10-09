import { Link } from "@tanstack/react-router";
import {
  Youtube,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  MessageCircle,
  Download,
} from "lucide-react";
import { useLogoUrl } from "@/lib/useLogo";
import { usePwa } from "@/context/PwaContext";

const shopLinks = [
  { to: "/store", label: "All Products" },
  { to: "/store", search: { category: "tech" }, label: "Tech Products" },
  { to: "/store", search: { category: "perfume" }, label: "Perfumes" },
  { to: "/cart", label: "Cart" },
];

const companyLinks = [
  { to: "/about", label: "About" },
  { to: "/founder", label: "Founder" },
  { to: "/blog", label: "Blog" },
  { to: "/videos", label: "Latest Videos" },
  { to: "/", label: "Contact" },
];

const legalLinks = [
  { to: "/", label: "Privacy Policy" },
  { to: "/", label: "Terms of Service" },
  { to: "/", label: "Shipping Policy" },
  { to: "/", label: "Refund Policy" },
];

const socials = [
  { href: "https://www.youtube.com/@Android966", label: "YouTube", icon: Youtube },
  { href: "https://www.facebook.com/Android966/", label: "Facebook", icon: Facebook },
  { href: "https://www.instagram.com/android966/", label: "Instagram", icon: Instagram },
  { href: "https://wa.me/923091726858", label: "WhatsApp", icon: MessageCircle },
];

export function Footer() {
  const logoUrl = useLogoUrl();
  const { isInstalled, install } = usePwa();
  return (
    <footer className="mt-auto border-t border-border bg-bg2 text-foreground">
      <div className="a9-container py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-3">
            <Link to="/" className="flex items-center gap-3">
              <img
                src={logoUrl}
                alt="Android 966 — Tech Reviews, Fragrances & Digital Services"
                className="a9-logo-img h-10 w-10 rounded-md object-cover ring-1 ring-border"
              />
              <span className="font-serif text-xl tracking-tight">
                Android <span className="text-brand">966</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-text2">
              Pakistan's trusted voice in tech. Honest smartphone reviews, unboxings, and a curated
              store for premium tech and fragrances.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-10 w-10 sm:h-9 sm:w-9 items-center justify-center rounded-md border border-border bg-background text-text2 transition-colors hover:text-foreground"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className="sm:col-span-1 lg:col-span-2">
            <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral">
              Shop
            </h3>
            <ul className="space-y-2.5 text-sm">
              {shopLinks.map((l, i) => (
                <li key={i}>
                  <Link
                    to={l.to}
                    search={l.search as never}
                    className="text-text2 transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="sm:col-span-1 lg:col-span-2">
            <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral">
              Company
            </h3>
            <ul className="space-y-2.5 text-sm">
              {companyLinks.map((l, i) => (
                <li key={i}>
                  <Link to={l.to} className="text-text2 transition-colors hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
              {!isInstalled && (
                <li>
                  <button
                    type="button"
                    onClick={install}
                    className="inline-flex items-center gap-1.5 text-text2 transition-colors hover:text-brand"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Install App</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          <div className="sm:col-span-1 lg:col-span-2">
            <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral">
              Legal
            </h3>
            <ul className="space-y-2.5 text-sm">
              {legalLinks.map((l, i) => (
                <li key={i}>
                  <Link to={l.to} className="text-text2 transition-colors hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="sm:col-span-1 lg:col-span-3">
            <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral">
              Contact
            </h3>
            <ul className="space-y-3 text-sm text-text2">
              <li className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 shrink-0 text-foreground" />
                <span>Punjab, Pakistan</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-foreground" />
                <a href="tel:+923091726858" className="transition-colors hover:text-foreground">
                  +92 309 1726858
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-foreground" />
                <a
                  href="mailto:contact@android966.com"
                  className="truncate transition-colors hover:text-foreground"
                  title="contact@android966.com"
                >
                  contact@android966.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-neutral">
            &copy; {new Date().getFullYear()} Android 966. All rights reserved.
          </p>
          <p className="text-xs text-neutral">
            Made with <span className="text-foreground">♥</span> in Pakistan
          </p>
        </div>
      </div>
    </footer>
  );
}
