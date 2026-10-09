import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { StarRating } from "./StarRating";
import type { Product } from "@/data/products";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { addToast } = useToast();
  const outOfStock = product.inStock === false;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    addItem(product.id);
    addToast("Added to cart! ✓");
  };

  const hasDiscount =
    product.originalPrice != null && product.originalPrice > product.price;

  return (
    <div className="a9-card group overflow-hidden">
      <Link to="/store/$productId" params={{ productId: product.id }}>
        <div
          className="product-image relative h-40 overflow-hidden"
          style={{ backgroundColor: product.bgColor }}
        >
          <img
            src={product.image}
            alt={`${product.name} — Buy online on Android 966 Pakistan`}
            loading="lazy"
            width={320}
            height={200}
            className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
              outOfStock ? "opacity-60 grayscale" : ""
            }`}
          />
          {product.badge && (
            <span className="absolute left-3 top-3">
              {product.badge === "New" && <span className="badge-new">{product.badge}</span>}
              {product.badge === "Sale" && <span className="badge-sale">{product.badge}</span>}
              {product.badge === "Bestseller" && (
                <span className="badge-bestseller">{product.badge}</span>
              )}
            </span>
          )}
          {outOfStock && (
            <span className="absolute right-3 top-3 rounded-full bg-slate-900/85 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
              Out of stock
            </span>
          )}
        </div>
      </Link>
      <div className="p-4">
        <span className="section-label">
          {product.category === "tech" ? "Tech Products" : "Perfumes"}
        </span>
        <Link to="/store/$productId" params={{ productId: product.id }}>
          <h3 className="mt-1 text-sm font-semibold text-text line-clamp-1 hover:text-brand">
            {product.name}
          </h3>
        </Link>
        <div className="mt-1">
          <StarRating rating={product.rating} />
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex flex-col leading-tight">
            <span className="text-base font-semibold text-brand">
              Rs. {product.price.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-xs text-neutral line-through">
                Rs. {product.originalPrice!.toLocaleString()}
              </span>
            )}
          </div>
          <button
            onClick={handleAdd}
            disabled={outOfStock}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text transition-colors hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-text"
            aria-label={outOfStock ? "Out of stock" : "Add to cart"}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

