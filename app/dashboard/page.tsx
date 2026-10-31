"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getRoadmap } from "@/lib/api/client";
import type { Roadmap, RoadmapNode } from "@/lib/contract";
import { CountUp } from "@/components/roadmap/CountUp";
import { fadeUp } from "@/lib/motion";
import HacktoberfestPopup from "@/components/announcements/HacktoberfestPopup";
import {
  opportunities,
  getStatus,
  sortOpportunities,
  type OpportunityStatus,
} from "@/content/opportunities";

function statusOf(n: RoadmapNode): string | undefined {
  return (n as { status?: string }).status;
}

function pickNext(nodes: RoadmapNode[]): RoadmapNode | null {
  const active = nodes.find((n) => statusOf(n) === "in_progress");
  if (active) return active;
  return (
    nodes.find(
      (n) => !n.locked && statusOf(n) !== "verified" && statusOf(n) !== "known"
    ) ?? null
  );
}

const oppBadge: Record<OpportunityStatus, { label: string; cls: string }> = {
  "closing-soon": { label: "Closing soon", cls: "bg-[#BEF264] text-black" },
  open: { label: "Open", cls: "bg-[#BEF264]/15 text-[#BEF264] ring-1 ring-[#BEF264]/40" },
  "check-site": { label: "Check site", cls: "bg-white/10 text-white/70 ring-1 ring-white/15" },
  closed: { label: "Closed", cls: "bg-white/5 text-white/40 ring-1 ring-white/10" },
};

export default function DashboardPage() {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    getRoadmap().then((res) => {
      if (res.ok) setRoadmap(res.data);
      else setError(res.message);
    });
  }, []);

  const next = roadmap ? pickNext(roadmap.nodes) : null;
  const total = roadmap?.progress.total ?? 0;
  const verifiedPct = total ? (roadmap!.progress.verified / total) * 100 : 0;
  const knownPct = total ? (roadmap!.progress.known / total) * 100 : 0;

  const picks = now
    ? sortOpportunities(opportunities, now)
        .filter((o) => getStatus(o, now) !== "closed")
        .slice(0, 3)
    : [];

  return (
    <main className="relative min-h-dvh px-4 py-6 md:px-10">
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

      <motion.header variants={fadeUp} initial="hidden" animate="show" className="mb-6">
        <p className="tag-label text-muted-foreground">Dashboard</p>
        <h1 className="text-3xl font-extrabold md:text-5xl">Welcome back</h1>
        {roadmap && (
          <p className="tag-label mt-2 text-muted-foreground">
            {roadmap.roleTitle} · <CountUp to={roadmap.progress.verified} /> verified ·{" "}
            <CountUp to={roadmap.progress.known} /> known ·{" "}
            <CountUp to={roadmap.weeksLeft} /> weeks left
          </p>
        )}
        <nav className="mt-4 flex flex-wrap gap-2">
          {[
            { href: "/roadmap", label: "Roadmap" },
            { href: "/opportunities", label: "Opportunities" },
            { href: "/verify/demo-001", label: "Sample credential" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="tag-label rounded-full border px-4 py-2 transition-colors hover:border-[#BEF264]/50"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </motion.header>

      {error && <p className="text-destructive">{error}</p>}

      <div className="grid gap-5 lg:grid-cols-3">
        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="overflow-hidden rounded-[1.75rem] border bg-card lg:col-span-2"
        >
          <div className="h-1.5 bg-gradient-to-r from-[#047857] to-[#BEF264]" />
          <div className="p-6 md:p-8">
            <p className="tag-label text-muted-foreground">Next up</p>
            {!roadmap && !error && <div className="skeleton mt-4 h-24 rounded-3xl" />}
            {roadmap && next && (
              <>
                <h2 className="mt-2 text-2xl font-bold md:text-3xl">{next.title}</h2>
                <p className="tag-label mt-2 text-[#BEF264]">
                  {statusOf(next) === "in_progress" ? "In progress" : "Ready to start"}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={`/roadmap/${next.id}`}
                    className="rounded-full bg-gradient-to-r from-[#047857] to-[#BEF264] px-6 py-3 font-semibold text-black transition-transform hover:-translate-y-0.5 active:scale-95"
                  >
                    Continue
                  </Link>
                  <Link
                    href="/roadmap"
                    className="rounded-full border px-6 py-3 font-medium transition-colors hover:border-[#BEF264]/50"
                  >
                    See full roadmap
                  </Link>
                </div>
              </>
            )}
            {roadmap && !next && (
              <p className="mt-3 text-muted-foreground">
                Nothing left to start right now. Open the roadmap to see where you stand.
              </p>
            )}

            {roadmap && (
              <div className="mt-8">
                <div className="flex h-2.5 overflow-hidden rounded-full bg-white/10">
                  <div className="bg-[#BEF264]" style={{ width: `${verifiedPct}%` }} />
                  <div className="bg-[#BEF264]/35" style={{ width: `${knownPct}%` }} />
                </div>
                <p className="tag-label mt-2 text-muted-foreground">
                  Solid = verified · light = known (claimed, not yet proven)
                </p>
              </div>
            )}
          </div>
        </motion.section>

        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="rounded-[1.75rem] border border-dashed bg-card p-6 md:p-8"
        >
          <span className="tag-label text-[#BEF264]">Coming soon</span>
          <h2 className="mt-3 text-2xl font-bold">Ladda weekly challenge</h2>
          <p className="mt-2 text-muted-foreground">
            One timed task a week. Winners climb the leaderboard.
          </p>
          <p className="tag-label mt-6">Check back Sunday.</p>
        </motion.section>
      </div>

      <motion.section variants={fadeUp} initial="hidden" animate="show" className="mt-8">
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold">Opportunities</h2>
          <Link href="/opportunities" className="tag-label underline-offset-4 hover:underline">
            See all
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {!now &&
            [0, 1, 2].map((i) => (
              <div key={i} className="skeleton h-40 rounded-[1.75rem]" />
            ))}
          {picks.map((o) => {
            const b = oppBadge[getStatus(o, now!)];
            return (
              <Link
                key={o.id}
                href={`/opportunities/${o.id}`}
                className="block overflow-hidden rounded-[1.75rem] border bg-card transition-colors hover:border-[#BEF264]/40"
              >
                <div className="h-1.5 bg-gradient-to-r from-[#047857] to-[#BEF264]" />
                <div className="flex flex-col gap-3 p-5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="tag-label text-muted-foreground">{o.type}</span>
                    <span className={`tag-label rounded-full px-3 py-1 ${b.cls}`}>
                      {b.label}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold leading-snug">{o.title}</h3>
                  <p className="tag-label text-[#BEF264]">{o.prize}</p>
                  <p className="tag-label text-muted-foreground">{o.dateLabel}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </motion.section>

      <HacktoberfestPopup />
    </main>
  );
}