# Android 966 Admin Panel — Implementation Plan

## Goal
Add a protected `/admin` area to the existing site, backed by Lovable Cloud (real auth + Postgres). Owner can manage Products, Blog Posts, Videos, Orders, and see a Dashboard. Publish when done.

## Phase 1 — Backend (Lovable Cloud)
1. Enable Lovable Cloud.
2. Create schema (migrations, with GRANTs + RLS):
   - `app_role` enum (`admin`, `user`)
   - `user_roles` (user_id, role) + `has_role()` security-definer function
   - `products` (id, name, slug, price, original_price, category, rating, badge, image, description, stock, created_at)
   - `blog_posts` (id, slug, title, excerpt, category, image, body jsonb, published, created_at)
   - `videos` (id, title, youtube_id, thumbnail, description, created_at)
   - `orders` (id, order_number, customer_name, phone, email, address, city, province, postal_code, items jsonb, subtotal, shipping, total, status enum, created_at)
3. RLS: public SELECT on products/blog_posts (published)/videos; admin-only write on all; orders insert = anyone (checkout), select/update = admin only.
4. Seed with existing mock products and blog posts.

## Phase 2 — Auth
- Email/password sign-in on `/admin/login` (no public signup — admins manually granted via `user_roles`).
- First-time bootstrap: instruct user to sign up once, then run SQL to grant admin role (documented in-app).
- Use TanStack Start integration-managed `_authenticated` gate + additional admin role check.

## Phase 3 — Admin UI (`/admin/*`)
Routes under `src/routes/_authenticated/admin/`:
- `admin/index.tsx` — Dashboard (stats: total products, total orders, total revenue, recent 5 orders, order status breakdown)
- `admin/products.tsx` — table (list, edit, delete, add via modal/drawer)
- `admin/blog.tsx` — table with same CRUD
- `admin/videos.tsx` — table with same CRUD
- `admin/orders.tsx` — table + detail drawer + status dropdown

Shared:
- `AdminLayout` with left sidebar (220px, brand logo, nav links) + top bar (user email, logout). Responsive: sidebar collapses to hamburger on mobile.
- Reused design tokens (brand, bg2, border, etc.).
- Status badges (Pending yellow, Processing blue, Shipped green, Delivered green-dark, Cancelled red).

## Phase 4 — Wire Public Site to DB
- Update `src/data/products.ts` / `blogPosts.ts` to read from Cloud via server fns (with fallback to keep home page rendering fast).
- Checkout: insert real order row on confirm; keep JazzCash instructions and success invoice.
- Add videos section on home if data exists.

## Phase 5 — Verify & Publish
- Build check, Playwright smoke test on `/admin/login` + `/admin`.
- Publish site.

## Technical Notes
- Server functions in `src/lib/admin.functions.ts` with `requireSupabaseAuth` + `has_role` check before any write.
- Order status enum: `pending | processing | shipped | delivered | cancelled`.
- Order number: use existing 9-char generator, stored in `order_number` column.
- Images: URL strings (Unsplash for seeds; admin form accepts URL — no upload flow in this phase).
- No user-profiles table (admin identified purely by `user_roles`).

## Scope Explicitly Out
- Image uploads (URL input only)
- Multi-admin invite flow
- Order email notifications
- Analytics beyond the dashboard stat cards