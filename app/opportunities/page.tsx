"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  opportunities,
  getStatus,
  sortOpportunities,
  type Opportunity,
  type OpportunityStatus,
} from "@/content/opportunities";

const statusStyle: Record<OpportunityStatus, { label: string; cls: string }> = {
  "closing-soon": { label: "Closing soon", cls: "bg-[#BEF264] text-black" },
  open: { label: "Open", cls: "bg-[#BEF264]/15 text-[#BEF264] ring-1 ring-[#BEF264]/40" },
  "check-site": { label: "Check site", cls: "bg-white/10 text-white/70 ring-1 ring-white/15" },
  closed: { label: "Closed", cls: "bg-white/5 text-white/40 ring-1 ring-white/10" },
};

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
        active
          ? "bg-[#BEF264] text-black"
          : "border border-white/15 text-white/70 hover:border-[#BEF264]/50"
      }`}
    >
      {children}
    </button>
  );
}

function OppCard({
  o,
  status,
  index,
}: {
  o: Opportunity;
  status: OpportunityStatus;
  index: number;
}) {
  const s = statusStyle[status];
  const closed = status === "closed";
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      whileHover={{ y: -4 }}
      className={`h-full ${closed ? "opacity-60" : ""}`}
    >
      <Link
        href={`/opportunities/${o.id}`}
        className="block h-full overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] transition-colors hover:border-[#BEF264]/40"
      >
        <div
          className={`h-1.5 ${
            closed ? "bg-white/10" : "bg-gradient-to-r from-[#047857] to-[#BEF264]"
          }`}
        />
        <div className="flex h-full flex-col gap-4 p-6">
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-[11px] uppercase tracking-widest text-white/50">
              {o.type}
            </span>
            <span
              className={`rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-wider ${s.cls}`}
            >
              {s.label}
            </span>
          </div>
          <h2 className="text-xl font-semibold leading-snug text-white">{o.title}</h2>
          <p className="text-sm leading-relaxed text-white/60">{o.blurb}</p>
          <div className="mt-auto flex flex-wrap gap-2 pt-2">
            <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-[#BEF264]">
              {o.prize}
            </span>
            <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-white/60">
              {o.dateLabel}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function OpportunitiesPage() {
  const [now, setNow] = useState<Date | null>(null);
  const [tab, setTab] = useState<"opportunities" | "challenges">("opportunities");
  const [type, setType] = useState("All");
  const [hideClosed, setHideClosed] = useState(false);

  useEffect(() => {
    setNow(new Date());
  }, []);

  const types = useMemo(
    () => ["All", ...Array.from(new Set(opportunities.map((o) => o.type)))],
    []
  );

  const list = useMemo(() => {
    if (!now) return [];
    return sortOpportunities(opportunities, now).filter(
      (o) =>
        (type === "All" || o.type === type) &&
        (!hideClosed || getStatus(o, now) !== "closed")
    );
  }, [now, type, hideClosed]);

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-12 text-white">
      <p className="font-mono text-xs uppercase tracking-widest text-white/50">
        Opportunities
      </p>
      <h1 className="mt-2 text-4xl font-bold sm:text-5xl">Compete. Intern. Get seen.</h1>
      <p className="mt-3 max-w-xl text-white/60">
        Hand-picked competitions and hackathons. Open ones come first.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        <Pill active={tab === "opportunities"} onClick={() => setTab("opportunities")}>
          Opportunities
        </Pill>
        <Pill active={tab === "challenges"} onClick={() => setTab("challenges")}>
          Ladda challenges
        </Pill>
      </div>

      {tab === "opportunities" ? (
        <>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {types.map((t) => (
              <Pill key={t} active={type === t} onClick={() => setType(t)}>
                {t}
              </Pill>
            ))}
            <span className="mx-1 h-5 w-px bg-white/15" />
            <Pill active={hideClosed} onClick={() => setHideClosed((v) => !v)}>
              Hide closed
            </Pill>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {!now
              ? [0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-56 animate-pulse rounded-[28px] border border-white/10 bg-white/[0.03]"
                  />
                ))
              : list.map((o, i) => (
                  <OppCard key={o.id} o={o} status={getStatus(o, now)} index={i} />
                ))}
          </div>
        </>
      ) : (
        <div className="mt-8 rounded-[28px] border border-dashed border-white/15 bg-white/[0.03] p-10 text-center">
          <span className="font-mono text-[11px] uppercase tracking-widest text-[#BEF264]">
            Coming soon
          </span>
          <h2 className="mt-3 text-2xl font-semibold">Ladda weekly challenge</h2>
          <p className="mx-auto mt-2 max-w-md text-white/60">
            One timed task a week, reviewed on real code. Winners climb the leaderboard.
          </p>
          <p className="mt-6 font-mono text-sm text-white/80">Check back Sunday.</p>
        </div>
      )}
    </main>
  );
}