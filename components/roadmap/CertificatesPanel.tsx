"use client";

import { motion } from "framer-motion";
import { Lock, Upload } from "lucide-react";
import type { CertificateSuggestion } from "@/lib/contract";
import { spring } from "@/lib/motion";

// Mock only: the whole panel is visible but locked until it is built for real.
export function CertificatesPanel({ suggested }: { suggested: CertificateSuggestion[] }) {
  return (
    <section className="relative mt-6 overflow-hidden rounded-[1.75rem] border bg-card p-6 md:p-8">
      <div aria-hidden className="pointer-events-none select-none opacity-40">
        <div className="flex items-center gap-3">
          <p className="tag-label text-muted-foreground">Certificates</p>
          <span className="tag-label rounded-full border px-3 py-0.5">Optional</span>
        </div>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          A certificate can skip the Learn step and shows on your credential, but only an approved
          project verifies a skill.
        </p>

        <p className="tag-label mt-6 text-muted-foreground">Suggested</p>
        {suggested.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Suggested certificates will appear here.
          </p>
        ) : (
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {suggested.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between gap-3 rounded-full border px-5 py-3 text-sm"
              >
                <span>
                  <span className="block font-medium">{c.title}</span>
                  <span className="text-muted-foreground">{c.provider}</span>
                </span>
                <span className="tag-label rounded-full border px-2 py-0.5">{c.cost}</span>
              </div>
            ))}
          </div>
        )}

        <p className="tag-label mt-6 text-muted-foreground">Add yours</p>
        <div className="mt-3 flex flex-col gap-3 md:flex-row">
          <input
            disabled
            tabIndex={-1}
            placeholder="Paste a verification link"
            className="w-full rounded-full border bg-background px-5 py-3 text-sm"
          />
          <button
            disabled
            tabIndex={-1}
            className="shrink-0 rounded-full border px-6 py-3 text-sm font-semibold"
          >
            Attach link
          </button>
        </div>
        <div className="mt-3 flex items-center justify-center gap-2 rounded-[1.25rem] border border-dashed px-5 py-8 text-sm text-muted-foreground">
          <Upload className="size-4" /> Drop a PDF or image here (max 5MB)
        </div>
      </div>

      {/* The stamp */}
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <motion.div
          initial={{ opacity: 0, scale: 1.8, rotate: -14 }}
          whileInView={{ opacity: 1, scale: 1, rotate: -6 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={spring}
          className="tag-label flex items-center gap-2 rounded-full border-2 border-primary bg-background/85 px-6 py-3 text-primary"
        >
          <Lock className="size-4" /> Locked · Coming soon
        </motion.div>
      </div>
    </section>
  );
}