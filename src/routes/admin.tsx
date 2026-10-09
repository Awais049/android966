import { useEffect, useState } from "react";
import { createFileRoute, Outlet, Link, useNavigate, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, Package, FileText, Youtube, ShoppingBag, Settings, Sparkles, User, LogOut, Menu, X, Megaphone } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/integrations/supabase/client";
import { useLogoUrl } from "@/lib/useLogo";
import { clearLocalUserSession } from "@/lib/authLocal";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Android 966" }, { name: "robots", content: "noindex" }] }),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/services", label: "Services", icon: Sparkles },
  { to: "/admin/blog", label: "Blog Posts", icon: FileText },
  { to: "/admin/videos", label: "Videos", icon: Youtube },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/banners", label: "Banners & Promos", icon: Megaphone },
  { to: "/admin/founder", label: "Founder Page", icon: User },
  { to: "/admin/settings", label: "Site Settings", icon: Settings },
];


function AdminLayout() {
  const { loading, user, isAdmin } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const logoUrl = useLogoUrl();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/signin" });
    } else if (!isAdmin) {
      navigate({ to: "/account" });
    }
  }, [loading, user, isAdmin, navigate]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-sm text-neutral">Loading…</div>
      </div>
    );
  }

  const signOut = async () => {
    clearLocalUserSession();
    try {
      await supabase.auth.signOut();
    } catch {}
    navigate({ to: "/signin" });
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-[240px] flex-col border-r border-border bg-card lg:flex">
        <div className="flex h-20 items-center gap-3 border-b border-border px-6">
          <img src={logoUrl} alt="Site logo" className="a9-logo-img h-9 w-9 shrink-0 rounded-md object-cover ring-1 ring-border" />
          <div>
            <p className="text-[15px] font-medium tracking-tight text-foreground" style={{ fontFamily: '"DM Serif Display", serif' }}>Android 966</p>
            <p className="text-[10px] uppercase tracking-[0.14em] text-neutral">Admin Panel</p>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 p-3">
          {NAV.map((item) => {
            const active = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-foreground text-background font-medium"
                    : "text-text2 hover:bg-bg2 hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-3">
          <div className="mb-2 truncate px-3 text-[11px] text-neutral">{user.email}</div>
          <button
            onClick={signOut}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-text2 hover:bg-bg2 hover:text-foreground"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>
      <div className="flex-1 lg:ml-[240px]">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-card/80 backdrop-blur px-4 lg:px-8">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-bg2"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <h1 className="truncate text-lg tracking-tight text-foreground" style={{ fontFamily: '"DM Serif Display", serif' }}>
              {NAV.find((n) =>
                n.exact ? location.pathname === n.to : location.pathname.startsWith(n.to),
              )?.label ?? "Admin"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="hidden sm:inline text-xs text-neutral hover:text-foreground transition-colors">
              View site →
            </Link>
            <button
              onClick={signOut}
              className="lg:hidden inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-text2 hover:bg-bg2"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-30" role="dialog" aria-modal="true">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setMobileOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-[260px] max-w-[80%] bg-card shadow-xl flex flex-col">
              <div className="flex h-16 items-center justify-between border-b border-border px-4">
                <div className="flex items-center gap-2 min-w-0">
                  <img src={logoUrl} alt="Site logo" className="a9-logo-img h-8 w-8 shrink-0 rounded-md object-cover ring-1 ring-border" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground" style={{ fontFamily: '"DM Serif Display", serif' }}>Android 966</p>
                    <p className="text-[10px] uppercase tracking-[0.14em] text-neutral">Admin</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-foreground hover:bg-bg2"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
                {NAV.map((item) => {
                  const active = item.exact
                    ? location.pathname === item.to
                    : location.pathname.startsWith(item.to);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                        active
                          ? "bg-foreground text-background font-medium"
                          : "text-text2 hover:bg-bg2 hover:text-foreground"
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
                <Link
                  to="/"
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-text2 hover:bg-bg2 hover:text-foreground"
                >
                  View site →
                </Link>
              </nav>
              <div className="border-t border-border p-3">
                <div className="mb-2 truncate px-3 text-xs text-neutral">{user.email}</div>
                <button
                  onClick={signOut}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-text2 hover:bg-bg2 hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>

    </div>
  );
}
