import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Minus, Plus, ShoppingCart } from "lucide-react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { StarRating } from "@/components/StarRating";
import { ProductCard } from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { useProductBySlug, useMergedProducts } from "@/lib/publicContent";
import { products as staticProducts } from "@/data/products";
import { createPageHead, getProductSchema, getBreadcrumbSchema } from "@/lib/seo";

export const Route = createFileRoute("/store/$productId")({
  head: ({ params }) => {
    const p = staticProducts.find((item) => item.id === params.productId);
    const title = p ? `${p.name} | Android 966 Pakistan` : "Product Details | Android 966";
    const description = p
      ? (p.description ? p.description.slice(0, 155) : `Buy authentic ${p.name} online at Android 966 with fast shipping in Pakistan.`)
      : "Shop authentic tech gadgets, smartphones, accessories, and perfumes at Android 966 Pakistan.";

    const jsonLd = p
      ? [
          getProductSchema(p),
          getBreadcrumbSchema([
            { name: "Home", item: "/" },
            { name: "Store", item: "/store" },
            { name: p.name, item: `/store/${p.id}` },
          ]),
        ]
      : [
          getBreadcrumbSchema([
            { name: "Home", item: "/" },
            { name: "Store", item: "/store" },
          ]),
        ];

    return createPageHead({
      title,
      description,
      path: `/store/${params.productId}`,
      keywords: p
        ? [p.name, p.category, p.subcategory, "buy online pakistan", "android 966"].filter(Boolean) as string[]
        : ["tech store pakistan", "android 966"],
      jsonLd,
      ogType: "product",
    });
  },
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { productId } = Route.useParams();
  const { product, isLoading } = useProductBySlug(productId);
  const { products: allProducts } = useMergedProducts();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "reviews">("description");
  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const { addItem } = useCart();
  const { addToast } = useToast();

  if (isLoading) {
    return (
      <div className="a9-container py-16 text-center text-sm text-neutral">Loading…</div>
    );
  }

  if (!product) {
    return (
      <div className="a9-container py-16 text-center">
        <h1 className="text-2xl font-semibold text-text">Product not found</h1>
        <p className="mt-2 text-sm text-neutral">The product you are looking for does not exist.</p>
        <Link to="/store" className="mt-6 inline-block btn-primary">
          Browse Store
        </Link>
      </div>
    );
  }

  const related = allProducts
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 3);

  const hasVariants = !!product.variants && product.variants.length > 0;
  const variant = hasVariants ? product.variants![Math.min(selectedVariant, product.variants!.length - 1)] : null;
  const displayPrice = variant ? variant.price : product.price;
  const displayOriginal = variant?.originalPrice ?? product.originalPrice;
  const displaySku = variant?.sku ?? product.sku;

  const discount = displayOriginal > displayPrice
    ? Math.round(((displayOriginal - displayPrice) / displayOriginal) * 100)
    : 0;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) addItem(product.id);
    addToast(
      variant
        ? `Added ${quantity} × ${product.name} (${variant.size}) to cart! ✓`
        : `Added ${quantity} to cart! ✓`,
    );
  };


  return (
    <div className="bg-white py-8">
      <div className="a9-container">
        <Breadcrumb
          items={[
            { label: "Home", to: "/" },
            { label: "Store", to: "/store" },
            { label: categoryLabel(product.category), to: "/store" },
            { label: product.name },
          ]}
        />

        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          {/* Image gallery */}
          <div>
            <div className="overflow-hidden rounded-xl border border-border" style={{ backgroundColor: product.bgColor }}>
              <img
                src={product.image}
                alt={`${product.name} — Buy online in Pakistan at Android 966`}
                className="h-[300px] sm:h-[400px] w-full object-cover"
                loading="eager"
              />
            </div>
            <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
              {Array.from({ length: 4 }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-colors ${
                    activeImage === idx ? "border-brand" : "border-border"
                  }`}
                  style={{ backgroundColor: product.bgColor }}
                  aria-label={`View photo ${idx + 1} of ${product.name}`}
                >
                  <img
                    src={product.image}
                    alt={`${product.name} photo preview ${idx + 1}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product info */}
          <div>
            <span className="section-label">{categoryLabel(product.category)}</span>
            <h1 className="mt-2 text-2xl font-semibold text-text">{product.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <StarRating rating={product.rating} />
              <span className="text-sm text-neutral">({product.reviews} reviews)</span>
              <span className="badge-stock">In Stock</span>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <span className="text-3xl font-semibold text-brand">
                Rs. {displayPrice.toLocaleString()}
              </span>
              {displayOriginal > displayPrice && (
                <>
                  <span className="text-lg text-neutral line-through">
                    Rs. {displayOriginal.toLocaleString()}
                  </span>
                  <span className="badge-sale">-{discount}%</span>
                </>
              )}
            </div>
            {displaySku && (
              <p className="mt-1 text-xs text-neutral">SKU: {displaySku}</p>
            )}

            {hasVariants && (
              <div className="mt-5">
                <p className="mb-2 text-sm font-medium text-text">
                  Size: <span className="text-brand">{variant?.size}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.variants!.map((vr, i) => {
                    const active = i === selectedVariant;
                    return (
                      <button
                        key={`${vr.size}-${i}`}
                        onClick={() => setSelectedVariant(i)}
                        className={`flex min-w-0 flex-1 basis-[calc(50%-0.25rem)] flex-col items-center rounded-lg border px-2 py-2 text-sm font-medium transition-colors sm:flex-none sm:basis-auto sm:px-4 ${
                          active
                            ? "border-brand bg-brand text-white"
                            : "border-border bg-white text-text hover:border-brand"
                        }`}
                      >
                        <span className="block w-full truncate text-center">{vr.size}</span>
                        <span className={`block w-full truncate text-center text-xs ${active ? "text-white/85" : "text-neutral"}`}>
                          Rs. {vr.price.toLocaleString()}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <blockquote className="mt-5 rounded-r-lg border-l-4 border-brand bg-bg2 p-4 text-sm leading-relaxed text-text">
              {product.description}
            </blockquote>

            <div className="my-6 border-t border-border" />


            <div className="flex items-center gap-3">
              <div className="flex h-11 items-center rounded-lg border border-border">
                <button
                  className="flex h-11 w-11 items-center justify-center text-text hover:text-brand"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center text-sm font-medium text-text">{quantity}</span>
                <button
                  className="flex h-11 w-11 items-center justify-center text-text hover:text-brand"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <button
                className="btn-primary min-h-[44px] flex-1 gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={handleAddToCart}
                disabled={product.inStock === false}
              >
                <ShoppingCart className="h-4 w-4" />
                {product.inStock === false ? "Out of Stock" : "Add to Cart"}
              </button>
            </div>
            <button className="mt-3 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-border py-2.5 text-sm font-medium text-text transition-colors hover:border-brand">
              <Heart className="h-4 w-4" />
              Add to Wishlist
            </button>

            <div className="mt-5 flex flex-wrap gap-2">
              {product.tags.map((tag: string) => (
                <span key={tag} className="chip">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-10">
          <div className="flex gap-4 border-b border-border">
            {[
              { key: "description", label: "Description" },
              { key: "specs", label: "Specifications" },
              { key: "reviews", label: "Reviews" },
            ].map((tab) => (
              <button
                key={tab.key}
                className={`border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
                  activeTab === (tab.key as typeof activeTab)
                    ? "border-brand text-brand"
                    : "border-transparent text-neutral"
                }`}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="py-6">
            {activeTab === "description" && (
              <p className="text-sm leading-relaxed text-text">{product.description}</p>
            )}
            {activeTab === "specs" && (
              <div className="max-w-2xl overflow-hidden rounded-xl border border-border">
                {Object.entries(product.specs).map(([key, value], idx) => (
                  <div
                    key={key}
                    className={`flex justify-between px-4 py-3 text-sm ${
                      idx % 2 === 0 ? "bg-white" : "bg-bg2"
                    }`}
                  >
                    <span className="font-medium text-text">{key}</span>
                    <span className="text-neutral">{String(value)}</span>
                  </div>
                ))}
              </div>
            )}
            {activeTab === "reviews" && <ReviewsList />}
          </div>
        </div>

        {/* Related products */}
        <div className="mt-8">
          <h2 className="mb-6 text-xl font-semibold text-text">You may also like</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewsList() {
  const reviews = [
    {
      name: "Ali R.",
      initials: "AR",
      rating: 5,
      date: "3 days ago",
      text: "Bohat achi quality hai. Fast delivery aur product bilkul same as described. Android 966 ki recommendation ka bharosa hai.",
    },
    {
      name: "Sara K.",
      initials: "SK",
      rating: 4,
      date: "1 week ago",
      text: "Value for money. Packaging achi thi. Bass delivery thodi late hui but product perfect hai.",
    },
    {
      name: "Usman T.",
      initials: "UT",
      rating: 5,
      date: "2 weeks ago",
      text: "Best budget option. Long lasting performance. Highly recommended for everyone.",
    },
  ];

  return (
    <div className="space-y-4">
      {reviews.map((review, idx) => (
        <div key={idx} className="rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-medium text-white">
              {review.initials}
            </div>
            <div>
              <p className="text-sm font-medium text-text">{review.name}</p>
              <div className="flex items-center gap-2">
                <StarRating rating={review.rating} />
                <span className="text-xs text-neutral">{review.date}</span>
              </div>
            </div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-text">{review.text}</p>
        </div>
      ))}
    </div>
  );
}

function categoryLabel(category: string) {
  return category === "tech" ? "Tech Products" : "Perfumes";
}
