"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MotionConfig, motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import type { RoadmapNode } from "@/lib/contract";
import { RoadmapRoad } from "@/components/roadmap/RoadmapRoad";
import { fadeUp, spring } from "@/lib/motion";

// The road is drawn on a 1100px canvas; we shrink it to fit the screen.
const ROAD_W = 1100;

type Props = {
  nodes: RoadmapNode[];
  weeks: number;
  onDone: () => void;
  durationMs?: number;
};

export function BuildingStep({ nodes, weeks, onDone, durationMs = 6500 }: Props) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [innerH, setInnerH] = useState(0);
  const [shown, setShown] = useState(0);
  const [done, setDone] = useState(0);

  const finished = useRef(false);
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  });

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    onDoneRef.current();
  }, []);

  // Fit the road to the card width and keep the card height in step.
  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;
    const measure = () => {
      setScale(Math.min(1, outer.clientWidth / ROAD_W));
      setInnerH(inner.offsetHeight);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(outer);
    ro.observe(inner);
    return () => ro.disconnect();
  }, []);

  // Ticking lines, then move on by itself.
  useEffect(() => {
    const ids = [
      setTimeout(() => setShown(1), 900),
      setTimeout(() => setDone(1), 1700),
      setTimeout(() => setShown(2), 2200),
      setTimeout(() => setDone(2), 3000),
      setTimeout(() => setShown(3), 3500),
      setTimeout(() => setDone(3), 4300),
      setTimeout(finish, durationMs),
    ];
    return () => ids.forEach(clearTimeout);
  }, [durationMs, finish]);

  const lines = [
    "Mapping your gaps",
    "Ordering skills",
    `Planning ${weeks} week${weeks === 1 ? "" : "s"}`,
  ];

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-dvh overflow-x-hidden">
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

        <header className="mx-auto flex max-w-5xl items-center px-5 pt-6">
          <span className="font-heading text-xl font-extrabold">
            Ladda<span className="text-brand">.</span>
          </span>
        </header>

        <main className="mx-auto max-w-[1180px] px-4 pb-16 pt-8 text-center md:pt-12">
          <motion.div variants={fadeUp} initial="hidden" animate="show">
            <h1 className="text-3xl font-extrabold md:text-5xl">Laying down your road</h1>
            <p className="mt-2 text-muted-foreground md:text-lg">
              Built from your answers. Just a moment.
            </p>
          </motion.div>

          {/* Road card */}
          <div className="glow mt-8 rounded-[2rem] border bg-card/80 p-3 sm:p-5">
            <div
              ref={outerRef}
              className="relative w-full overflow-hidden"
              style={{
                height: innerH ? innerH * scale : undefined,
                visibility: innerH ? "visible" : "hidden",
              }}
            >
              <div
                ref={innerRef}
                className="pointer-events-none mx-auto"
                style={{ width: ROAD_W, transform: `scale(${scale})`, transformOrigin: "top left" }}
              >
                <RoadmapRoad nodes={nodes} />
              </div>
            </div>
          </div>

          {/* Ticking checklist */}
          <div className="mt-8 flex min-h-12 flex-wrap justify-center gap-3">
            {lines.slice(0, shown).map((text, i) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={spring}
                className="flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-semibold"
              >
                <span
                  className={`grid size-5 place-items-center rounded-full ${
                    i < done ? "bg-brand text-black" : "text-primary"
                  }`}
                >
                  {i < done ? <Check className="size-3.5" /> : <Loader2 className="size-4 animate-spin" />}
                </span>
                {text}
              </motion.div>
            ))}
          </div>

          <button
            type="button"
            onClick={finish}
            className="tag-label mt-6 rounded-full border px-5 py-2 text-muted-foreground transition hover:text-foreground"
          >
            Skip
          </button>
        </main>
      </div>
    </MotionConfig>
  );
}