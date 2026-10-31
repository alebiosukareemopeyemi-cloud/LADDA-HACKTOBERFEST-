"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { animate, motion, useAnimationControls } from "framer-motion";
import { Check, Lock } from "lucide-react";
import type { NodeStatus, RoadmapNode } from "@/lib/contract";
import { roadGeometry, type Point } from "@/lib/roadmap/geometry";
import { drawPath, pulseAnimate, pulseTransition, spring } from "@/lib/motion";

type Props = {
  nodes: RoadmapNode[];
  onSelect?: (node: RoadmapNode) => void;
  highlightId?: string | null;
  labels?: Record<string, string>;
};

const statusText: Record<NodeStatus, string> = {
  todo: "Not started",
  known: "Known",
  in_progress: "In progress",
  verified: "Verified",
};

type Look = NodeStatus | "locked";

const disc: Record<Look, string> = {
  verified: "bg-brand text-black",
  known: "border-2 border-node-known bg-node-known/15 text-node-known",
  in_progress: "border-2 border-node-progress text-node-progress",
  todo: "border-2 border-node-todo text-node-todo",
  locked: "border border-node-locked text-node-locked",
};

// Little sparks that burst out of a verified badge as it pops in.
function Sparks({ delay }: { delay: number }) {
  return (
    <span className="pointer-events-none absolute left-[30px] top-1/2 size-0">
      {Array.from({ length: 8 }).map((_, k) => {
        const a = (k / 8) * Math.PI * 2;
        return (
          <motion.span
            key={k}
            className="absolute -left-[3px] -top-[3px] size-1.5 rounded-full bg-primary"
            initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
            animate={{
              x: Math.cos(a) * 42,
              y: Math.sin(a) * 42,
              opacity: [0, 1, 0],
              scale: [0.4, 1, 0.2],
            }}
            transition={{ duration: 0.8, delay, ease: "easeOut" }}
          />
        );
      })}
    </span>
  );
}

type PillProps = {
  node: RoadmapNode;
  index: number;
  point: Point;
  width: number;
  height: number;
  highlighted: boolean;
  showHere: boolean;
  onSelect?: (n: RoadmapNode) => void;
  label?: string;
};

