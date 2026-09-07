# OneCoreLab — Website Rebuild

A full-stack rebuild of onecorelab.com: a cinematic, interactive marketing
site plus an authenticated admin dashboard, built on Next.js 14 (App Router),
TypeScript, Tailwind CSS, and PostgreSQL (via Drizzle ORM).

This build was verified end-to-end in development: a real local Postgres
instance was stood up, the schema was pushed, the database was seeded, a full
production build (`next build`) was run against it, and the running server
was smoke-tested — including minting real signed session tokens to confirm
every role boundary (Super Admin / Admin / Staff), an unauthenticated
redirect, and a mid-session account-disable lockout all behave correctly.

## 1. Requirements

- Node.js 20+ (tested on Node 22)
- A PostgreSQL 14+ database (local, Docker, or a hosted provider like
  [Neon](https://neon.tech), [Supabase](https://supabase.com), or
  [Railway](https://railway.app))

## 2. Setup

```bash
npm install
cp .env.example .env
```

Edit `.env`:

```bash
DATABASE_URL=postgres://user:password@localhost:5432/onecorelab
AUTH_SECRET=<a long random string — e.g. `openssl rand -base64 48`>
SEED_SUPER_ADMIN_EMAIL=you@yourcompany.com
SEED_SUPER_ADMIN_PASSWORD=<a strong password — change this before going live>
```

Push the schema and seed the database (creates your Super Admin account and
the real OneCoreLab portfolio from the current site):

```bash
npm run db:push
npm run db:seed
```

Run it:

```bash
npm run dev
```

- Public site: http://localhost:3000
- Admin dashboard: http://localhost:3000/admin/login — sign in with the
  `SEED_SUPER_ADMIN_EMAIL` / `SEED_SUPER_ADMIN_PASSWORD` you set above.

## 3. What's real vs. what needs your assets

This is a genuine, working full-stack app — not a static mockup. A few
things are intentionally stubbed with clear seams to drop real assets into:

| Item | Status | To finish it |
|---|---|---|
| Logos (`/public/onecorelabWhite.png`, `onecorelabBlack.png`) | Placeholder wordmark generated for this build | Replace with your real logo files at the same paths/aspect ratio |
| Fonts | **Done** — Bodoni Moda / Geist Sans / IBM Plex Mono, self-hosted via fontsource | Nothing needed. To change the system, edit the three `--font-*` variables in `app/globals.css` — everything cascades from there |
| Hero video (`/public/videos/hero.mp4`) | **Done** — your supplied MP4, transcoded from HEVC to H.264 for browser support | To swap it, transcode the same way (see round 3 notes) and keep the same filename, or update the path in `components/sections/hero.tsx` |
| Project cover images | Unsplash placeholders (see `db/seed.ts`) | Replace via the admin Projects editor once you have real screenshots |
| Contact form spam protection | Honeypot field only | Consider adding hCaptcha/Turnstile if spam becomes an issue at scale |

## 4. Architecture notes

- **Routing**: Next.js App Router. `/admin/login` is a sibling route *outside*
  the `(dashboard)` route group, so the auth guard in
  `app/admin/(dashboard)/layout.tsx` never wraps (and never redirect-loops on)
  the login page itself.
- **Auth**: Custom email/password auth — bcrypt-hashed passwords, JWT session
  cookies signed with `AUTH_SECRET` (via `jose`), `httpOnly` + `sameSite=lax`.
  No third-party auth provider is wired in, since only internal staff
  accounts were in scope.
- **Authorization**: Enforced in three independent layers, deliberately
  redundant: `middleware.ts` (edge, fast reject), the dashboard layout
  (re-verifies the account is still active in the database on every
  request — this is what makes disabling a staff account take effect
  immediately, not just when their token expires), and every Server Action
  (re-checks role before touching the database, regardless of what the UI
  shows). **Never trust the client** — enforced in practice, not just in
  principle.
- **Database**: Drizzle ORM + `postgres` (a pure-JS Postgres driver), not
  Prisma — this avoids Prisma's native engine binary download at build/dev
  time, which caused problems in network-restricted environments during
  development. Schema lives in `db/schema.ts`; run `npm run db:studio` for a
  visual browser.
- **Mutations**: Implemented as Next.js Server Actions (`actions.ts` files
  beside each admin route) rather than a separate `/api` REST layer — this
  is the idiomatic App Router pattern and gives the same server-side
  guarantees with less code to keep in sync.
- **Animation stack**: `motion` (the current Framer Motion package) for
  React-level animation, GSAP + ScrollTrigger + SplitText for the scroll-
  pinned hero, and Lenis for site-wide smooth scroll — one global instance
  in `components/animations/smooth-scroll-provider.tsx` so nothing fights
  over scroll ownership. Everything respects `prefers-reduced-motion`.
- **21st.dev components**: `components/ui/hero-scroll-video-pin-reveal.tsx`
  and `components/ui/password-strength.tsx` were pulled via the 21st.dev MCP
  connector (not hand-written or guessed) and adapted to the OneCoreLab
  palette/copy — see the comment header in each file for exactly what
  changed and why.

## 5. Commands

```bash
npm run dev          # local dev server
npm run build        # production build
npm run start        # run the production build
npm run typecheck    # tsc --noEmit
npm run db:push      # push schema changes to Postgres (dev)
npm run db:generate  # generate SQL migration files (for production deploys)
npm run db:studio    # visual database browser
npm run db:seed      # (re-)seed super admin + sample portfolio
```

For production, prefer `db:generate` + a proper migration runner over
`db:push`, which is intended for rapid local iteration.

## 6. Deploying

Any Next.js host works (Vercel is the path of least resistance). You'll need:

1. A production Postgres instance — set `DATABASE_URL` in your host's
   environment variables.
2. A strong, unique `AUTH_SECRET`.
3. Run migrations against production (`npm run db:generate` locally, commit
   the generated SQL, then apply it — or run `db:push` once against prod if
   you're comfortable with that for this project's size).
4. Run `npm run db:seed` once against production to create your real Super
   Admin account, then **change that password immediately** via
   `/admin/settings`.
5. Set `NEXT_PUBLIC_SITE_URL` to your real domain (used in metadata,
   `sitemap.xml`, and Open Graph tags).

## 7. Update log — round 3

- **Hero video** (`public/videos/hero.mp4`): the supplied MP4 was **HEVC /
  H.265**, which Chrome and Firefox largely refuse to play in a `<video>`
  tag — as uploaded it would have silently failed for most visitors. It was
  transcoded to H.264 (7.2 MB → 2.1 MB), the unused audio track stripped
  (it always plays muted), `+faststart` applied for progressive streaming,
  and a poster frame extracted to `hero-poster.jpg`. **If you replace this
  video, transcode it the same way** — e.g.
  `ffmpeg -i in.mp4 -c:v libx264 -crf 20 -pix_fmt yuv420p -an -movflags +faststart public/videos/hero.mp4`.
- **Cinematic hero** (`components/sections/hero.tsx`): a tall pinned track
  where scroll position drives `video.currentTime` directly — the visitor
  scrubs the film rather than watching it autoplay. Four chapters (feeling →
  idea → value → brand + CTA) fade/slide/blur in sync with the footage's own
  beats, and the CTAs arrive as part of the final chapter rather than
  sitting under a heading. `StaticHero` is the server-rendered baseline and
  the `prefers-reduced-motion` path.
- **Typography**: rebuilt around three complementary faces — **Bodoni Moda**
  (classical Didone serif, used large and usually italic for major
  headings), **Geist Sans** (body copy, UI, forms, admin), and **IBM Plex
  Mono** (sparingly: eyebrows, labels, tags). Because the site was already
  built on `font-display` / `font-sans` / `font-mono` tokens, this was a
  three-variable change in `globals.css` that cascaded everywhere.
- **Positioning section** (`components/sections/positioning.tsx`): fully
  replaced, not refined. Desktop gets a pinned horizontal editorial
  sequence — vertical scroll drives a horizontal pass through four
  statements, with a parallaxed oversized ghost numeral and progress dots.
  Mobile/tablet gets a vertical staggered reveal instead, because
  horizontal scroll-jacking is unreliable on touch.
- **Technology / stack**: expanded well past the original ten. A legible
  orbit of core tools sits above two counter-scrolling marquee rows
  covering **28 tools** — JavaScript, TypeScript, React, Next.js, Node.js,
  Tailwind, daisyUI, Framer, Vite, GraphQL, PostgreSQL, MongoDB, Redis,
  Prisma, Supabase, Docker, Kubernetes, Cloudflare, Vercel, Git, GitHub,
  Python, Stripe, Zapier, n8n, Notion, Linear, Figma. Copy now leads with
  the per-client-stack message.
- **Brand icons** (`lib/brand-icons.ts`): icon path data is **extracted
  locally from the `simple-icons` package at build-prep time and committed
  as a plain TS file** — no remote CDN requests, no broken-image risk, and
  no 3,400-icon dependency in the bundle. Worth knowing: Simple Icons has
  removed several major brands (Microsoft, AWS, Slack, OpenAI) over
  trademark disputes, so those aren't available; Claude and generic
  "automation" use lucide glyphs instead.
- **Motion vocabulary**: added shared `Parallax` and `MaskReveal` helpers
  alongside the existing `Reveal` / `RevealText`, so sections reuse the same
  reduced-motion-safe primitives instead of hand-rolling animation. Applied
  to Selected Work (drifting imagery, wipe-revealed titles) and the arrow
  micro-interactions.
- **SSR fix**: the first pass gated the hero and positioning behind a
  `mounted` flag, which meant the homepage server-rendered with **no `<h1>`
  and no copy** — bad for SEO and for anyone without JS. Both now render
  real content server-side and upgrade to their scroll-driven versions
  after mount.

## 9. Update log — round 2

This round added, on top of the original build:

- **WhatsApp** (`+1 437 707 8022`): a persistent floating button site-wide
  (`components/ui/whatsapp-button.tsx`), plus inline links in the Footer and
  Contact page. Number/link live in one place — `lib/constants.ts`.
- **Staff Sign In**: a clear nav link (desktop nav + mobile menu) pointing to
  `/admin/login`, separate from the customer-facing "Start a Project" CTA.
- **Route-group restructuring** (`app/(site)/` vs `app/admin/`): the public
  Navbar/Footer/intro/WhatsApp button previously lived in the root layout,
  which wraps *every* route in Next.js — including `/admin`. That meant the
  public chrome was bleeding into the admin dashboard. Public pages now live
  under `app/(site)/`, which has its own layout for that chrome; the root
  layout (`app/layout.tsx`) is intentionally minimal (just the theme/toast
  providers) so `/admin` gets only its own separate shell.
- **Intro sequence**: redesigned to a glassy white/blurred background with
  black typography and a new display font (Bricolage Grotesque), replacing
  the previous dark version — scoped to the intro only, not sitewide.
- **Hero background**: the canvas particle/ASCII field was ported natively
  into React + `<canvas>` (`components/ui/ascii-particle-field.tsx`) rather
  than kept as an iframe pulling Tailwind/GSAP from a CDN at runtime —
  faster, no external runtime dependency, matches the rest of the site's
  theme system.
- **Technology section**: rebuilt around an orbiting tech-icon display
  (`components/ui/orbiting-tech.tsx`) — JavaScript, TypeScript, Next.js,
  React, Tailwind CSS, GitHub, PostgreSQL, daisyUI, Claude, and an
  automation icon — with copy now emphasizing that the stack is chosen per
  client rather than fixed. The icon logos load from the devicon CDN
  (`cdn.jsdelivr.net`); daisyUI, Claude, and "automation" use local icons
  instead since no reliable public logo CDN entry exists for them.
- **Process / "How We Work"**: rebuilt around a diagonally-offset card
  layout with an animated connecting path (`components/ui/how-it-works.tsx`),
  recolored from the reference's orange/blue/purple to royal-blue/ink so it
  stays inside the brand palette.
- **Staff Login page**: redesigned as a two-column layout — an ambient
  "Ripple" brand panel on the left (hidden below `lg` so the form stays
  full-width on tablet/mobile) and a staggered-reveal form on the right,
  with a password show/hide toggle. The reference's Google login button was
  dropped (this app only has staff credential auth), and the reference's
  non-functional "forgot password" link was replaced with an honest note
  pointing to a Super Admin instead of a dead link.

**Not used:** a fourth reference component (an interactive 3D sphere photo
gallery with drag-to-rotate) wasn't a clear fit for any section in this
round's instructions — it's not currently wired in anywhere.

## 10. Known limitations (by design, given scope)

- Analytics is first-party and intentionally simple (page views, project
  views, contact submissions) — there's no bot filtering or geographic
  breakdown. Swap in a dedicated analytics provider if you need more depth.
- Session duration is a fixed 8 hours with no refresh/remember-me flow.
- The contact form's spam protection is a honeypot field only (see table
  above).
