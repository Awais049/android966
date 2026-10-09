import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, X, Lock, ArrowLeft } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { EmptyState } from "@/components/EmptyState";
import { createPageHead } from "@/lib/seo";

export const Route = createFileRoute("/cart")({
  head: () =>
    createPageHead({
      title: "Shopping Cart | Android 966 Pakistan",
      description: "Review items in your cart and proceed to secure checkout on Android 966 Pakistan.",
      path: "/cart",
      noIndex: true,
    }),
  component: CartPage,
});

const COUPONS: Record<string, number> = {
  A966: 200,
  TECH10: 300,
  PERFUME15: 250,
};

function CartPage() {
  const { cartProducts, updateQuantity, removeItem, subtotal, shipping, total, discount, applyDiscount } =
    useCart();
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);

  const handleApplyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    if (COUPONS[code]) {
      applyDiscount(COUPONS[code]);
      setCouponApplied(true);
    } else {
      applyDiscount(0);
      setCouponApplied(false);
    }
  };

  if (cartProducts.length === 0) {
    return (
      <div className="bg-white pt-5 pb-10 sm:pt-6 sm:pb-12">
        <div className="a9-container">
          <EmptyState
            icon="📦"
            title="Your cart is empty"
            description="Looks like you haven't added anything to your cart yet."
            actionTo="/store"
            actionLabel="Browse Store"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white pt-5 pb-10 sm:pt-6 sm:pb-12">
      <div className="a9-container">
        <h1 className="mb-6 text-2xl font-semibold text-text">
          Shopping Cart ({cartProducts.reduce((sum, { quantity }) => sum + quantity, 0)} items)
        </h1>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Cart items */}
          <div className="flex-1">
            <div className="hidden border-b border-border py-2 text-sm font-medium text-neutral sm:grid sm:grid-cols-[2fr_1fr_1fr_1fr_auto]">
              <span>Product</span>
              <span>Price</span>
              <span>Qty</span>
              <span>Total</span>
              <span className="sr-only">Remove</span>
            </div>

            {cartProducts.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="grid items-center gap-4 border-b border-border py-4 sm:grid-cols-[2fr_1fr_1fr_1fr_auto]"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg text-2xl"
                    style={{ backgroundColor: product.bgColor }}
                  >
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={`${product.name} — Cart item`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = "none";
                          (e.currentTarget.parentElement as HTMLElement).textContent = product.emoji;
                        }}
                      />
                    ) : (
                      product.emoji
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text">{product.name}</p>
                    <p className="text-xs text-neutral">SKU: {product.sku}</p>
                  </div>
                </div>
                <p className="text-sm text-text">Rs. {product.price.toLocaleString()}</p>
                <div className="flex h-9 items-center rounded-lg border border-border">
                  <button
                    className="flex h-9 w-9 items-center justify-center text-text hover:text-brand"
                    onClick={() => updateQuantity(product.id, quantity - 1)}
                    aria-label={`Decrease quantity of ${product.name}`}
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-8 text-center text-sm font-medium text-text">{quantity}</span>
                  <button
                    className="flex h-9 w-9 items-center justify-center text-text hover:text-brand"
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                    aria-label={`Increase quantity of ${product.name}`}
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <p className="text-sm font-medium text-text">
                  Rs. {(product.price * quantity).toLocaleString()}
                </p>
                <button
                  className="btn-danger flex h-9 w-9 items-center justify-center"
                  onClick={() => removeItem(product.id)}
                  aria-label={`Remove ${product.name} from cart`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex flex-1 gap-2">
                <input
                  type="text"
                  placeholder="Coupon code"
                  className="a9-input flex-1 min-h-[44px]"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                />
                <button className="btn-outline min-h-[44px]" onClick={handleApplyCoupon}>
                  Apply
                </button>
              </div>
              <Link
                to="/store"
                className="flex items-center gap-1 text-sm text-brand hover:text-brand-hover min-h-[44px]"
              >
                <ArrowLeft className="h-4 w-4" />
                Continue Shopping
              </Link>
            </div>
            {couponApplied && (
              <p className="mt-2 text-sm text-emerald-600">Coupon applied successfully!</p>
            )}
          </div>

          {/* Order summary */}
          <div className="w-full shrink-0 rounded-xl border border-border bg-white p-5 lg:w-[260px]">
            <h2 className="text-lg font-semibold text-text">Order Summary</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between text-text">
                <span>Subtotal</span>
                <span>Rs. {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-text">
                <span>Delivery Charges</span>
                <span>Rs. {shipping.toLocaleString()}.00</span>
              </div>
              <div className="flex justify-between text-text">
                <span>Discount</span>
                <span className="text-accent-warm">— Rs. {discount.toLocaleString()}</span>
              </div>
            </div>
            <div className="my-4 border-t border-border" />
            <div className="flex justify-between text-base font-semibold text-text">
              <span>Total</span>
              <span className="text-brand">Rs. {total.toLocaleString()}</span>
            </div>
            <Link to="/checkout" className="mt-5 block w-full text-center btn-primary min-h-[44px] flex items-center justify-center">
              Proceed to Checkout
            </Link>
            <p className="mt-3 flex items-center justify-center gap-1 text-xs text-neutral">
              <Lock className="h-3 w-3" />
              Secure Checkout · SSL Encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
