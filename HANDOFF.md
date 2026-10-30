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
- [ ] Step 1c: lib/contract (Zod), lib/mocks, NEXT_PUBLIC_USE_MOCKS switch
- [ ] Step 1d: GitHub push + Vercel deploy
- [ ] Step 2: design system (palette, fonts, tokens, motion rules)
- [ ] Step 3: Backend engineering catalog (12 nodes)
- Then: roadmap screen, node panel, auth, intake, engine, AI review, credential, landing, repo tutor, extras

## Decisions
- Fresh project (ladda-v2); old keys not reused
- Prisma installed but not set up until the database step
- Env: Supabase vars use NEXT_PUBLIC_ prefix; GEMINI_API_KEY passed explicitly to the AI SDK

## Keys
Names are in .env.example. Values are in .env.local and the owner's password manager. The ed25519 private key must never change after credentials are issued.