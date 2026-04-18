# Maker Day Dublin

A one-day conference landing page + ticketing flow, built with Astro + Tailwind v4 + Supabase + Stripe + Resend.

## What's here

- **Hero / About / Schedule / Speakers / Tickets** — a single-page conference site.
- **Schedule + speakers + products** are read from Supabase (`mdd_talks`, `mdd_speakers`, `mdd_products`).
- **Dynamic Stripe checkout** — `/api/checkout` builds a Checkout Session on the fly from the DB row using `price_data`. No pre-baked Stripe prices.
- **Webhook** — `/api/stripe/webhook` handles `checkout.session.completed`: writes an `mdd_orders` row with a generated ticket code, then sends a confirmation email via Resend.
- **SEO** — canonical URLs, Open Graph, Event JSON-LD, `/sitemap.xml`, `/robots.txt`.
- **Harbor hook** — `mdd_content` table exists with the standard `title / slug / body / seo_description / published_at` shape so Harbor can write articles later.

## Environment variables

See `.env.example`. The important ones:

| Variable | Purpose |
| --- | --- |
| `PUBLIC_SUPABASE_URL` | Supabase project URL |
| `PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/publishable key |
| `STRIPE_SECRET_KEY` | Stripe server-side key |
| `PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe client key (unused client-side today but ready) |
| `STRIPE_WEBHOOK_SECRET` | Set after registering the Vercel webhook |
| `RESEND_API_KEY` | Resend REST key |
| `PUBLIC_SITE_URL` | Canonical site origin |

## Local dev

```bash
npm install
npm run dev
```

## Database

All Maker Day tables are prefixed `mdd_` so they can safely share a Supabase project. See the migration `maker_day_dublin_init` for schema + seeds.

## TODOs after launch

- Point a custom domain (e.g. `makerdaydublin.ie`) at the Vercel project and update `PUBLIC_SITE_URL`.
- Verify a sending domain on Resend and swap `from` in `src/lib/email.ts` off `onboarding@resend.dev`.
- Swap speaker photo URLs from `api.dicebear.com` placeholders to real headshots.
- Add an `/admin` view (or Supabase Studio shortcut) for viewing `mdd_orders`.
