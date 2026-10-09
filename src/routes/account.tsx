import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { getProductById } from "@/data/products";
import { LogOut, Package, User as UserIcon, Heart, Trash2 } from "lucide-react";
import { clearLocalUserSession } from "@/lib/authLocal";
import { createPageHead } from "@/lib/seo";

export const Route = createFileRoute("/account")({
  head: () =>
    createPageHead({
      title: "My Account | Android 966 Pakistan",
      description: "Manage your profile, view orders, and check your wishlist on Android 966.",
      path: "/account",
      noIndex: true,
    }),
  component: AccountPage,
});

type Tab = "orders" | "profile" | "wishlist";

interface OrderRow {
  id: string;
  order_number: string;
  status: string;
  total: number;
  subtotal: number;
  shipping: number;
  items: { name: string; price: number; quantity: number }[];
  created_at: string;
}

interface ProfileRow {
  id: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
}

function AccountPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");
  const [tab, setTab] = useState<Tab>("orders");

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      if (!data.user) {
        navigate({ to: "/signin" });
        return;
      }
      setUserId(data.user.id);
      setEmail(data.user.email ?? "");
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session?.user) navigate({ to: "/signin" });
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  const signOut = async () => {
    clearLocalUserSession();
    try {
      await supabase.auth.signOut();
    } catch {}
    navigate({ to: "/" });
  };

  if (loading || !userId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-neutral">Loading…</p>
      </div>
    );
  }

  return (
    <div className="bg-bg2 py-8">
      <div className="a9-container">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-text">My Account</h1>
            <p className="text-sm text-neutral">{email}</p>
          </div>
          <button
            onClick={signOut}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-text hover:bg-bg2"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          <aside className="lg:w-56 shrink-0">
            <nav className="flex gap-2 overflow-x-auto rounded-xl border border-border bg-white p-2 lg:flex-col lg:overflow-visible">
              <TabButton icon={Package} label="Orders" active={tab === "orders"} onClick={() => setTab("orders")} />
              <TabButton icon={UserIcon} label="Profile" active={tab === "profile"} onClick={() => setTab("profile")} />
              <TabButton icon={Heart} label="Wishlist" active={tab === "wishlist"} onClick={() => setTab("wishlist")} />
            </nav>
          </aside>
          <div className="flex-1">
            {tab === "orders" && <OrdersTab userId={userId} email={email} />}
            {tab === "profile" && <ProfileTab userId={userId} />}
            {tab === "wishlist" && <WishlistTab />}
          </div>
        </div>
      </div>
    </div>
  );
}

function TabButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: typeof Package;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active ? "bg-brand text-white" : "text-text hover:bg-bg2"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function OrdersTab({ userId, email }: { userId: string; email: string }) {
  const [orders, setOrders] = useState<OrderRow[] | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("orders")
        .select("id, order_number, status, total, subtotal, shipping, items, created_at, user_id, email")
        .or(`user_id.eq.${userId},email.eq.${email}`)
        .order("created_at", { ascending: false });
      setOrders((data as unknown as OrderRow[]) ?? []);
    })();
  }, [userId, email]);

  if (!orders) return <div className="rounded-xl border border-border bg-white p-6 text-sm text-neutral">Loading orders…</div>;
  if (orders.length === 0)
    return (
      <div className="rounded-xl border border-border bg-white p-8 text-center">
        <Package className="mx-auto mb-2 h-8 w-8 text-neutral" />
        <p className="text-sm text-neutral">No orders yet.</p>
        <Link to="/store" className="btn-primary mt-4 inline-flex">Start shopping</Link>
      </div>
    );

  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <div key={o.id} className="rounded-xl border border-border bg-white p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-text">Order #{o.order_number}</p>
              <p className="text-xs text-neutral">
                {new Date(o.created_at).toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" })}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                o.status === "delivered"
                  ? "bg-emerald-50 text-emerald-700"
                  : o.status === "shipped"
                  ? "bg-blue-50 text-blue-700"
                  : o.status === "cancelled"
                  ? "bg-red-50 text-red-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {o.status}
            </span>
          </div>
          <ul className="mb-3 space-y-1 text-sm text-text">
            {o.items?.map((it, idx) => (
              <li key={idx} className="flex justify-between">
                <span>
                  {it.name} <span className="text-neutral">× {it.quantity}</span>
                </span>
                <span>Rs. {(it.price * it.quantity).toLocaleString()}</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-border pt-3 text-sm">
            <div className="flex justify-between text-neutral"><span>Subtotal</span><span>Rs. {Number(o.subtotal).toLocaleString()}</span></div>
            <div className="flex justify-between text-neutral"><span>Delivery Charges</span><span>Rs. {Number(o.shipping).toLocaleString()}</span></div>
            <div className="mt-1 flex justify-between font-semibold text-text"><span>Total</span><span>Rs. {Number(o.total).toLocaleString()}</span></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProfileTab({ userId }: { userId: string }) {
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, phone, address, city, province, postal_code")
        .eq("id", userId)
        .maybeSingle();
      setProfile(
        (data as ProfileRow) ?? {
          id: userId,
          full_name: "",
          phone: "",
          address: "",
          city: "",
          province: "",
          postal_code: "",
        },
      );
    })();
  }, [userId]);

  if (!profile)
    return <div className="rounded-xl border border-border bg-white p-6 text-sm text-neutral">Loading profile…</div>;

  const update = (patch: Partial<ProfileRow>) => setProfile({ ...profile, ...patch });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      full_name: profile.full_name,
      phone: profile.phone,
      address: profile.address,
      city: profile.city,
      province: profile.province,
      postal_code: profile.postal_code,
    });
    setSaving(false);
    setMsg(error ? error.message : "Profile saved");
  };

  return (
    <form onSubmit={save} className="rounded-xl border border-border bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-text">Profile</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" value={profile.full_name ?? ""} onChange={(v) => update({ full_name: v })} />
        <Field label="Phone" value={profile.phone ?? ""} onChange={(v) => update({ phone: v })} />
        <Field label="Address" value={profile.address ?? ""} onChange={(v) => update({ address: v })} className="sm:col-span-2" />
        <Field label="City" value={profile.city ?? ""} onChange={(v) => update({ city: v })} />
        <Field label="Province" value={profile.province ?? ""} onChange={(v) => update({ province: v })} />
        <Field label="Postal code" value={profile.postal_code ?? ""} onChange={(v) => update({ postal_code: v })} />
      </div>
      {msg && <p className="mt-4 text-sm text-neutral">{msg}</p>}
      <button type="submit" disabled={saving} className="btn-primary mt-6 disabled:opacity-50">
        {saving ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block text-xs font-medium text-text">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="a9-input w-full" />
    </div>
  );
}

function WishlistTab() {
  const { items, remove } = useWishlist();
  const { addItem } = useCart();
  const products = items.map((id) => getProductById(id)).filter(Boolean);

  if (products.length === 0)
    return (
      <div className="rounded-xl border border-border bg-white p-8 text-center">
        <Heart className="mx-auto mb-2 h-8 w-8 text-neutral" />
        <p className="text-sm text-neutral">Your wishlist is empty.</p>
        <Link to="/store" className="btn-primary mt-4 inline-flex">Browse store</Link>
      </div>
    );

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {products.map((p) => (
        <div key={p!.id} className="flex gap-3 rounded-xl border border-border bg-white p-4">
          <img
            src={p!.image}
            alt={`${p!.name} — Wishlist product`}
            className="h-20 w-20 rounded-lg object-cover"
            loading="lazy"
          />
          <div className="flex flex-1 flex-col">
            <Link to="/store/$productId" params={{ productId: p!.id }} className="text-sm font-medium text-text hover:text-brand">
              {p!.name}
            </Link>
            <p className="text-sm font-semibold text-brand">Rs. {p!.price.toLocaleString()}</p>
            <div className="mt-auto flex items-center gap-2">
              <button
                onClick={() => addItem(p!.id, 1)}
                className="rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-hover"
              >
                Add to cart
              </button>
              <button
                onClick={() => remove(p!.id)}
                className="rounded-lg border border-border px-2 py-1.5 text-xs text-neutral hover:text-red-600"
                aria-label="Remove"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
