"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { motion } from "framer-motion";
import {
  opportunities,
  getStatus,
  type OpportunityStatus,
} from "@/content/opportunities";

const statusInfo: Record<OpportunityStatus, { label: string; cls: string }> = {
  "closing-soon": { label: "Closing soon", cls: "bg-[#BEF264] text-black" },
  open: { label: "Open", cls: "bg-[#BEF264]/15 text-[#BEF264] ring-1 ring-[#BEF264]/40" },
  "check-site": { label: "Check site", cls: "bg-white/10 text-white/70 ring-1 ring-white/15" },
  closed: { label: "Closed", cls: "bg-white/5 text-white/40 ring-1 ring-white/10" },
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-t border-dashed border-white/15 py-4 sm:flex-row sm:items-baseline sm:gap-6">
      <span className="w-40 shrink-0 font-mono text-[11px] uppercase tracking-widest text-white/50">
        {label}
      </span>
      <span className="text-white/90">{value}</span>
    </div>
  );
}

export default function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
  }, []);

  const o = opportunities.find((x) => x.id === id);
  if (!o) notFound();

  const status = now ? getStatus(o, now) : null;
  const s = status ? statusInfo[status] : null;

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-12 text-white">
      <Link
        href="/opportunities"
        className="inline-flex rounded-full border border-white/15 px-4 py-2 font-mono text-xs uppercase tracking-wider text-white/70 transition-colors hover:border-[#BEF264]/50"
      >
        Back to opportunities
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-8 overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03]"
      >
        <div className="h-1.5 bg-gradient-to-r from-[#047857] to-[#BEF264]" />
        <div className="p-8">
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-[11px] uppercase tracking-widest text-white/50">
              {o.type} · {o.organiser}
            </span>
            {s ? (
              <span
                className={`rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-wider ${s.cls}`}
              >
                {s.label}
              </span>
            ) : (
              <span className="h-6 w-20 animate-pulse rounded-full bg-white/10" />
            )}
          </div>

          <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">{o.title}</h1>
          <p className="mt-3 text-white/60">{o.blurb}</p>

          <div className="mt-8">
            <Row label="Prize" value={o.prize} />
            <Row label="When" value={o.dateLabel} />
            {o.eligibility && <Row label="Who can apply" value={o.eligibility} />}
            <Row label="Type" value={o.type} />
            <div className="border-t border-dashed border-white/15" />
          </div>

          <div className="mt-8">
            {status === "closed" ? (
              <p className="rounded-full border border-white/10 px-5 py-3 text-center font-mono text-sm text-white/50">
                This one has closed. Watch this space for the next.
              </p>
            ) : o.applyUrl ? (
              <a
                href={o.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-full bg-gradient-to-r from-[#047857] to-[#BEF264] px-7 py-3 font-semibold text-black transition-transform hover:-translate-y-0.5 active:scale-95"
              >
                Apply on the official page
              </a>
            ) : (
              <p className="text-white/60">{o.applyNote ?? "Check the organiser's site for details."}</p>
            )}
          </div>
        </div>
      </motion.div>
    </main>
  );
}