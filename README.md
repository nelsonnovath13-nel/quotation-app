# Smart Quotation & Job Management — Core Slice

This is a **working vertical slice** of the full spec, not the complete
system. It implements one product formula (Aluminium Sliding Window) end to
end, correctly, with the architecture the full spec needs — so the rest can
be added without restructuring.

**Important:** this was written in a sandboxed environment with no network
access, so it has not been run with `npm install` / `npm run dev` here. Read
through it before relying on it, and expect to fix the odd typo on first run
— that said, the code is complete and internally consistent.

## What's built and working end to end

- Company (single demo tenant), Customer, Project, Measurement entry
- Server-side pricing engine (`src/lib/pricing.ts`) — never trust client math
- Quotation generation that **snapshots** the exact rates and cost breakdown
  used, so a later rate change never alters an issued quotation
  (`QuotationPriceSnapshot` in `prisma/schema.prisma`)
- A polished multi-page quotation PDF (`@react-pdf/renderer`) with header,
  branding, items table, totals, terms, page numbers, footer
- Mobile-first UI: bottom nav, large touch targets, numeric keyboards for
  measurements, empty states, human-readable errors
- Basic accessibility: semantic HTML, labeled fields, focus rings, no
  color-only status, `prefers-reduced-motion` respected
- Seed script with a demo company, materials, rates, customer, project

## What's intentionally NOT built yet (extension points)

These were in the spec but are out of scope for a first working slice —
each has a clear place to slot into the existing architecture:

- **Auth / multi-tenant login** — `src/lib/current-company.ts` currently
  just grabs the first company in the DB. Swap its body for a real session
  lookup (NextAuth, Clerk, etc.) and every page keeps working unchanged.
- **Admin UI for products, materials, rates, pricing rules** — the tables
  exist (`Product`, `Material`, `MaterialRate`) and are seeded via script;
  there's no UI to edit them yet. Add `/admin/materials` etc.
- **More product formulas** (PVC, steel gates, casement windows, custom
  fields) — add entries to the `FORMULAS` registry in `src/lib/pricing.ts`.
  The `MeasurementItem.spec` JSON field already supports per-product extra
  fields (frame, lock, automation, etc.).
- **Company onboarding flow, logo upload, quotation template settings**
- **Follow-ups dashboard** — the `FollowUp` model exists; no UI yet.
- **Discount / tax entry, role-based pricing visibility for employees**
- **Postgres in production** — schema currently targets SQLite for local
  simplicity (`prisma/schema.prisma` datasource). Change the provider to
  `postgresql` and set `DATABASE_URL` before deploying.

## Running it locally

```bash
npm install
cp .env.example .env
npm run db:push     # creates the SQLite database from the schema
npm run db:seed     # demo company, customer, project, measurements
npm run dev
```

Then open http://localhost:3000 — you'll land on the dashboard for the
seeded demo company. Go to **Customers → Grace Mushi → project → Add
Measurement → Calculate Price & Generate Quotation → Download Quotation
PDF** to see the whole flow, including the PDF.

## Why the pricing/snapshot design works the way it does

`generateQuotation` (in `src/app/actions.ts`) recalculates from the
project's measurements against the **current** material rates, then writes
that exact result into `QuotationPriceSnapshot` alongside the rates used.
The quotation's line items and totals are stored directly on `Quotation` /
`QuotationItem` too — so even if you later change a material's rate, drop a
material, or edit the pricing formula, every quotation already issued keeps
showing the numbers it was generated with. Only new quotations pick up the
new rate.
