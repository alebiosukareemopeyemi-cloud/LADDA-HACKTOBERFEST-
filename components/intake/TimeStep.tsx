"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Clock } from "lucide-react";
import { HORIZON_OPTIONS, HOURS_PER_WEEK_OPTIONS } from "@/lib/contract";
import { container, fadeUp, spring } from "@/lib/motion";

export type Pace = { message: string; fits: boolean; suggestedHours: number | null };

type Props = {
  hoursPerWeek: number;
  onHours: (h: number) => void;
  horizon: number | null; // null = until graduation
  onHorizon: (w: number | null) => void;
  pace: Pace | null;
};

export function TimeStep({ hoursPerWeek, onHours, horizon, onHorizon, pace }: Props) {
  const suggested = pace?.suggestedHours ?? null;

  return (
    <div className="space-y-10">
      <section>
        <p className="tag-label mb-3 text-muted-foreground">Hours a week</p>
        <motion.div
          variants={container(0.1)}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
          {HOURS_PER_WEEK_OPTIONS.map((h) => {
            const selected = hoursPerWeek === h;
            return (
              <motion.div
                key={h}
                variants={fadeUp}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97 }}
                className={`rounded-[1.75rem] p-px ${selected ? "bg-brand glow" : "bg-border"}`}
              >
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onHours(h)}
                  className="w-full rounded-[calc(1.75rem-1px)] bg-card px-4 py-5 text-center"
                >
                  <span className="block font-heading text-4xl font-extrabold">{h}</span>
                  <span className="tag-label mt-1 block text-muted-foreground">hours a week</span>
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      <section>
        <p className="tag-label mb-3 text-muted-foreground">How long do you want to take?</p>
        <motion.div
          variants={container(0.3)}
          initial="hidden"
          animate="show"
          className="flex flex-wrap gap-3"
        >
          {HORIZON_OPTIONS.map((w) => {
            const selected = horizon === w;
            return (
              <motion.button
                key={String(w)}
                type="button"
                aria-pressed={selected}
                variants={fadeUp}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onHorizon(w)}
                className={`rounded-full border px-6 py-3 font-semibold transition-colors ${
                  selected ? "border-transparent bg-brand text-black" : "bg-card"
                }`}
              >
                {w === null ? "Until graduation" : `${w} weeks`}
              </motion.button>
            );
          })}
        </motion.div>
      </section>

      <AnimatePresence mode="wait">
        {pace && (
          <motion.div
            key={pace.message}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={spring}
            className={`flex items-center gap-4 rounded-[1.75rem] border p-5 ${
              pace.fits
                ? "glow border-primary/40 bg-primary/10"
                : "border-amber-400/50 bg-amber-400/10"
            }`}
          >
            <span
              className={`grid size-11 shrink-0 place-items-center rounded-full text-black ${
                pace.fits ? "bg-brand" : "bg-amber-400"
              }`}
            >
              {pace.fits ? <Check className="size-5" /> : <Clock className="size-5" />}
            </span>
            <div className="flex-1">
              <p className="font-semibold">{pace.message}</p>
              {!pace.fits && suggested !== null && (
                <button
                  type="button"
                  onClick={() => onHours(suggested)}
                  className="tag-label mt-2 rounded-full border border-amber-400/50 px-3 py-1"
                >
                  Try {suggested} hours a week
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}