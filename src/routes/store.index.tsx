import { useState, useMemo, useEffect } from "react";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import { Search, SlidersHorizontal } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useMergedProducts } from "@/lib/publicContent";
import { BannerSlot } from "@/components/PromoBanner";


import { createPageHead, getBreadcrumbSchema } from "@/lib/seo";

const PAGE_SIZE = 9;

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
];

const categories = [
  { value: "all", label: "All Products" },
  { value: "tech", label: "Tech Products" },
  { value: "perfume", label: "Perfumes" },
  { value: "accessories", label: "Accessories" },
];

const ratings = [
  { value: "5", label: "5 stars only" },
  { value: "4", label: "4 stars & up" },
  { value: "all", label: "All ratings" },
];

export const Route = createFileRoute("/store/")({
  validateSearch: (s: Record<string, unknown>): { category?: string; q?: string } => {
    const res: { category?: string; q?: string } = {};
    if (typeof s.category === "string" && s.category) res.category = s.category;
    if (typeof s.q === "string" && s.q) res.q = s.q;
    return res;
  },
  head: () =>
    createPageHead({
      title: "Online Store: Gadgets & Fragrances | Android 966",
      description:
        "Shop premium tech gadgets, smartwatches, earbuds, and luxury perfumes online across Pakistan with fast delivery and JazzCash.",
      path: "/store",
      keywords: [
        "tech gadgets pakistan",
        "buy perfumes online pakistan",
        "smartwatches online store",
        "wireless earbuds karachi",
        "android 966 store",
      ],
      jsonLd: [
        getBreadcrumbSchema([
          { name: "Home", item: "/" },
          { name: "Store", item: "/store" },
        ]),
      ],
    }),
  component: StorePage,
});

function StorePage() {
  const search = useSearch({ from: "/store/" }) as { category?: string; q?: string };
  const [query, setQuery] = useState(search.q || "");
  const [category, setCategory] = useState(search.category || "all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [rating, setRating] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const { products } = useMergedProducts();

  useEffect(() => {
    setCategory(search.category || "all");
    setQuery(search.q || "");
    setPage(1);
  }, [search.category, search.q]);

  const filtered = useMemo(() => {

    let result = [...products];

    if (category !== "all") {
      if (category === "accessories") {
        result = result.filter((p) => p.subcategory === "Accessories");
      } else {
        result = result.filter((p) => p.category === category);
      }
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }

    const min = parseInt(minPrice, 10);
    const max = parseInt(maxPrice, 10);
    if (!isNaN(min)) result = result.filter((p) => p.price >= min);
    if (!isNaN(max)) result = result.filter((p) => p.price <= max);

    if (rating === "5") result = result.filter((p) => p.rating === 5);
    if (rating === "4") result = result.filter((p) => p.rating >= 4);

    if (sort === "price-asc") result.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") result.sort((a, b) => b.price - a.price);
    if (sort === "popular") result.sort((a, b) => b.reviews - a.reviews);
    if (sort === "newest")
      result.sort((a, b) => (a.badge === "New" ? -1 : b.badge === "New" ? 1 : 0));

    return result;
  }, [products, category, query, minPrice, maxPrice, rating, sort]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageProducts = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const FilterSidebar = () => (
    <div className="space-y-6">
      <h2 className="text-base font-semibold text-text border-b border-border pb-2">Filter Products</h2>
      <div>
        <label className="mb-2 block text-sm font-medium text-text">Search products</label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral" />
          <input
            type="text"
            placeholder="Search..."
            className="a9-input w-full pl-10!"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-text">Category</label>
        <div className="flex flex-col gap-2">
          {categories.map((cat) => (
            <label
              key={cat.value}
              className="flex cursor-pointer items-center gap-2 text-sm text-text"
            >
              <input
                type="radio"
                name="category"
                className="h-4 w-4 accent-brand"
                checked={category === cat.value}
                onChange={() => setCategory(cat.value)}
              />
              {cat.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-text">Price Range</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min Rs."
            className="a9-input w-full"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <input
            type="number"
            placeholder="Max Rs."
            className="a9-input w-full"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-text">Rating</label>
        <div className="flex flex-col gap-2">
          {ratings.map((r) => (
            <label
              key={r.value}
              className="flex cursor-pointer items-center gap-2 text-sm text-text"
            >
              <input
                type="radio"
                name="rating"
                className="h-4 w-4 accent-brand"
                checked={rating === r.value}
                onChange={() => setRating(r.value)}
              />
              {r.label}
            </label>
          ))}
        </div>
      </div>

      <button
        className="btn-primary w-full"
        onClick={() => {
          setPage(1);
          setMobileFiltersOpen(false);
        }}
      >
        Apply Filters
      </button>
    </div>
  );

  return (
    <div className="bg-white pt-5 pb-10 sm:pt-6 sm:pb-12">
      <div className="a9-container">
        <div className="mb-4"><BannerSlot placement="store_top" /></div>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "Store" }]} />
          <div className="flex items-center gap-3">
            <span className="text-sm text-neutral">{filtered.length} products</span>
            <select
              className="a9-input cursor-pointer"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-8 border-b border-border pb-6">
          <h1 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">
            Online Store: Tech Gadgets & Luxury Fragrances
          </h1>
          <p className="mt-2 text-sm text-neutral sm:text-base max-w-2xl leading-relaxed">
            Browse our verified collection of smartwatches, audio devices, phone accessories, and signature perfumes. Enjoy fast Pakistan-wide shipping and secure payment methods.
          </p>
        </div>

        {/* Mobile filter button */}
        <div className="mb-4 lg:hidden">
          <button
            className="btn-outline flex items-center gap-2"
            onClick={() => setMobileFiltersOpen(true)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar desktop */}
          <aside className="hidden w-[220px] shrink-0 lg:block">
            <FilterSidebar />
          </aside>

          {/* Main grid */}
          <div className="min-w-0 flex-1">
            {pageProducts.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-neutral">No products found matching your filters.</p>
                <button
                  className="mt-4 btn-primary"
                  onClick={() => {
                    setQuery("");
                    setCategory("all");
                    setMinPrice("");
                    setMaxPrice("");
                    setRating("all");
                    setPage(1);
                  }}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {pageProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-8 flex flex-wrap justify-center gap-2">
                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const p = idx + 1;
                      return (
                        <button
                          key={p}
                          className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
                            page === p
                              ? "border-brand bg-brand text-white"
                              : "border-border text-text hover:border-brand"
                          }`}
                          onClick={() => setPage(p)}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filters drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text">Filters</h3>
              <button onClick={() => setMobileFiltersOpen(false)}>
                <span className="text-2xl text-neutral">&times;</span>
              </button>
            </div>
            <FilterSidebar />
          </div>
        </div>
      )}
    </div>
  );
}
