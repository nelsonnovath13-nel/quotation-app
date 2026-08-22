# Smart Quotation & Job Management

A real mobile-first quotation system for Tanzanian aluminium, PVC, glass and fabrication workshops.

## What this MVP actually does

- Persistent PostgreSQL data model (production target: Supabase/PostgreSQL).
- Customer and project records.
- One project can contain **many categories and many products**.
- Each product can contain many measurement lines.
- Core products: aluminium sliding/casement windows, aluminium doors, sliding doors, shop fronts, partitions, PVC windows/doors, shower doors and glass railings.
- Server-side pricing formulas and material-rate history.
- Quotations freeze the exact prices used when they are generated.
- Grouped quotation review by category and product.
- Mobile-friendly measurement entry with numeric keyboards.
- PDF quotation generation from stored quotation data.
- WhatsApp share, phone call and quotation status workflow.
- Follow-up data model ready for the next workflow slice.

## Data model

`Company → Customer → Project → MeasurementItem[] → Quotation → QuotationItem[] + QuotationPriceSnapshot`

A quotation is generated from all measurement items in a project, so a single quotation can contain, for example:

- Aluminium → Sliding Windows → W01, W02
- Aluminium → Doors → D01
- PVC → Windows → P01, P02
- Shower / Glass → Shower Door → S01

## Production setup

This repository targets PostgreSQL. Do not deploy with SQLite for production because serverless deployments need persistent shared storage.

1. Create a PostgreSQL database (Supabase is recommended).
2. Set `DATABASE_URL` in Vercel.
3. Run:

```bash
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run build
```

4. Deploy the `mvp/real-quotation` branch or merge it into `main`.

## Important pricing rule

Prices are calculated on the server from the current material-rate table. A generated quotation stores a `QuotationPriceSnapshot`, so changing rates later does not change an old quotation.

## Current branch

The production MVP work is on `mvp/real-quotation`.
