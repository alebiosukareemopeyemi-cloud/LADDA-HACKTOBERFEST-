"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { opportunities, getStatus } from "@/content/opportunities";

const OPPORTUNITY_ID = "aws-hacktoberfest";
const STORAGE_KEY = "ladda:hacktoberfest-popup-dismissed";

export default function HacktoberfestPopup() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const lookRef = useRef<HTMLButtonElement>(null);

  const o = opportunities.find((x) => x.id === OPPORTUNITY_ID);

  // Show once, only while the event is still running.
  useEffect(() => {
    if (!o) return;
    if (getStatus(o) === "closed") return;
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch {}
    const t = setTimeout(() => setOpen(true), 800);
    return () => clearTimeout(t);
  }, [o]);

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {}
    setOpen(false);
  }

  function lookInto() {
    dismiss();
    router.push(`/opportunities/${OPPORTUNITY_ID}`);
  }

  // Escape closes, and focus moves to the main button.
  useEffect(() => {
    if (!open) return;
    lookRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!o) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={dismiss}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="hacktoberfest-title"
            initial={reduce ? false : { opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="relative w-full max-w-md overflow-hidden rounded-[32px] border border-white/10 bg-[#0B100D] text-white shadow-[0_0_80px_-20px_rgba(190,242,100,0.45)]"
          >
            <div className="h-1.5 bg-gradient-to-r from-[#047857] to-[#BEF264]" />
            <div className="p-8">
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-[#BEF264]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#BEF264] opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#BEF264]" />
                </span>
                AWS Hacktoberfest is live
              </div>

              <h2 id="hacktoberfest-title" className="mt-4 text-3xl font-bold leading-tight">
                Check it out now
              </h2>
              <p className="mt-2 text-white/60">{o.blurb}</p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-[#BEF264]">
                  {o.prize}
                </span>
                <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-white/60">
                  {o.dateLabel}
                </span>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  ref={lookRef}
                  onClick={lookInto}
                  className="rounded-full bg-gradient-to-r from-[#047857] to-[#BEF264] px-6 py-3 font-semibold text-black transition-transform hover:-translate-y-0.5 active:scale-95"
                >
                  Look into it
                </button>
                <button
                  onClick={dismiss}
                  className="rounded-full border border-white/15 px-6 py-3 font-medium text-white/80 transition-colors hover:border-white/40"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}