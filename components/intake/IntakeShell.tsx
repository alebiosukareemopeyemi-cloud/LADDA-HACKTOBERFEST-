"use client";

import type { ReactNode } from "react";
import { AnimatePresence, MotionConfig, motion, type Variants } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { hoverLift } from "@/lib/motion";

export type Direction = 1 | -1;

const TOTAL = 4; // Stage, Target, Known, Time. The Building screen has no progress pill.

// Springy slide with a slight overshoot.
const slide: Variants = {
  enter: (d: number) => ({ x: d * 70, opacity: 0 }),
  center: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 260, damping: 17 },
  },
  exit: (d: number) => ({ x: d * -70, opacity: 0, transition: { duration: 0.18 } }),
};

function ProgressPill({ step }: { step: number }) {
  return (
    <div
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={TOTAL}
      aria-valuenow={Math.min(step + 1, TOTAL)}
      className="flex h-3 w-44 gap-1 rounded-full border bg-card p-[3px] sm:w-60"
    >
      {Array.from({ length: TOTAL }).map((_, i) => (
        <div key={i} className="relative h-full flex-1 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-brand"
            initial={false}
            animate={{ width: i <= step ? "100%" : "0%" }}
            transition={{ type: "spring", stiffness: 200, damping: 24 }}
          />
        </div>
      ))}
    </div>
  );
}

type Props = {
  step: number; // 0-based question index (0 to 3)
  stepKey: string; // changes on every screen so the slide plays
  direction: Direction; // 1 = forward, -1 = back
  title: string;
  subtitle?: string;
  showProgress?: boolean;
  onBack?: () => void; // leave out to hide the back button
  primaryLabel?: string;
  onPrimary?: () => void;
  primaryDisabled?: boolean;
  secondaryLabel?: string; // e.g. "Skip for now"
  onSecondary?: () => void;
  children: ReactNode;
};

export function IntakeShell({
  step,
  stepKey,
  direction,
  title,
  subtitle,
  showProgress = true,
  onBack,
  primaryLabel,
  onPrimary,
  primaryDisabled = false,
  secondaryLabel,
  onSecondary,
  children,
}: Props) {
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

        {/* Top bar: wordmark, progress pill, balancing spacer */}
        <header className="mx-auto flex max-w-3xl items-center justify-between px-5 pt-6">
          <span className="font-heading text-xl font-extrabold">
            Ladda<span className="text-brand">.</span>
          </span>
          {showProgress ? <ProgressPill step={step} /> : <span />}
          <span className="w-[72px]" aria-hidden />
        </header>

        <main className="mx-auto max-w-2xl px-5 pb-32 pt-10 md:pb-16 md:pt-16">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.section
              key={stepKey}
              custom={direction}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <div className="flex items-start gap-4">
                {onBack && (
                  <motion.button
                    type="button"
                    onClick={onBack}
                    aria-label="Back"
                    {...hoverLift}
                    className="mt-1 grid size-11 shrink-0 place-items-center rounded-full border bg-card"
                  >
                    <ArrowLeft className="size-5" />
                  </motion.button>
                )}
                <div>
                  <h1 className="text-3xl font-extrabold leading-tight md:text-5xl">{title}</h1>
                  {subtitle && (
                    <p className="mt-2 text-muted-foreground md:text-lg">{subtitle}</p>
                  )}
                </div>
              </div>
              <div className="mt-8">{children}</div>
            </motion.section>
          </AnimatePresence>

          {/* Actions: inline on desktop, fixed to the bottom on phones */}
          {(primaryLabel || secondaryLabel) && (
            <div className="fixed inset-x-0 bottom-0 z-20 flex flex-col items-center gap-2 border-t bg-background/80 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur md:static md:mt-10 md:flex-row md:justify-start md:gap-4 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
              {primaryLabel && (
                <motion.button
                  type="button"
                  onClick={onPrimary}
                  disabled={primaryDisabled}
                  {...(primaryDisabled ? {} : hoverLift)}
                  className={`inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-8 py-3.5 font-semibold text-black md:w-auto ${
                    primaryDisabled ? "pointer-events-none opacity-40" : "glow"
                  }`}
                >
                  {primaryLabel}
                  <ArrowRight className="size-5" />
                </motion.button>
              )}
              {secondaryLabel && (
                <button
                  type="button"
                  onClick={onSecondary}
                  className="rounded-full px-6 py-3 font-semibold text-muted-foreground hover:text-foreground"
                >
                  {secondaryLabel}
                </button>
              )}
            </div>
          )}
        </main>
      </div>
    </MotionConfig>
  );
}