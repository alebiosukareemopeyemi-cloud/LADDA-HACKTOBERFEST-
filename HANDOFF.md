# Ladda: Handoff

Source of truth: docs/Ladda_Full_Build_Plan.pdf (Sections 13 to 15 win on conflicts). Where this file and the PDF disagree, this file is newer (node page is its own page, not a side panel; ONE founder card on landing).
Solo build by Kareem. Frontend, product design and animation lead the work.
Working style: informal, direct. Settle ideas before generating large files and wait for his go-ahead. Never put secret values in the repo or chat.

## Project
- Folder: C:\Users\PROGRESSIVE\code\ladda-v2 (old builds: ladda, ladda-old, ladda-new-backup; do not reuse)
- Stack: Next.js 15, TypeScript, Tailwind v4, shadcn/ui (Nova preset), Framer Motion, Zod, Supabase, Prisma, Vercel AI SDK + Gemini, ed25519 signing
- Windows + PowerShell. Portmaster firewall is on and can block node.exe (allow it). Network is slow, first compile of a new route can take 10+ seconds. npm needs approve-scripts for prisma. Prisma engine download can hang.
- Dev server may land on port 3002 if 3000 is taken; check the terminal.
- Live: https://ladda-hacktoberfest.vercel.app (private repo, auto-deploys on push to main)

## Status
- [x] Step 1: scaffold, .gitignore, .env.example, keys, lib/contract (Zod), lib/mocks, lib/api/client.ts, NEXT_PUBLIC_USE_MOCKS switch, GitHub + Vercel
- [x] Step 2: design system (globals.css, layout.tsx, lib/motion.ts, app/design/page.tsx preview; delete /design and /dev before the demo)
- [x] Step 3: Backend catalog (content/catalog/backend.json, checked by scripts/validate-catalog.mjs)
- [x] Step 4: Roadmap screen on mocks (app/roadmap/page.tsx, components/roadmap/RoadmapRoad.tsx, CountUp.tsx, lib/roadmap/geometry.ts). RoadmapRoad accepts an optional `labels` prop (per-stop status text, e.g. "Coming soon").
- - [x] Step 5: Node page (app/roadmap/[node]/page.tsx): road, Learn panel, Build panel with mock review, CertificatesPanel (components/roadmap/CertificatesPanel.tsx). Mock approval is in-memory only.
  - Pin navigation bug: CONFIRM FIXED (if not, check RoadmapRoad.tsx click handler and slow first compile of the route).
  - Catalog typo "totalsexpenses" in js-ts-basics brief: CONFIRM FIXED.
- [ ] Step 6: Auth (Supabase, Resend, middleware guards, pre-verified demo account). NEXT.
- [ ] Step 6: Auth (Supabase, Resend, middleware guards, pre-verified demo account)
- [ ] Step 7: Intake (3 questions, optional CV step) + "building your path" animation
- [ ] Step 8: Real roadmap engine (server-enforced unlocks, replaces mocks)
- [ ] Step 9: AI project review (GitHub reading, rubric scoring, polling, unlock animation)
- [ ] Step 10: Credential signing + verify page (client-side check, tamper test)
- [ ] Step 11: Landing page + try-it demo (caching, rate limits)
- [ ] Step 12: Repo tutor on 2 or 3 pre-analysed repos
- [ ] Step 13: Dashboard extras (opportunities cards, Hacktoberfest popup, notes, "Check back Sunday" challenges)
- [ ] Step 14: Demo rehearsal (seed data, cached fallbacks, 90-second run-through)

