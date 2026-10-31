"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion, type Transition } from "framer-motion";

// y of each rung: index 0 is the ground, 1 to 4 are the labelled rungs.
const RUNGS = [520, 430, 340, 250, 160];
const LABELS = ["Learn", "Build", "Verify", "Hired"];
const CX = 210;
const LEFT = 150;
const RIGHT = 270;

const swing: Transition = { duration: 0.45, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" };
const settle: Transition = { duration: 0.25 };
const cheer: Transition = { type: "spring", stiffness: 200, damping: 12 };

type LimbProps = {
  x: number;
  y: number;
  length: number;
  from: number;
  to: number;
  up: number;
  moving: boolean;
  celebrating: boolean;
};

// An arm or a leg that swings from its top end.
function Limb({ x, y, length, from, to, up, moving, celebrating }: LimbProps) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <motion.rect
        x={-3.5}
        y={0}
        width={7}
        height={length}
        rx={3.5}
        fill="#A3E635"
        style={{ originX: 0.5, originY: 0 }}
        animate={celebrating ? { rotate: up } : moving ? { rotate: [from, to] } : { rotate: 0 }}
        transition={celebrating ? cheer : moving ? swing : settle}
      />
    </g>
  );
}

export function LadderHero() {
  const reduce = useReducedMotion();
  const [t, setT] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setT((v) => v + 1), 1250);
    return () => clearInterval(id);
  }, [reduce]);

  // 0 = ground, 1 to 4 = rungs, 5 = arrived and celebrating, then it starts over.
  const step = reduce ? 5 : Math.min(t % 8, 5);
  const cycle = Math.floor(t / 8);
  const arrived = step === 5;
  const climbing = !arrived;
  const y = RUNGS[Math.min(step, 4)] - 40;

  return (
    <div className="mx-auto w-full max-w-md">
      <svg viewBox="0 0 420 560" className="h-auto w-full" role="img" aria-label="A friendly character climbing a ladder toward a briefcase">
        <defs>
          <linearGradient id="lh-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#047857" />
            <stop offset="100%" stopColor="#BEF264" />
          </linearGradient>
          <radialGradient id="lh-glow">
            <stop offset="0%" stopColor="#BEF264" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#BEF264" stopOpacity="0" />
          </radialGradient>
        </defs>

        <ellipse cx={CX} cy={542} rx={115} ry={10} fill="#000" opacity={0.35} />

        {/* Rails draw in */}
        {[LEFT, RIGHT].map((x) => (
          <motion.line
            key={x}
            x1={x}
            y1={535}
            x2={x}
            y2={120}
            stroke="#4b5a50"
            strokeWidth={8}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        ))}

        {/* Rungs and their labels light up as the character passes */}
        {LABELS.map((label, i) => {
          const k = i + 1;
          const active = step >= k;
          const ry = RUNGS[k];
          return (
            <g key={label}>
              <motion.line
                x1={LEFT}
                x2={RIGHT}
                y1={ry}
                y2={ry}
                strokeWidth={7}
                strokeLinecap="round"
                initial={{ opacity: 0, stroke: "#4b5a50" }}
                animate={{ opacity: 1, stroke: active ? "#BEF264" : "#4b5a50" }}
                transition={{ duration: 0.3, delay: active ? 0 : 0.6 + i * 0.12 }}
              />
              <motion.rect
                x={288}
                y={ry - 14}
                width={92}
                height={28}
                rx={14}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, fill: active ? "#BEF264" : "rgba(255,255,255,0.06)" }}
                transition={{ duration: 0.3, delay: active ? 0 : 0.8 + i * 0.12 }}
              />
              <text
                x={334}
                y={ry + 5}
                textAnchor="middle"
                fontSize={13}
                style={{
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fill: active ? "#070A08" : "#8a998f",
                }}
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* The job at the top */}
        <circle cx={CX} cy={40} r={52} fill="url(#lh-glow)" opacity={arrived ? 1 : 0.25} />
        <motion.g
          style={{ originX: 0.5, originY: 0.5 }}
          animate={arrived ? { scale: [1, 1.25, 1], rotate: [0, -6, 6, 0] } : { scale: 1, rotate: 0 }}
          transition={{ duration: 0.8 }}
        >
          <g transform={`translate(${CX} 40)`}>
            <path
              d="M-10 -16 v-8 a4 4 0 0 1 4 -4 h12 a4 4 0 0 1 4 4 v8"
              fill="none"
              stroke="#BEF264"
              strokeWidth={4}
              strokeLinecap="round"
            />
            <rect x={-24} y={-16} width={48} height={34} rx={7} fill="url(#lh-grad)" />
            <line x1={-24} x2={24} y1={2} y2={2} stroke="#070A08" strokeOpacity={0.35} strokeWidth={2} />
            <rect x={-5} y={-3} width={10} height={9} rx={2} fill="#070A08" />
          </g>
        </motion.g>

        {/* Sparks when it arrives */}
        {arrived &&
          Array.from({ length: 8 }).map((_, k) => {
            const a = (k / 8) * Math.PI * 2;
            return (
              <motion.circle
                key={`${cycle}-${k}`}
                cx={CX}
                cy={40}
                r={3.5}
                fill="#BEF264"
                initial={{ x: 0, y: 0, opacity: 0 }}
                animate={{ x: Math.cos(a) * 58, y: Math.sin(a) * 58, opacity: [0, 1, 0] }}
                transition={{ duration: 0.9, ease: "easeOut" }}
              />
            );
          })}

        {/* The climber */}
        <motion.g
          initial={{ x: CX, y }}
          animate={{ x: CX, y }}
          transition={
            step === 0 ? { duration: 0.6, ease: "easeInOut" } : { type: "spring", stiffness: 120, damping: 14 }
          }
        >
          <Limb x={-6} y={14} length={26} from={-28} to={28} up={0} moving={climbing} celebrating={false} />
          <Limb x={6} y={14} length={26} from={28} to={-28} up={0} moving={climbing} celebrating={false} />
          <rect x={-13} y={-18} width={26} height={36} rx={13} fill="url(#lh-grad)" />
          <Limb x={-13} y={-10} length={24} from={-35} to={35} up={150} moving={climbing} celebrating={arrived} />
          <Limb x={13} y={-10} length={24} from={35} to={-35} up={-150} moving={climbing} celebrating={arrived} />
          <circle cx={0} cy={-34} r={17} fill="#ECFCCB" />
          <circle cx={-6} cy={-36} r={2.3} fill="#070A08" />
          <circle cx={6} cy={-36} r={2.3} fill="#070A08" />
          <path
            d={arrived ? "M-8 -30 Q0 -18 8 -30" : "M-6 -29 Q0 -23 6 -29"}
            fill="none"
            stroke="#070A08"
            strokeWidth={2.2}
            strokeLinecap="round"
          />
        </motion.g>
      </svg>
    </div>
  );
}