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
- [ ] Step 1d: GitHub push + Vercel deploy
- [ ] Step 2: design system (palette, fonts, tokens, motion rules)
- [ ] Step 3: Backend engineering catalog (12 nodes)
- Then: roadmap screen, node panel, auth, intake, engine, AI review, credential, landing, repo tutor, extras

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