## Decisions
- Fresh project (ladda-v2); old keys not reused
- Prisma installed but not set up until the database step
- Env: Supabase vars use NEXT_PUBLIC_ prefix; GEMINI_API_KEY passed explicitly to the AI SDK
- Node panel: Learn, Build (upload), Test (shown locked, "coming soon"), plus optional Certificates panel (suggested + upload). Verified = approved project; a certificate never makes a node Verified.
- Contract lives in lib/contract (one file per area, re-exported from index.ts). Mocks in lib/mocks (roadmap mock already reads content/catalog/backend.json), typed wrappers in lib/api/client.ts. Mock mode is on while NEXT_PUBLIC_USE_MOCKS=1.
- app/dev/page.tsx and app/design/page.tsx are throwaway. Delete before the demo.
- Intake defaults: one question per screen, 3 ranked paths, hours as chips, CV matches pre-ticked with the CV line as evidence.
- Verify page: AI summary sits above the evidence.
- Backend path is Node.js + TypeScript (repo tutor only reads TS/JS repos). 12 skills: js-ts-basics, git-github, http-rest, cli-dev-setup (stretch), node-express, sql-postgres, rest-api, auth-security, testing (stretch), deploying, capstone-api, proof-capstone. About 105h total, 96h must-have.
- Catalog resources arrays are EMPTY on purpose: Kareem adds hand-checked links later. Never invent URLs. Mock resources/certificates use example.com placeholders. Capstone and proof nodes have no CV synonyms, so a CV can never mark them Known.
- Server owns every decision (status, unlocks, scores, signatures). Anti-cheat: Known unlocks nodes in between, but the Proof node and the credential need every must-have node Verified.
- Opportunities (at least 6, hand-added), AWS Hacktoberfest popup (once, inside a date window), Ladda challenges coming-soon card ("Check back Sunday"). Employers have no accounts.

## Env variables (names only, values in .env.local and the owner's password manager)
NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_USE_MOCKS, Supabase URL/anon/service-role keys, DATABASE_URL, GEMINI_API_KEY, GITHUB_TOKEN, RESEND_API_KEY, CREDENTIAL_PRIVATE_KEY, CREDENTIAL_PUBLIC_KEY. See .env.example for exact names. The ed25519 private key must never change after credentials are issued.

## Design decisions (locked by Kareem)
- Mood: energetic green gradients with black touches. Palette "Neon forest": gradient #047857 to #BEF264 on near-black (#070A08). Dark is default (class "dark" on <html>); light mode is a full second token set.
- Shapes: very rounded and pill-like. Buttons, chips and inputs are full pills; cards about 28px radius.
- Fonts: Bricolage Grotesque (headings), Instrument Sans (body), JetBrains Mono (tags, hours, scores, hashes).
- Glow: soft lime glow on hero and primary CTAs only; flat with crisp borders elsewhere.
- Motion: rich on app pages. Shared presets in lib/motion.ts: fadeUp, pop, drawPath, pulse, unlockBurst, spring. Micro 150ms, standard 300ms, big moments 600 to 900ms; stagger 60ms; hover lifts, press shrinks; respect prefers-reduced-motion.
- Node state look: verified = gradient fill; known = soft mint tint + outline; in progress = lime ring with pulse; todo = muted outline; locked = dimmed + lock icon.
- Animation ideas still to build: unlock chain lights the path and opens dependants one by one with a spark burst; Known node flips like a card; green skeleton shimmer and streamed AI text; magnetic primary buttons.

## Screens and navigation (locked)
- Roadmap page: full-bleed winding "snake road" SVG with numbered pins, one reusable component for the 12-node road and the 3-stop road.
- Node page: /roadmap/[node] with the 3-stop road and content expanding below the road (not a bottom sheet). Certificates panel sits under the road.
- Shell: hamburger menu with Roadmap, Leaderboard, Your Notes, Opportunities, Connect. Top bar has a round profile image that opens Profile, Settings, Sign out. Credentials lives in the profile menu. Profile and Settings stay tiny.
- Connect (Phase C, if time): sample users and communities, chat shown locked "coming soon". Do not claim chat on stage unless built.
- Landing: style reference is Kareem's FindIt page (mono tag labels, pill chips, dotted dividers, striped-top cards, "recently verified" strip). Hero has three buttons (Get started free, I already have an account, Verify a credential for employers) plus a fairly large ladder-climbing animation on the right (look decided with Kareem at the landing step). ONE founder card (content/builders.ts, Alebiosu Kareem). AWS Hacktoberfest section: only say "partnering" if it is real; otherwise "Featured: AWS Hacktoberfest is live".

## How to work with Kareem
- Informal, direct, practical. Ask him for EVERY design choice before building it. Settle ideas and copy before generating large files; wait for his go-ahead.
- One small PowerShell command at a time (a batched paste broke things before). No bash-only syntax. Never ask for or print secret values, only variable names.
- When sending code: prefer ONE full-file replacement over several small edits (he makes paste mistakes). Long messages can get cut when pasting, so check the end of the file.
- He is credit-conscious. Update this file after each step. Remind him to push to GitHub after each step.