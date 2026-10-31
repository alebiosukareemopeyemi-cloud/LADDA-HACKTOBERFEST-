# Ladda: Handoff

Source of truth: docs/Ladda_Full_Build_Plan.pdf (Sections 13 to 15 win on conflicts).
Solo build by Kareem. Frontend, product design and animation lead the work.
Working style: informal, direct. Settle ideas before generating large files. Never put secret values in the repo or chat.

## Project
- Folder: C:\Users\PROGRESSIVE\code\ladda-v2 (old builds: ladda, ladda-old, ladda-new-backup; do not reuse)
- Stack: Next.js 15, TypeScript, Tailwind v4, shadcn/ui (Nova preset), Framer Motion, Zod, Supabase, Prisma, Vercel AI SDK + Gemini, ed25519 signing
- Windows + PowerShell. Portmaster firewall is on and can block node.exe.

## Status
- [x] Step 1a: scaffold, dependencies, shadcn init, first commit
- [x] Step 1b: .gitignore, .env.example, key generation
- [x] Step 1c: lib/contract (Zod), lib/mocks, lib/api/client.ts, NEXT_PUBLIC_USE_MOCKS switch
- [x] Step 1d: GitHub push + Vercel deploy (live: https://ladda-hacktoberfest.vercel.app, private repo, auto-deploys on push to main)
- [ ] Step 2: - [x] Step 2: design system (globals.css, layout.tsx, lib/motion.ts, app/design/page.tsx preview; delete /design and /dev before the demo)
- [ ] Step 3: Backend engineering catalog (12 nodes), drafted together with Kareem

## Decisions
- Fresh project (ladda-v2); old keys not reused
- Prisma installed but not set up until the database step
- Env: Supabase vars use NEXT_PUBLIC_ prefix; GEMINI_API_KEY passed explicitly to the AI SDK
- Node panel: Learn, Build (upload), Test (shown locked, "coming soon"), plus optional Certificates panel (suggested + upload). Scoring and rubric details stay loose until later.
- Contract lives in lib/contract (one file per area, re-exported from index.ts). Mocks in lib/mocks, typed wrappers in lib/api/client.ts. Mock mode is on while NEXT_PUBLIC_USE_MOCKS=1.
- app/dev/page.tsx is a throwaway check page. Delete it before the demo.
- Intake defaults: one question per screen, 3 ranked paths, hours as chips, CV matches pre-ticked with the CV line as evidence.
- Verify page: AI summary sits above the evidence.

## Keys
Names are in .env.example. Values are in .env.local and the owner's password manager. The ed25519 private key must never change after credentials are issued.
## Design decisions (Step 2, locked by Kareem)
- Mood: energetic green gradients with black touches. Palette "Neon forest": gradient #047857 to #BEF264 on near-black (#070A08). Dark is the default theme (put class "dark" on <html>); light mode is a full second token set.
- Shapes: very rounded and pill-like. Buttons, chips and inputs are full pills; cards about 28px radius.
- Fonts: Bricolage Grotesque (headings), Instrument Sans (body), JetBrains Mono (tags, hours, scores, hashes). Avoid generic AI-looking fonts.
- Glow: soft lime glow on hero and primary CTAs only; flat with crisp borders elsewhere.
- Motion: rich on app pages (nodes, cards, buttons animate). Shared presets in lib/motion.ts: fadeUp, pop, drawPath, pulse, unlockBurst. Springs for movement; micro 150ms, standard 300ms, big moments 600 to 900ms; stagger 60ms; hover lifts, press shrinks; respect prefers-reduced-motion.
- Animation ideas to build: path draws in then nodes pop; unlock chain lights the path lime and opens dependants one by one with a spark burst; Known node flips like a card; count-up numbers and progress ring; green skeleton shimmer and streamed AI text; magnetic primary buttons.
- Node state look: verified = gradient fill; known = soft mint tint + outline; in progress = lime ring with pulse; todo = muted outline; locked = dimmed + lock icon.
- Existing app/globals.css is the shadcn Nova default (neutral oklch tokens, @theme inline, --font-mono points at Geist). Rewrite it keeping the same variable names so shadcn components keep working.

## Screens and navigation (locked)
- Roadmap page: full-bleed winding "snake road" SVG with numbered pins (like a road-diagram reference). One reusable component; the path is generated from the stop count so it draws both the 12-node roadmap and the 3-stop Learn/Build/Test road. Pin shows skill name at full brightness with a dimmer status line (Verified / Known / In progress); locked = lock icon + dimmed. On phones the road winds vertically and scrolls. Path draws in, pins drop in one by one, active pin pulses.
- Node page (replaces the side panel from the old plan): tap a pin to go to its own page (something like /roadmap/[node]) showing the skill plus the same winding road with three stops: Learn, Build (upload), Test (lock icon, "coming soon"). Certificates panel (suggested + upload) sits under the road. Contract lib/contract/node.ts already matches.
- Shell: hamburger-style menu with Roadmap, Leaderboard, Your Notes, Opportunities, Connect. Top bar has a round profile image that springs open into Profile, Settings, Sign out. Credentials lives in the profile menu. Profile and Settings stay tiny (Profile shows intake answers; Settings has the light/dark toggle). Low priority.
- Connect (Phase C, if time): suggested students in your field (seeded, labelled sample users), community cards plus "Create a community"; chat shown locked as "coming soon". Do not claim chat on stage unless built.
- Landing page style reference: Kareem's FindIt page (mono tag labels with numbered markers like "NO. 001" or "RUNG 03", pill chips, dotted dividers, striped-top cards, a scrolling "recently verified" strip, everything tappable). Landing includes a short animation of someone stepping up a ladder (look to be decided with Kareem), a "Meet the founders" section with ONE card (Alebiosu Kareem; content/builders.ts holds a single entry), and an AWS Hacktoberfest section (only say "partnering" if it is a real partnership; otherwise "Featured: AWS Hacktoberfest is live").

## How to work with Kareem
- Informal, direct, practical. Ask him for EVERY design choice before building it. Settle ideas and copy before generating large files; wait for his go-ahead.
- One small PowerShell command at a time (a batched paste broke things before). No bash-only syntax. Never ask for or print secret values, only variable names.
- He is credit-conscious. Update this file after each step.
- Landing hero: three buttons (Get started free, I already have an account, Verify a credential for employers, no login) plus a fairly large ladder-climbing animation on the right-hand side. Look of the character and what sits at the top of the ladder to be decided with Kareem at the landing step.