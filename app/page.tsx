"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Search } from "lucide-react";
import { LadderHero } from "@/components/landing/LadderHero";
import { builders } from "@/content/builders";
import { fadeUp } from "@/lib/motion";

const RECENT = [
  "Sample · HTTP and REST · Verified",
  "Sample · Node.js and Express · Verified",
  "Sample · SQL and PostgreSQL · Verified",
  "Sample · Git and GitHub · Verified",
  "Sample · JavaScript and TypeScript basics · Verified",
];

const MOVES = [
  { n: "01", title: "Find the gap", text: "Tell us where you are and what job you want. We map the skills between you and it." },
  { n: "02", title: "Learn it", text: "Follow a short, ordered roadmap with hand-checked resources, planned around your hours." },
  { n: "03", title: "Build it", text: "Submit a real project on GitHub. An AI reviewer scores it against a clear rubric." },
  { n: "04", title: "Get a signed credential", text: "Verified skills become a credential any employer can check in seconds, no login." },
];

function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const primary =
  "glow inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5 active:scale-95";
const secondary =
  "inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-primary active:scale-95";

export default function Home() {
  const router = useRouter();
  const [id, setId] = useState("");

  function go(e: React.FormEvent) {
    e.preventDefault();
    const v = id.trim();
    if (v) router.push(`/verify/${encodeURIComponent(v)}`);
  }

  return (
    <main className="relative min-h-dvh overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute -left-40 top-20 size-[520px] rounded-full bg-[#BEF264]/10 blur-3xl"
          animate={{ x: [0, 80, 0], y: [0, 50, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-32 bottom-0 size-[560px] rounded-full bg-[#047857]/20 blur-3xl"
          animate={{ x: [0, -70, 0], y: [0, -60, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="mx-auto max-w-6xl px-4 md:px-10">
        {/* Top bar */}
        <header className="flex items-center justify-between py-6">
          <span className="font-heading text-2xl font-extrabold">
            Ladda<span className="text-primary">.</span>
          </span>
          <Link href="/auth" className="tag-label rounded-full border px-4 py-2 transition hover:border-primary">
            Sign in
          </Link>
        </header>

        {/* Hero */}
        <section className="grid items-center gap-10 py-8 md:grid-cols-2 md:py-16">
          <div>
            <motion.p variants={fadeUp} initial="hidden" animate="show" className="tag-label text-muted-foreground">
              No. 001 · Pick right. Learn real. Get hired.
            </motion.p>
            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="mt-4 text-5xl font-extrabold leading-[1.02] md:text-7xl"
            >
              Pick right. Learn real. <span className="text-brand">Get hired.</span>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="mt-5 max-w-xl text-lg text-muted-foreground"
            >
              Ladda turns your skills gap into a roadmap, checks your projects with AI, and gives you a
              signed credential employers can verify in seconds.
            </motion.p>
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="mt-8 flex flex-wrap gap-3"
            >
              <Link href="/auth" className={primary}>
                Get started free <ArrowRight className="size-4" />
              </Link>
              <Link href="/auth" className={secondary}>
                I already have an account
              </Link>
              <a href="#verify" className={secondary}>
                Verify a credential for employers
              </a>
            </motion.div>
            <p className="tag-label mt-4 text-muted-foreground">No login needed to verify.</p>
          </div>
          <LadderHero />
        </section>
      </div>

      {/* Recently verified strip */}
      <div className="overflow-hidden border-y border-dashed py-3">
        <p className="tag-label mx-auto mb-2 max-w-6xl px-4 text-muted-foreground md:px-10">
          Recently verified · sample data
        </p>
        <motion.div
          className="flex w-max"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
        >
          {[...RECENT, ...RECENT].map((t, i) => (
            <span key={i} className="tag-label mr-3 shrink-0 rounded-full border bg-card px-4 py-2">
              {t}
            </span>
          ))}
        </motion.div>
      </div>

      <div className="mx-auto max-w-6xl px-4 md:px-10">
        {/* Problem cards */}
        <section className="py-16">
          <Reveal>
            <p className="tag-label text-muted-foreground">The problem</p>
            <h2 className="mt-2 max-w-2xl text-3xl font-extrabold md:text-4xl">
              Your degree is the start. Ladda is the climb.
            </h2>
          </Reveal>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <Reveal>
              <div className="h-full rounded-[1.75rem] border bg-card p-6">
                <div className="mb-4 h-1.5 w-16 rounded-full bg-brand" />
                <p className="tag-label text-muted-foreground">Freshman</p>
                <h3 className="mt-2 text-xl font-bold">Choosing a course blindly</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Tell us what you enjoy. We rank the paths that fit you and show what each one really takes.
                </p>
              </div>
            </Reveal>
            <Reveal>
              <div className="h-full rounded-[1.75rem] border bg-card p-6">
                <div className="mb-4 h-1.5 w-16 rounded-full bg-brand" />
                <p className="tag-label text-muted-foreground">Final year</p>
                <h3 className="mt-2 text-xl font-bold">Good grades, no proof of skill</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  See your gap, build real projects, and leave with a credential that shows evidence, not
                  just a CV line.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-dashed py-16">
          <Reveal>
            <p className="tag-label text-muted-foreground">How it works</p>
            <h2 className="mt-2 text-3xl font-extrabold md:text-4xl">Four moves to proof</h2>
          </Reveal>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {MOVES.map((m) => (
              <Reveal key={m.n}>
                <div className="h-full rounded-[1.75rem] border bg-card p-5">
                  <p className="tag-label text-primary">Rung {m.n}</p>
                  <h3 className="mt-3 text-lg font-bold">{m.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{m.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Employer verify */}
        <section id="verify" className="scroll-mt-8 border-t border-dashed py-16">
          <Reveal>
            <div className="rounded-[1.75rem] border-2 border-primary/60 bg-card p-6 md:p-10">
              <p className="tag-label text-muted-foreground">For employers</p>
              <h2 className="mt-2 text-3xl font-extrabold md:text-4xl">Check a credential. No login.</h2>
              <p className="mt-3 max-w-xl text-sm text-muted-foreground">
                Paste a credential ID. You get Valid, Invalid or Revoked, plus the evidence behind every
                verified skill. Try the sample: demo-001.
              </p>
              <form onSubmit={go} className="mt-6 flex flex-col gap-3 md:flex-row">
                <div className="relative w-full">
                  <Search className="absolute left-5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    placeholder="demo-001"
                    className="w-full rounded-full border bg-background py-3 pl-12 pr-5 text-sm outline-none focus:border-primary"
                  />
                </div>
                <button type="submit" className={`${primary} shrink-0 justify-center`}>
                  Verify <ArrowRight className="size-4" />
                </button>
              </form>
            </div>
          </Reveal>
        </section>

        {/* Founder + Hacktoberfest */}
        <section className="border-t border-dashed py-16">
          <Reveal>
            <p className="tag-label text-muted-foreground">Meet the founder</p>
          </Reveal>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {builders.map((b) => (
              <Reveal key={b.name}>
                <div className="flex items-start gap-4 rounded-[1.75rem] border bg-card p-6">
                  {b.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={b.photo} alt={b.name} className="size-16 shrink-0 rounded-full object-cover" />
                  ) : (
                    <div className="grid size-16 shrink-0 place-items-center rounded-full bg-brand text-xl font-extrabold text-black">
                      {b.name
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold">{b.name}</h3>
                    <p className="tag-label mt-1 text-muted-foreground">{b.role}</p>
                    <p className="mt-3 text-sm text-muted-foreground">{b.bio}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {b.links.map((l) => (
                        <a
                          key={l.href}
                          href={l.href}
                          target="_blank"
                          rel="noreferrer"
                          className="tag-label rounded-full border px-3 py-1 transition hover:border-primary"
                        >
                          {l.label}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
            <Reveal>
              <div className="flex h-full flex-col justify-center rounded-[1.75rem] border border-dashed bg-card p-6">
                <span className="tag-label inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1">
                  <span className="size-2 animate-pulse rounded-full bg-primary" />
                  Featured: AWS Hacktoberfest is live
                </span>
                <p className="mt-3 text-sm text-muted-foreground">
                  Built for the hackathon season. Ladda is a student project, and every credential in the
                  demo is sample data.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 text-center">
          <Reveal>
            <h2 className="mx-auto max-w-2xl text-4xl font-extrabold md:text-5xl">Ready to start climbing?</h2>
            <div className="mt-8 flex justify-center">
              <Link href="/auth" className={primary}>
                Get started free <ArrowRight className="size-4" />
              </Link>
            </div>
          </Reveal>
        </section>

        <footer className="border-t border-dashed py-8 text-center">
          <p className="tag-label text-muted-foreground">Ladda. Pick right. Learn real. Get hired.</p>
        </footer>
      </div>
    </main>
  );
}