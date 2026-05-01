# SMEBots

Subject Matter Expert bots for knowledge workers. A static-site fork of
[moxiette.com](https://moxiette.com), restructured to run on **GitHub Pages**
with no backend.

Today: **TPM Bot** and **PM Bot**. More bots planned (EM, Design, Marketing,
Sales, etc.).

---

## What this is

A browser-based generator that turns rough project briefs into polished
deliverables — roadmaps, detailed plans, importable ticket CSVs, bi-weekly
status reports, PRDs, OKRs, launch plans, stakeholder emails — using
Anthropic's Claude.

Same look, feel, and intake flow as moxiette.com. Difference: this version
calls Anthropic **directly from your browser** using an API key you provide
(BYOK). No server, no auth, no usage tracking — and so it can be hosted on
GitHub Pages with zero infrastructure cost.

---

## Why BYOK (bring your own key)?

GitHub Pages is static-only. There's nowhere safe to store a shared API key
— anything in the bundle would be readable by every visitor. Instead, each
user pastes their own Anthropic API key, which lives in their browser's
local storage and never leaves their machine.

Trade-off: each user needs an Anthropic account. For an internal team demo,
share one team key via your password manager and have everyone paste it in.

---

## Architecture

```
SMEBots/
├── app/                       Next.js App Router pages (static-exported)
│   ├── page.tsx               Landing
│   ├── tpm-bot/page.tsx       TPM Bot
│   ├── pm-bot/page.tsx        PM Bot
│   ├── layout.tsx             Root layout
│   └── globals.css            Tailwind + custom styles
├── components/
│   ├── ApiKeySetup.tsx        Modal for pasting Anthropic key
│   ├── ApiKeyBadge.tsx        Header badge ("Set API key" / "API key set")
│   ├── bot/
│   │   ├── BotPage.tsx        Orchestrator: intake → generation → viewer
│   │   ├── IntakeWizard.tsx   4-step intake (setup, Q&A, context, outputs)
│   │   └── UnifiedOutputViewer.tsx  Tabbed output viewer + downloaders
│   └── marketing/
│       ├── Hero.tsx           Landing hero
│       ├── BotShowcase.tsx    Bot grid (live + coming soon)
│       ├── HowItWorks.tsx     3-step explainer
│       ├── Nav.tsx, Footer.tsx, Logo.tsx
├── lib/
│   ├── bot-configs.ts         TPM + PM definitions (prompts, schemas, intake)
│   ├── llm-client.ts          Browser-side Anthropic SDK wrapper
│   ├── key-store.ts           localStorage helpers for the BYOK key
│   ├── exporters.ts           Excel / Word / CSV / Markdown / TXT exporters
│   ├── file-extractors.ts     Browser-side .txt/.md/.csv/.json reader
│   └── utils.ts               cn() classname helper
├── .github/workflows/
│   └── deploy-pages.yml       Auto-build & deploy to GitHub Pages on push
├── next.config.mjs            Configured for `output: 'export'`
├── tailwind.config.ts         Color palette + animations
├── package.json
└── tsconfig.json
```

The build runs entirely in GitHub Actions, so **you don't need Node.js
installed locally**. Edit a file, push to `main`, the workflow builds the
static site and publishes it to Pages.

---

## How to deploy

### One-time setup

1. **Create a GitHub repo** (e.g., `SMEBots`). Push this folder's contents
   as the initial commit.
2. **In the repo's GitHub UI**: `Settings → Pages → Build and deployment →
   Source: GitHub Actions`. Pages will then receive its content from the
   workflow in `.github/workflows/deploy-pages.yml` instead of from a branch.
3. That's it. The first push to `main` triggers a build and your site goes
   live at:
   - `https://<your-username>.github.io/SMEBots/` (most likely)
   - or `https://<your-username>.github.io/` if the repo is named
     `<your-username>.github.io` exactly

### Day-to-day

Push to `main` → site rebuilds and redeploys in ~2 minutes. The Actions tab
shows progress. The deploy job's URL output points to the live site.

### URL handling

`next.config.mjs` reads `NEXT_PUBLIC_BASE_PATH` at build time. The deploy
workflow auto-detects whether your repo is at `username.github.io/<repo>`
(needs `basePath=/<repo>`) or at `username.github.io` directly (no
basePath). No manual config needed.

If you later attach a **custom domain** (Settings → Pages → Custom domain),
clear `NEXT_PUBLIC_BASE_PATH` by deleting the auto-detect step from the
workflow, or set the workflow env to `NEXT_PUBLIC_BASE_PATH=""` so paths are
emitted as root-relative.

---

## Corporate / locked-down environments

If you can't push to GitHub from your work machine via CLI, the workflow is
designed for the **upload-via-web-UI** path:

1. Develop on your personal machine.
2. Zip this entire folder (skip `node_modules/`, `.next/`, `out/`).
3. In your corporate GitHub Enterprise UI: create the repo → upload files
   via the web UI → commit. The Pages workflow runs on the corporate
   GitHub's runners and deploys to your corporate Pages instance.
4. The same `Settings → Pages → Source: GitHub Actions` step applies.

No local Node, no local git, no local build. Everything happens in the
hosted runner.

---

## How users interact with it

1. Land on the homepage. Pick TPM Bot or PM Bot.
2. **First-time only**: a button in the top-right ("Set API key") opens a
   modal asking for an Anthropic API key. Paste it once; it's saved to
   browser local storage.
3. Walk through the 4-step intake (project setup → guided Q&A → optional
   context → choose outputs).
4. Click "Generate". The browser calls Anthropic with the user's key. ~15-45
   seconds later, polished deliverables appear in a tabbed viewer.
5. Copy any tab to clipboard, or download as Excel / Word / CSV / Markdown
   / plain text — all generated client-side, no server roundtrip.

To remove a stored key: click the badge in the header → "Forget my saved
key" inside the modal.

---

## Adding a new bot

Everything is config-driven. To add (say) an EM Bot:

1. In `lib/bot-configs.ts`, define `EM_OUTPUT_TABS`, `EM_GUIDED_QUESTIONS`,
   `EM_SYSTEM_PROMPT`, `EM_OUTPUT_SCHEMA`, then add it to `BOT_CONFIGS`.
2. Create `app/em-bot/page.tsx` that mirrors the TPM/PM page shape:
   ```tsx
   import { BotPage } from "@/components/bot/BotPage";
   import { getBotConfig } from "@/lib/bot-configs";
   export default function EMBotPage() {
     const config = getBotConfig("em")!;
     return <BotPage config={config} programLabel="team_name" />;
   }
   ```
3. Update `BotShowcase.tsx`'s `COMING_SOON` list (move EM out of it) — the
   showcase auto-renders any bot in `BOT_CONFIGS` as live.
4. Push. Done.

---

## Local development (optional)

You don't need this for deploying — the GitHub Actions workflow handles
everything. But if you want to iterate locally:

```bash
# One-time
npm install

# Run dev server at http://localhost:3000
npm run dev

# Build the static site to out/
npm run build
```

Requires Node 18+ and npm.

---

## Where this came from

Forked and stripped down from [moxiette.com](https://github.com/moxiette/moxiette-com)
on 2026-05-01. moxiette.com is the Vercel-hosted SaaS version with Clerk
auth, server-side AI calls, usage tracking, project history, and a feedback
backend. SMEBots strips all of that out so the same intake-to-output flow
runs as a pure static site.

If you want to update SMEBots from a newer moxiette.com snapshot:
- `lib/bot-configs.ts`, `lib/exporters.ts`, `lib/file-extractors.ts`,
  `components/bot/IntakeWizard.tsx`, and `components/bot/UnifiedOutputViewer.tsx`
  port over directly with minimal edits.
- `lib/llm-client.ts` is SMEBots-specific (browser-side, BYOK). Don't replace
  it with moxiette's server-side `app/api/generate/route.ts`.
- Anything Clerk-related in moxiette (`@clerk/nextjs`, project history, usage
  tracking) does **not** lift over — it requires a backend SMEBots doesn't have.
