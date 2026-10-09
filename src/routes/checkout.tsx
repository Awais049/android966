import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Copy, MessageCircle, CheckCircle2, ChevronDown } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { EmptyState } from "@/components/EmptyState";
import type { Product } from "@/data/products";
import { useLogoUrl } from "@/lib/useLogo";
import { supabase } from "@/integrations/supabase/client";
import { sb } from "@/lib/adminApi";

const PROVINCES = [
  "Punjab",
  "Sindh",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Gilgit-Baltistan",
  "Azad Kashmir",
  "Islamabad Capital Territory",
];

const JAZZCASH = {
  title: "OWAIS AHMED",
  account: "03091726858",
  iban: "PK25JCMA0706923091726858",
  whatsapp: "+92-3091726858",
  whatsappUrl: "https://wa.me/923091726858",
};

type Step = "form" | "payment" | "success";

type PlacedItem = { name: string; price: number; quantity: number };

interface PlacedOrder {
  id: string;
  date: string;
  items: PlacedItem[];
  subtotal: number;
  shipping: number;
  total: number;
  name: string;
}

import { createPageHead } from "@/lib/seo";

export const Route = createFileRoute("/checkout")({
  head: () =>
    createPageHead({
      title: "Secure Checkout | Android 966 Pakistan",
      description: "Complete your order with secure JazzCash payment on Android 966 Pakistan.",
      path: "/checkout",
      noIndex: true,
    }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const logoUrl = useLogoUrl();
  const { cartProducts, subtotal, shipping, total, clearCart } = useCart();
  const { addToast } = useToast();
  const [step, setStep] = useState<Step>("form");
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postal, setPostal] = useState("");
  const [order, setOrder] = useState<PlacedOrder | null>(null);
  const [saving, setSaving] = useState(false);

  if (cartProducts.length === 0 && step !== "success") {
    return (
      <div className="bg-white py-8">
        <div className="a9-container">
          <EmptyState
            icon="🛒"
            title="Your cart is empty"
            description="Add some products to your cart before checkout."
            actionTo="/store"
            actionLabel="Browse Store"
          />
        </div>
      </div>
    );
  }

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleConfirmPayment = async () => {
    setSaving(true);
    const items = cartProducts.map(({ product, quantity }: { product: Product; quantity: number }) => ({
      name: product.name,
      price: product.price,
      quantity,
    }));
    const orderNumber = generateOrderId();
    try {
      const { data: userRes } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
      await sb.from("orders").insert({
        order_number: orderNumber,
        user_id: userRes?.user?.id ?? null,
        customer_name: customerName,
        phone,
        email,
        address: [address1, address2].filter(Boolean).join(", "),
        city,
        province,
        postal_code: postal,
        items,
        subtotal,
        shipping,
        total,
        status: "pending",
      });
    } catch (err) {
      console.error("Failed to save order", err);
    }
    const placed: PlacedOrder = {
      id: orderNumber,
      date: new Date().toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" }),
      items,
      subtotal,
      shipping,
      total,
      name: customerName,
    };
    setOrder(placed);
    setStep("success");
    setSaving(false);
    clearCart();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const copy = (text: string, label: string) => {
    navigator.clipboard?.writeText(text).then(
      () => addToast(`${label} copied`),
      () => addToast(`Copy failed`),
    );
  };

  if (step === "success" && order) {
    return <OrderSuccess order={order} />;
  }

  if (step === "payment") {
    return (
      <div className="bg-white pt-5 pb-10 sm:pt-6 sm:pb-12">
        <div className="a9-container max-w-3xl">
          <h1 className="mb-2 text-2xl font-semibold text-text">Payment Instructions</h1>
          <p className="mb-6 text-sm text-neutral">
            Please make an <strong>advance payment</strong> of your order total using the JazzCash
            details below.
          </p>

          <div className="rounded-xl border border-border p-5">
            <h2 className="text-lg font-semibold text-text">JazzCash Details</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <PaymentRow label="Account Title" value={JAZZCASH.title} onCopy={copy} />
              <PaymentRow label="Account Number" value={JAZZCASH.account} onCopy={copy} />
              <PaymentRow label="IBAN" value={JAZZCASH.iban} onCopy={copy} />
              <div className="flex items-center justify-between rounded-lg bg-bg2 px-3 py-2">
                <dt className="font-medium text-text">Amount to Pay</dt>
                <dd className="text-base font-semibold text-brand">
                  Rs. {total.toLocaleString()}
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-medium">Important</p>
            <p className="mt-1">
              After payment, please send a screenshot of the transaction to our WhatsApp number{" "}
              <strong>{JAZZCASH.whatsapp}</strong> for confirmation.
            </p>
            <a
              href={JAZZCASH.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              <MessageCircle className="h-4 w-4" />
              Send screenshot on WhatsApp
            </a>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={() => setStep("form")}
              className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-text hover:bg-bg2"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleConfirmPayment}
              disabled={saving}
              className="btn-primary disabled:opacity-50"
            >
              {saving ? "Placing order…" : "I have paid — Confirm Order"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white pt-5 pb-10 sm:pt-6 sm:pb-12">
      <div className="a9-container">
        <h1 className="mb-6 text-2xl font-semibold text-text">Checkout</h1>

        <div className="flex flex-col gap-8 lg:flex-row">
          <form className="flex-1 space-y-8" onSubmit={handleContinue}>
            <section className="rounded-xl border border-border p-5">
              <h2 className="mb-4 text-lg font-semibold text-text">Contact Information</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="a9-input w-full"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
                <input type="email" placeholder="Email" className="a9-input w-full" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input
                  type="tel"
                  placeholder="Phone number"
                  className="a9-input w-full sm:col-span-2"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </section>

            <section className="rounded-xl border border-border p-5">
              <h2 className="mb-4 text-lg font-semibold text-text">Shipping Address</h2>
              <div className="grid gap-4">
                <input
                  type="text"
                  placeholder="Address Line 1"
                  className="a9-input w-full"
                  value={address1}
                  onChange={(e) => setAddress1(e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Address Line 2 (optional)"
                  className="a9-input w-full"
                  value={address2}
                  onChange={(e) => setAddress2(e.target.value)}
                />
                <div className="grid gap-4 sm:grid-cols-3">
                  <input type="text" placeholder="City" className="a9-input w-full" value={city} onChange={(e) => setCity(e.target.value)} required />
                  <select className="a9-input w-full" required value={province} onChange={(e) => setProvince(e.target.value)}>
                    <option value="" disabled>
                      Province
                    </option>
                    {PROVINCES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Postal Code"
                    className="a9-input w-full"
                    value={postal}
                    onChange={(e) => setPostal(e.target.value)}
                    required
                  />
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-border bg-bg2 p-5">
              <h2 className="text-lg font-semibold text-text">Payment Method</h2>
              <p className="mt-2 text-sm text-neutral">
                We accept <strong>advance payment via JazzCash</strong> only. Full payment
                instructions will appear on the next step.
              </p>
            </section>

            <button type="submit" className="btn-primary w-full text-base">
              Continue to Payment
            </button>
          </form>

          <div className="h-fit w-full rounded-xl border border-border bg-white p-5 lg:sticky lg:top-20 lg:w-[340px]">
            <h2 className="text-lg font-semibold text-text">Order Summary</h2>
            <div className="mt-4 space-y-3">
              {cartProducts.map(({ product, quantity }) => (
                <div key={product.id} className="flex items-center gap-3">
                  <img
                    src={product.image}
                    alt={`${product.name} — Order item`}
                    className="h-12 w-12 shrink-0 rounded-lg object-cover border border-border"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text">{product.name}</p>
                    <p className="text-xs text-neutral">Qty: {quantity}</p>
                  </div>
                  <p className="text-sm font-medium text-text">
                    Rs. {(product.price * quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
            <div className="my-4 border-t border-border" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-text">
                <span>Subtotal</span>
                <span>Rs. {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-text">
                <span>Delivery Charges</span>
                <span>Rs. {shipping.toLocaleString()}.00</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-text">
                <span>Total</span>
                <span className="text-brand">Rs. {total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentRow({
  label,
  value,
  onCopy,
}: {
  label: string;
  value: string;
  onCopy: (text: string, label: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
      <div className="min-w-0">
        <dt className="text-xs text-neutral">{label}</dt>
        <dd className="truncate font-medium text-text">{value}</dd>
      </div>
      <button
        type="button"
        onClick={() => onCopy(value, label)}
        className="inline-flex shrink-0 items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-text hover:border-brand hover:text-brand"
      >
        <Copy className="h-3.5 w-3.5" />
        Copy
      </button>
    </div>
  );
}

function generateOrderId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "";
  for (let i = 0; i < 9; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

function OrderSuccess({ order }: { order: PlacedOrder }) {
  const logoUrl = useLogoUrl();
  const [openSummary, setOpenSummary] = useState(false);
  const waHref = `https://wa.me/923091726858?text=${encodeURIComponent(
    `Order #${order.id} — payment screenshot attached.`,
  )}`;

  return (
    <div className="min-h-screen bg-bg2 py-6 sm:py-10">
      <div className="a9-container max-w-2xl">
        {/* Brand header */}
        <div className="mb-5 flex flex-col items-center text-center">
          <img
            src={logoUrl}
            alt="Android 966 Official Logo"
            className="a9-logo-img h-14 w-14 rounded-xl object-cover"
          />
          <h2 className="mt-3 text-lg font-semibold tracking-tight text-text">Android 966</h2>
          <p className="text-xs text-neutral">#Pakistan's No.1 Tech Store</p>
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          {/* Order summary accordion */}
          <button
            type="button"
            onClick={() => setOpenSummary((o) => !o)}
            className="flex w-full items-center justify-between border-b border-border px-5 py-4 text-left"
          >
            <span className="flex items-center gap-2 text-sm font-medium text-text">
              Order summary
              <ChevronDown
                className={`h-4 w-4 transition-transform ${openSummary ? "rotate-180" : ""}`}
              />
            </span>
            <span className="text-base font-semibold text-text">
              Rs {order.total.toLocaleString()}.00
            </span>
          </button>
          {openSummary && (
            <div className="border-b border-border bg-bg2/40 px-5 py-3 text-sm">
              <ul className="divide-y divide-border">
                {order.items.map((it, i) => (
                  <li key={i} className="flex items-center justify-between py-2">
                    <span className="min-w-0 truncate pr-3 text-text">
                      {it.name} <span className="text-neutral">× {it.quantity}</span>
                    </span>
                    <span className="font-medium text-text">
                      Rs {(it.price * it.quantity).toLocaleString()}.00
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 space-y-1.5 border-t border-border pt-3">
                <div className="flex items-center justify-between text-text">
                  <span>Subtotal</span>
                  <span>Rs {order.subtotal.toLocaleString()}.00</span>
                </div>
                <div className="flex items-center justify-between text-text">
                  <span>Delivery Charges</span>
                  <span>Rs {order.shipping.toLocaleString()}.00</span>
                </div>
                <div className="flex items-center justify-between pt-1 text-base font-semibold text-text">
                  <span>Total</span>
                  <span>Rs {order.total.toLocaleString()}.00</span>
                </div>
              </div>
            </div>
          )}

          {/* Confirmation */}
          <div className="px-5 pt-6 pb-4 sm:px-8">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                <CheckCircle2 className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-neutral">
                  Confirmation #{order.id}
                </p>
                <h1 className="text-xl font-semibold text-text sm:text-2xl">
                  Thank you{order.name ? `, ${order.name}` : ""}!
                </h1>
              </div>
            </div>

            <h2 className="mt-6 text-lg font-bold text-text">Your order is confirmed</h2>
            <p className="mt-1 text-sm text-neutral">
              Transfer the funds and share a screenshot on our WhatsApp to confirm your order
              successfully.
            </p>

            {/* Bank details */}
            <div className="mt-5 rounded-xl border border-border bg-bg2/60 p-4">
              <h3 className="text-sm font-semibold text-text">Bank Account</h3>
              <dl className="mt-3 space-y-2 text-sm">
                <BankRow label="Account Title" value="Owais Ahmed" />
                <BankRow label="Account Number" value="03091726858" />
                <BankRow label="IBAN" value="PK25JCMA0706923091726858" />
                <BankRow label="Bank" value="JazzCash (Mobilink Microfinance Bank)" />
              </dl>
            </div>

            {/* WhatsApp CTA */}
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              <p>
                Once Paid, confirm your order on our WhatsApp.{" "}
                <span className="font-medium">Message us on WhatsApp.</span>
              </p>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 sm:w-auto"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp #{order.id}
              </a>
            </div>

            <p className="mt-4 text-xs text-neutral">Ordered on {order.date}</p>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-border bg-bg2/50 px-5 py-4 sm:flex-row sm:justify-between sm:px-8">
            <Link
              to="/"
              className="rounded-lg border border-border bg-white px-4 py-2 text-center text-sm font-medium text-text hover:bg-bg2"
            >
              Back to Home
            </Link>
            <Link to="/store" className="btn-primary text-center">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function BankRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5">
      <dt className="text-xs text-neutral">{label}</dt>
      <dd className="break-all font-medium text-text">{value}</dd>
    </div>
  );
}

