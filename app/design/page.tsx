"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import {
  container,
  drawPath,
  fadeUp,
  hoverLift,
  pop,
  pulseAnimate,
  pulseTransition,
} from "@/lib/motion";

type PinState = "verified" | "known" | "progress" | "todo" | "locked";

const pins: { n: number; name: string; state: PinState; status: string }[] = [
  { n: 1, name: "Programming fundamentals", state: "verified", status: "Verified" },
  { n: 2, name: "Git and GitHub", state: "known", status: "Known" },
  { n: 3, name: "SQL and databases", state: "progress", status: "In progress" },
  { n: 4, name: "Building an API", state: "todo", status: "Not started" },
  { n: 5, name: "Authentication", state: "locked", status: "Locked" },
];

const pinStyle: Record<PinState, string> = {
  verified: "bg-brand text-black",
  known: "border-2 border-node-known bg-node-known/15 text-node-known",
  progress: "border-2 border-node-progress text-node-progress",
  todo: "border-2 border-node-todo text-node-todo",
  locked: "border border-node-locked text-node-locked opacity-60",
};

function Pin({ n, state }: { n: number; state: PinState }) {
  const cls = `grid size-12 place-items-center rounded-full font-semibold ${pinStyle[state]}`;
  const content = state === "locked" ? <Lock className="size-4" /> : n;
  if (state === "progress") {
    return (
      <motion.div className={cls} animate={pulseAnimate} transition={pulseTransition}>
        {content}
      </motion.div>
    );
  }
  return <div className={cls}>{content}</div>;
}

const road = "M40 200 C 160 200, 200 60, 320 60 S 480 200, 600 200 S 720 60, 770 60";
const stops = [
  { x: 40, y: 200, n: 1 },
  { x: 320, y: 60, n: 2 },
  { x: 600, y: 200, n: 3 },
  { x: 770, y: 60, n: 4 },
];

export default function DesignPage() {
  const [light, setLight] = useState(false);
  const [run, setRun] = useState(0);

  function toggleTheme() {
    document.documentElement.classList.toggle("dark");
    setLight((v) => !v);
  }

  return (
    <main className="mx-auto max-w-5xl space-y-14 px-6 py-10">
      <button
        onClick={toggleTheme}
        className="tag-label fixed right-5 top-5 z-10 rounded-full border bg-card px-4 py-2"
      >
        {light ? "Dark mode" : "Light mode"}
      </button>

      {/* Hero */}
      <motion.section
        variants={container()}
        initial="hidden"
        animate="show"
        className="glow rounded-[2rem] border bg-card p-8 md:p-12"
      >
        <motion.p variants={fadeUp} className="tag-label text-muted-foreground">
          Rung 01 · Design system
        </motion.p>
        <motion.h1
          variants={fadeUp}
          className="mt-3 text-5xl font-extrabold leading-[1.02] md:text-7xl"
        >
          Pick right.
          <br />
          Learn real.
          <br />
          <span className="text-brand">Get hired.</span>
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-5 max-w-xl text-lg text-muted-foreground">
          Your degree is the start. Ladda is the climb.
        </motion.p>
        <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
          <motion.button
            {...hoverLift}
            className="glow rounded-full bg-brand px-7 py-3 font-semibold text-black"
          >
            Get started free
          </motion.button>
          <motion.button {...hoverLift} className="rounded-full border px-7 py-3 font-semibold">
            I already have an account
          </motion.button>
          <motion.button
            {...hoverLift}
            className="rounded-full px-7 py-3 font-semibold text-muted-foreground"
          >
            Ghost button
          </motion.button>
        </motion.div>
      </motion.section>

      {/* Chips and labels */}
      <section className="space-y-4">
        <p className="tag-label text-muted-foreground">Exhibit A · Chips and labels</p>
        <div className="flex flex-wrap gap-2">
          {["No. 001", "Verified", "Free", "Paid", "Rung 03"].map((t) => (
            <span key={t} className="tag-label rounded-full border px-3 py-1">
              {t}
            </span>
          ))}
          <span className="tag-label flex items-center gap-1.5 rounded-full border px-3 py-1 opacity-60">
            <Lock className="size-3" /> Coming soon
          </span>
        </div>
        <div className="skeleton h-4 w-56 rounded-full" />
      </section>

      {/* Card with striped top */}
      <section className="space-y-4">
        <p className="tag-label text-muted-foreground">Exhibit B · Card</p>
        <motion.div
          {...hoverLift}
          className="max-w-sm overflow-hidden rounded-[1.75rem] border bg-card"
        >
          <div className="h-3 bg-[repeating-linear-gradient(135deg,#047857_0_10px,#BEF264_10px_20px)]" />
          <div className="space-y-2 p-6">
            <p className="tag-label text-muted-foreground">Founder · No. 001</p>
            <h3 className="text-2xl font-bold">Alebiosu Kareem</h3>
            <p className="text-muted-foreground">Product design, frontend and everything else.</p>
          </div>
        </motion.div>
      </section>

      {/* Node states */}
      <section className="space-y-4">
        <p className="tag-label text-muted-foreground">Exhibit C · Node states</p>
        <motion.div
          variants={container(0.2)}
          initial="hidden"
          animate="show"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
        >
          {pins.map((p) => (
            <motion.div
              key={p.n}
              variants={pop}
              className="flex flex-col items-start gap-3 rounded-[1.75rem] border bg-card p-5"
            >
              <Pin n={p.n} state={p.state} />
              <div>
                <p className="font-semibold leading-tight">{p.name}</p>
                <p className="mt-1 text-sm opacity-60">{p.status}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Road preview */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="tag-label text-muted-foreground">Exhibit D · Road preview</p>
          <button
            onClick={() => setRun((r) => r + 1)}
            className="tag-label rounded-full border px-3 py-1"
          >
            Replay
          </button>
        </div>
        <div className="rounded-[1.75rem] border bg-card p-4">
          <svg key={run} viewBox="0 0 810 260" className="w-full">
            <defs>
              <linearGradient id="road" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#047857" />
                <stop offset="100%" stopColor="#BEF264" />
              </linearGradient>
            </defs>
            <path d={road} fill="none" stroke="var(--muted)" strokeWidth={18} strokeLinecap="round" />
            <motion.path
              d={road}
              fill="none"
              stroke="url(#road)"
              strokeWidth={6}
              strokeLinecap="round"
              variants={drawPath}
              initial="hidden"
              animate="show"
            />
            {stops.map((s, i) => (
              <motion.g
                key={s.n}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.6 + i * 0.35 }}
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
              >
                <circle cx={s.x} cy={s.y} r={20} fill="#BEF264" />
                <text
                  x={s.x}
                  y={s.y + 5}
                  textAnchor="middle"
                  fontSize="16"
                  fontWeight="700"
                  fill="#070A08"
                >
                  {s.n}
                </text>
              </motion.g>
            ))}
          </svg>
        </div>
      </section>
    </main>
  );
}