# 🌟 CosmicInsight

A premium **Vedic Astrology & Numerology** web app — a React SPA (Vite +
TypeScript + Tailwind) with **Claude** doing the AI readings via a secure
serverless proxy. **No login, no Firebase, no database** — reports are saved in
the browser's local storage. Runs with zero config thanks to a simulated-data
fallback; add a key to switch on live AI.

---

## ✨ Features
- **Cosmic Slate** dark theme (Playfair + Inter, gold accents, glassmorphism).
- **Vedic Astrology** — drag-and-drop your Kundli **PDF**; Claude reads it
  natively and returns a typed reading in a Bento-grid dashboard.
- **Soulmate Profile** — text-only descriptive read. No images, anywhere.
- **Numerology** — deterministic Pythagorean math + AI-written meanings.
- **AI Chat** — floating advisor scoped to the current report.
- **History** — saved on this device (localStorage); clearable.
- **English & Hindi** toggle.

---

## 🔐 Architecture & security

The Anthropic key is **never** in the browser. All AI calls go:

```
React client ──POST /api/claude──> Vercel function ──> Anthropic API
(no key)                           (ANTHROPIC_API_KEY, server-only)
```

Because there's no user login, the public endpoint is protected by three
layered guards in `api/claude.ts` — each toggled on by setting its env var:

| Guard | Env var(s) | What it does |
|-------|-----------|--------------|
| **Origin allowlist** | `ALLOWED_ORIGIN` | Rejects requests whose `Origin` isn't your site. |
| **Rate limiting** | `UPSTASH_REDIS_REST_URL` + `_TOKEN` (durable) or none (in-memory) | Caps requests per IP (`RATE_LIMIT_MAX` per `RATE_LIMIT_WINDOW_SEC`). |
| **Proof-of-human** | `TURNSTILE_SECRET_KEY` + `VITE_TURNSTILE_SITE_KEY` | Cloudflare Turnstile challenge, verified server-side on the paid analysis calls. |

With none set, the app still works but the endpoint is open — fine for testing,
**not** for a link you share publicly. For a public deploy, set at least
`ALLOWED_ORIGIN` + Turnstile, and ideally Upstash for durable limiting.

> Honest note: rate limiting is the weakest guard (rotating IPs defeat it), and
> the in-memory limiter resets per serverless cold start. Turnstile is the
> guard that actually stops bots, so it's the one to prioritise for a public
> link. Soulmate/chat calls rely on origin + rate limiting (no extra challenge),
> so they sit behind the Turnstile-gated analysis step in normal use.

---

## 🚀 Local development
```bash
npm install
cp .env.example .env      # optional
npm run dev               # Vite only — AI runs in SIMULATED mode
```
To exercise the real function locally (serves SPA + /api together):
```bash
npm i -g vercel
vercel dev                # reads ANTHROPIC_API_KEY from .env
```

## ☁️ Deploy to Vercel
1. Push to a Git repo → **Import Project** in Vercel (auto-detects Vite), or run `vercel`.
2. In **Settings → Environment Variables** add:
   - `ANTHROPIC_API_KEY` (required for live AI) — **no** `VITE_` prefix.
   - `ALLOWED_ORIGIN` = your deployed URL.
   - `TURNSTILE_SECRET_KEY` + `VITE_TURNSTILE_SITE_KEY` (get both from the
     Cloudflare dashboard → Turnstile → add site).
   - Optionally `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`
     (free Upstash Redis) for durable rate limiting.
3. Redeploy.

### Notes
- PDFs capped at **4 MB** (Vercel request-body limit; base64 inflates ~33%).
- Kundli analysis can take 20–40s; function `maxDuration` is 60s.

---

## 🧱 Structure
```
api/claude.ts               # serverless proxy + 3 security guards (holds the key)
src/
├─ App.tsx                   # routing / state / data flow (no auth)
├─ types.ts                  # shared interfaces
├─ services/
│  ├─ claudeService.ts       # client → /api/claude, with mock fallback
│  ├─ numerology.ts          # deterministic Pythagorean math
│  └─ reports.ts             # localStorage save/fetch/clear
└─ components/               # Landing, ServiceSelection, FileUpload,
                             # NumerologyInput, Billing (+ Turnstile),
                             # Dashboard, NumerologyDashboard, SoulmateGenerator,
                             # ChatInterface, History, Turnstile, ui/Primitives
```

## 📜 Disclaimer
For reflection and entertainment. Not a substitute for professional medical,
financial, legal, or relationship advice.
