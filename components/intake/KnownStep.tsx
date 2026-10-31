"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion } from "framer-motion";
import { Check, Info } from "lucide-react";
import { container, fadeUp, spring } from "@/lib/motion";

export type KnownSkill = {
  id: string;
  title: string;
  phase: "foundations" | "core";
  hours: number;
};

type Props = {
  skills: KnownSkill[];
  value: string[]; // ticked skill ids
  onChange: (ids: string[]) => void;
  hoursSaved: number;
};

// Counts from the previous number to the new one (does not restart from 0).
function Ticker({ to }: { to: number }) {
  const [v, setV] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const c = animate(prev.current, to, {
      duration: 0.6,
      ease: "easeOut",
      onUpdate: (x) => {
        prev.current = x;
        setV(Math.round(x));
      },
    });
    return () => c.stop();
  }, [to]);
  return <>{v}</>;
}

function FlipPill({
  skill,
  on,
  onToggle,
}: {
  skill: KnownSkill;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.button
      type="button"
      aria-pressed={on}
      onClick={onToggle}
      variants={fadeUp}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.96 }}
      className="text-left"
      style={{ perspective: 700 }}
    >
      <motion.span
        className="grid"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: on ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 170, damping: 16 }}
      >
        {/* Front */}
        <span
          className="col-start-1 row-start-1 flex items-center gap-3 rounded-full border bg-card px-5 py-3"
          style={{ backfaceVisibility: "hidden" }}
        >
          <span className="font-semibold">{skill.title}</span>
          <span className="tag-label text-muted-foreground">{skill.hours}h</span>
        </span>
        {/* Back */}
        <span
          className="col-start-1 row-start-1 flex items-center gap-2 rounded-full bg-brand px-5 py-3 font-semibold text-black"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <Check className="size-4" />
          {skill.title}
          <span className="tag-label opacity-70">Known</span>
        </span>
      </motion.span>
    </motion.button>
  );
}

const GROUPS = [
  { id: "foundations", label: "Foundations" },
  { id: "core", label: "Core" },
] as const;

export function KnownStep({ skills, value, onChange, hoursSaved }: Props) {
  const toggle = (id: string) =>
    onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);

  return (
    <>
      <div className="space-y-8">
        {GROUPS.map((g) => {
          const list = skills.filter((s) => s.phase === g.id);
          if (list.length === 0) return null;
          return (
            <section key={g.id}>
              <p className="tag-label mb-3 text-muted-foreground">{g.label}</p>
              <motion.div
                variants={container(0.1)}
                initial="hidden"
                animate="show"
                className="flex flex-wrap gap-3"
              >
                {list.map((s) => (
                  <FlipPill key={s.id} skill={s} on={value.includes(s.id)} onToggle={() => toggle(s.id)} />
                ))}
              </motion.div>
            </section>
          );
        })}

        <p className="flex items-start gap-2 text-sm text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0" />
          Known skills still need a project to be verified. This just skips the learning.
        </p>
      </div>

      {/* Floating counter near the button */}
      <div className="pointer-events-none fixed inset-x-0 bottom-28 z-30 flex justify-center md:bottom-8">
        <AnimatePresence>
          {hoursSaved > 0 && (
            <motion.div
              key="saved"
              initial={{ opacity: 0, y: 16, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16 }}
              transition={spring}
              className="glow rounded-full bg-brand px-5 py-2.5 font-semibold text-black"
            >
              Saves you about{" "}
              <span className="font-mono">
                <Ticker to={hoursSaved} />h
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}