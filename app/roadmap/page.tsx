"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { getRoadmap } from "@/lib/api/client";
import type { Roadmap, RoadmapNode } from "@/lib/contract";
import { RoadmapRoad } from "@/components/roadmap/RoadmapRoad";
import { CountUp } from "@/components/roadmap/CountUp";
import { fadeUp } from "@/lib/motion";

export default function RoadmapPage() {
  const router = useRouter();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [highlight, setHighlight] = useState<string | null>(null);

  useEffect(() => {
    getRoadmap().then((res) => {
      if (res.ok) setRoadmap(res.data);
      else setError(res.message);
    });
  }, []);

  function onSelect(n: RoadmapNode) {
    console.log("pin clicked", n.id, n.locked);
    if (!roadmap) return;
    if (n.locked) {
      const names = n.blockedBy
        .map((id) => roadmap.nodes.find((x) => x.id === id)?.title)
        .filter(Boolean)
        .join(" and ");
      setNotice(`Locked. Finish ${names} first.`);
      setHighlight(n.blockedBy[0] ?? null);
    } else {
      setHighlight(null);

    }
  }

  return (
    <main className="relative min-h-dvh px-4 py-6 md:px-10">
      {/* Soft green glow drifting behind everything */}
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

      <motion.header variants={fadeUp} initial="hidden" animate="show" className="mb-4">
        <p className="tag-label text-muted-foreground">Your roadmap</p>
        <h1 className="text-3xl font-extrabold md:text-5xl">
          {roadmap ? roadmap.roleTitle : "Loading your path"}
        </h1>
        {roadmap && (
          <p className="tag-label mt-2 text-muted-foreground">
            <CountUp to={roadmap.progress.verified} /> verified ·{" "}
            <CountUp to={roadmap.progress.known} /> known ·{" "}
            <CountUp to={roadmap.progress.total} /> skills ·{" "}
            <CountUp to={roadmap.weeksLeft} /> weeks left
          </p>
        )}
      </motion.header>

      <AnimatePresence>
        {notice && (
          <motion.div
            key={notice}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 flex items-center justify-between gap-4 rounded-full border bg-card px-5 py-3 text-sm"
          >
            <span>{notice}</span>
            <button
              onClick={() => {
                setNotice(null);
                setHighlight(null);
              }}
              className="tag-label rounded-full border px-3 py-1"
            >
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="text-destructive">{error}</p>}
      {!roadmap && !error && <div className="skeleton h-[560px] rounded-[1.75rem]" />}
      {roadmap && (
        <RoadmapRoad nodes={roadmap.nodes} onSelect={onSelect} highlightId={highlight} />
      )}
    </main>
  );
}