function Pill({ node: n, index: i, point: p, width, height, highlighted, showHere, onSelect, label }: PillProps) {
  const shake = useAnimationControls();
  const lockWiggle = useAnimationControls();
  const look: Look = n.locked ? "locked" : n.status;
  const delay = 0.5 + i * 0.12;

  function handleClick() {
    if (n.locked) {
      shake.start({ x: [0, -8, 8, -6, 6, -3, 3, 0], transition: { duration: 0.5 } });
      lockWiggle.start({ rotate: [0, -22, 22, -14, 14, 0], transition: { duration: 0.5 } });
    }
    onSelect?.(n);
  }

  return (
    <motion.div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${(p.x / width) * 100}%`, top: `${(p.y / height) * 100}%` }}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ...spring, delay }}
    >
      {/* Gentle idle float (locked pills stay still) */}
      <motion.div
        className="relative"
        animate={n.locked ? undefined : { y: [0, -5, 0] }}
        transition={{
          duration: 3.2 + (i % 3) * 0.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: delay + 1,
        }}
      >
        {showHere && (
          <motion.span
            initial={{ opacity: 0, y: 6, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={spring}
            className="tag-label pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-brand px-3 py-1 text-black"
          >
            You are here
          </motion.span>
        )}

        <motion.button
          type="button"
          onClick={handleClick}
          animate={shake}
          whileHover={{
            y: -4,
            scale: 1.05,
            rotate: i % 2 ? 1.5 : -1.5,
            boxShadow: "0 0 32px rgba(190,242,100,0.35)",
          }}
          whileTap={{ scale: 0.97 }}
          style={{ boxShadow: "0 0 0px rgba(190,242,100,0)" }}
          className={`relative flex items-center gap-3 rounded-full border bg-card py-2 pl-2 pr-5 text-left ${
            n.locked ? "opacity-70" : ""
          } ${highlighted ? "outline-2 outline-offset-4 outline-primary" : ""}`}
        >
          {look === "verified" && <Sparks delay={delay + 0.3} />}

          <motion.span
            className={`grid size-11 shrink-0 place-items-center rounded-full font-mono text-sm font-bold ${disc[look]}`}
            animate={look === "in_progress" ? pulseAnimate : undefined}
            transition={look === "in_progress" ? pulseTransition : undefined}
          >
            {look === "locked" ? (
              <motion.span animate={lockWiggle} className="grid place-items-center">
                <Lock className="size-4" />
              </motion.span>
            ) : look === "verified" ? (
              <Check className="size-5" />
            ) : (
              i + 1
            )}
          </motion.span>

          <span className="max-w-[150px]">
            <span className="block text-[15px] font-semibold leading-tight">{n.title}</span>
            <span className="tag-label mt-1 block opacity-55">
              {n.locked ? "Locked" : statusText[n.status]}
              {n.isStretch ? " · Stretch" : ""}
            </span>
          </span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export function RoadmapRoad({ nodes, onSelect, highlightId }: Props) {
  const g = roadGeometry(nodes.length);
  const pathRef = useRef<SVGPathElement>(null);
  const [dot, setDot] = useState<Point | null>(null);
  const [arrived, setArrived] = useState(false);

  // Light the road up to the furthest finished (verified or known) stop.
  let litIndex = -1;
  nodes.forEach((n, i) => {
    if (n.status === "verified" || n.status === "known") litIndex = i;
  });
  const lit = litIndex >= 0 ? g.fractions[litIndex] : 0;

  // Current skill: the one in progress, else the first open unfinished one.
  let currentIndex = nodes.findIndex((n) => n.status === "in_progress");
  if (currentIndex < 0) currentIndex = nodes.findIndex((n) => n.status === "todo" && !n.locked);
  const target = currentIndex >= 0 ? g.fractions[currentIndex] : 0;

  // A glowing dot travels the road to the current skill, then "You are here" appears.
  useEffect(() => {
    const path = pathRef.current;
    if (!path || target <= 0) return;
    const total = path.getTotalLength();
    const controls = animate(0, target, {
      duration: 2.4,
      delay: 0.8,
      ease: "easeInOut",
      onUpdate: (v) => {
        const pt = path.getPointAtLength(v * total);
        setDot({ x: pt.x, y: pt.y });
      },
      onComplete: () => {
        setDot(null);
        setArrived(true);
      },
    });
    return () => controls.stop();
  }, [g.d, target]);

  return (
    <div className="overflow-x-auto pb-6">
      <div
        className="relative mx-auto"
        style={{ minWidth: 1100, maxWidth: 1500, aspectRatio: `${g.width} / ${g.height}` }}
      >
        <svg viewBox={`0 0 ${g.width} ${g.height}`} className="absolute inset-0 size-full">
          <defs>
            <linearGradient id="roadlit" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={g.width} y2="0">
              <stop offset="0%" stopColor="#047857" />
              <stop offset="100%" stopColor="#BEF264" />
            </linearGradient>
          </defs>

          {/* Invisible copy of the road, used to measure points along it */}
          <path ref={pathRef} d={g.d} fill="none" stroke="none" />

          {/* Road edge and surface */}
          <motion.path
            d={g.d}
            fill="none"
            stroke="var(--muted-foreground)"
            strokeOpacity={0.3}
            strokeWidth={64}
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={drawPath}
            initial="hidden"
            animate="show"
          />
          <motion.path
            d={g.d}
            fill="none"
            stroke="var(--secondary)"
            strokeWidth={54}
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={drawPath}
            initial="hidden"
            animate="show"
          />

          {/* Green part you have already travelled */}
          <motion.path
            d={g.d}
            fill="none"
            stroke="url(#roadlit)"
            strokeWidth={54}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: lit }}
            transition={{ duration: 1.6, ease: "easeInOut", delay: 0.4 }}
          />

          {/* Light streak running along the green stretch */}
          {lit > 0.12 && (
            <path
              d={g.d}
              pathLength={1}
              fill="none"
              stroke="#F7FEE7"
              strokeOpacity={0.85}
              strokeWidth={18}
              strokeLinecap="round"
              className="road-run"
              style={{ "--lit": lit } as CSSProperties}
            />
          )}

          {/* Dashed centre line */}
          <path
            d={g.d}
            fill="none"
            stroke="var(--foreground)"
            strokeOpacity={0.45}
            strokeWidth={3}
            strokeDasharray="14 14"
          />

          {/* Travelling "you are here" dot */}
          {dot && (
            <g>
              <circle cx={dot.x} cy={dot.y} r={20} fill="#BEF264" fillOpacity={0.28} />
              <circle cx={dot.x} cy={dot.y} r={9} fill="#BEF264" />
            </g>
          )}
        </svg>

        {nodes.map((n, i) => (
          <Pill
            key={n.id}
            node={n}
            index={i}
            point={g.stops[i]}
            width={g.width}
            height={g.height}
            highlighted={highlightId === n.id}
            showHere={arrived && i === currentIndex}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}