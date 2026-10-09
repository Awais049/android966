import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X, ShoppingCart, ChevronDown, User, Download } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { useLogoUrl } from "@/lib/useLogo";
import { usePwa } from "@/context/PwaContext";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/store", label: "Store" },
  { to: "/services", label: "Services" },
  { to: "/videos", label: "Videos" },
  { to: "/blog", label: "Blog" },
  { to: "/about", label: "About" },
  { to: "/founder", label: "Founder" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [storeOpen, setStoreOpen] = useState(false);
  const [authTarget, setAuthTarget] = useState<{ to: string; label: string }>({
    to: "/signin",
    label: "Sign In",
  });
  const { totalItems } = useCart();
  const { isInstalled, install } = usePwa();
  const logoUrl = useLogoUrl();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const resolve = async (userId: string | undefined) => {
      if (!userId) {
        setAuthTarget({ to: "/signin", label: "Sign In" });
        return;
      }
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();
      setAuthTarget(
        data
          ? { to: "/admin", label: "Admin" }
          : { to: "/account", label: "Account" },
      );
    };
    supabase.auth.getUser().then(({ data }) => resolve(data.user?.id));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      resolve(session?.user?.id),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  const isActive = (to: string) => {
    if (to === "/") return pathname === "/";
    return pathname === to || pathname.startsWith(`${to}/`);
  };

  return (
    <>
    <header className="sticky top-0 z-50 h-16 border-b border-border bg-background/95 text-foreground backdrop-blur-md">

      <div className="a9-container grid h-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 md:flex md:justify-between">
        {/* Logo */}
        <Link to="/" className="flex min-w-0 items-center gap-2.5 overflow-hidden">
          <img
            src={logoUrl}
            alt="Android 966 — Tech Reviews, Fragrances & Digital Services"
            className="a9-logo-img h-9 w-9 shrink-0 rounded-md object-cover ring-1 ring-border"
          />
          <span className="truncate font-serif text-lg tracking-tight text-foreground">
            Android <span className="text-brand">966</span>
          </span>
        </Link>


        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) =>
            link.to === "/store" ? (
              <div
                key={link.to}
                className="relative"
                onMouseEnter={() => setStoreOpen(true)}
                onMouseLeave={() => setStoreOpen(false)}
              >
                <Link
                  to={link.to}
                  className={`flex items-center gap-1 text-[13px] font-medium tracking-wide transition-colors ${
                    isActive(link.to) ? "text-foreground" : "text-neutral hover:text-foreground"
                  }`}
                >
                  {link.label}
                  <ChevronDown className="h-3.5 w-3.5" />
                </Link>
                {storeOpen && (
                  <div className="absolute left-1/2 top-full -translate-x-1/2 pt-2">
                    <div className="rounded-md border border-border bg-card py-1 shadow-lg">
                      <Link
                        to="/store"
                        search={{ category: "tech" }}
                        className="block whitespace-nowrap px-4 py-2 text-sm text-text2 hover:bg-bg2 hover:text-foreground"
                      >
                        Tech Products
                      </Link>
                      <Link
                        to="/store"
                        search={{ category: "perfume" }}
                        className="block whitespace-nowrap px-4 py-2 text-sm text-text2 hover:bg-bg2 hover:text-foreground"
                      >
                        Perfumes
                      </Link>
                      <Link
                        to="/store"
                        className="block whitespace-nowrap px-4 py-2 text-sm text-text2 hover:bg-bg2 hover:text-foreground"
                      >
                        All Products
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={link.to}
                to={link.to}
                className={`text-[13px] font-medium tracking-wide transition-colors ${
                  isActive(link.to) ? "text-foreground" : "text-neutral hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ),
          )}
        </nav>


        {/* Right Actions */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            to="/cart"
            className="relative flex h-10 w-10 sm:h-9 sm:w-9 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-bg2"
            aria-label="View shopping cart"
          >
            <ShoppingCart className="h-4 w-4" />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-brand-foreground">
                {totalItems}
              </span>
            )}
          </Link>
          {!isInstalled && (
            <button
              type="button"
              onClick={install}
              className="hidden sm:inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-brand/25 bg-brand/5 px-2.5 py-1.5 text-xs font-semibold text-brand transition-colors hover:bg-brand hover:text-white"
              title="Install Android 966 Web App"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Install App</span>
            </button>
          )}
          <div className="hidden md:block">
            <Link to={authTarget.to} className="btn-primary gap-2 inline-flex items-center">
              <User className="h-4 w-4" />
              <span className="hidden lg:inline">{authTarget.label}</span>
            </Link>
          </div>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-md border border-border text-foreground md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            aria-expanded={mobileOpen}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

      </div>
    </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[100] flex h-dvh w-screen flex-col text-foreground md:hidden"
          style={{ backgroundColor: "var(--background, #ffffff)" }}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4">
            <Link
              to="/"
              className="flex min-w-0 items-center gap-2.5 overflow-hidden"
              onClick={() => setMobileOpen(false)}
            >
              <img
                src={logoUrl}
                alt="Android 966 Logo"
                className="h-9 w-9 shrink-0 rounded-md object-cover ring-1 ring-border"
              />
              <span className="truncate font-serif text-lg tracking-tight text-foreground">
                Android <span className="text-brand">966</span>
              </span>
            </Link>
            <button
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border text-foreground"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-5 py-4">

            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`border-b border-border py-4 text-base font-medium ${
                  isActive(link.to) ? "text-brand" : "text-text"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="py-4">
              <span className="text-xs font-medium uppercase tracking-wider text-neutral">Store Categories</span>
              <div className="mt-3 flex flex-col gap-3">
                <Link
                  to="/store"
                  search={{ category: "tech" }}
                  className="text-base text-text"
                  onClick={() => setMobileOpen(false)}
                >
                  Tech Products
                </Link>
                <Link
                  to="/store"
                  search={{ category: "perfume" }}
                  className="text-base text-text"
                  onClick={() => setMobileOpen(false)}
                >
                  Perfumes
                </Link>
              </div>
            </div>
            {!isInstalled && (
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  install();
                }}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-brand/10 border border-brand/30 py-3 text-sm font-semibold text-brand transition-all hover:bg-brand hover:text-white active:scale-95"
              >
                <Download className="h-4 w-4" />
                Install Android 966 App
              </button>
            )}
            <Link
              to={authTarget.to}
              onClick={() => setMobileOpen(false)}
              className="mt-3 btn-primary w-full justify-center gap-2 inline-flex items-center"
            >
              <User className="h-4 w-4" />
              {authTarget.label}
            </Link>
          </nav>
        </div>
      )}
    </>

  );
}

