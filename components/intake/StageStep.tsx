"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Compass, GraduationCap, Rocket, type LucideIcon } from "lucide-react";
import type { Stage } from "@/lib/contract";
import { container, fadeUp, spring } from "@/lib/motion";

const OPTIONS: { id: Stage; title: string; text: string; Icon: LucideIcon }[] = [
  { id: "aspirant", title: "Aspirant", text: "Picking a course or career", Icon: Compass },
  { id: "studying", title: "Studying", text: "In school, building skills", Icon: GraduationCap },
  { id: "graduating", title: "Graduating", text: "Final year, need to get hired", Icon: Rocket },
];

type Props = {
  value: Stage | null;
  onChange: (stage: Stage) => void;
};

export function StageStep({ value, onChange }: Props) {
  return (
    <motion.div variants={container(0.1)} initial="hidden" animate="show" className="space-y-4">
      {OPTIONS.map(({ id, title, text, Icon }) => {
        const selected = value === id;
        return (
          <motion.div
            key={id}
            variants={fadeUp}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.985 }}
            className={`rounded-[1.75rem] p-px ${selected ? "bg-brand glow" : "bg-border"}`}
          >
            <button
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(id)}
              className="flex w-full items-center gap-5 rounded-[calc(1.75rem-1px)] bg-card p-5 text-left"
            >
              <span
                className={`grid size-14 shrink-0 place-items-center rounded-full transition-colors ${
                  selected ? "bg-brand text-black" : "bg-secondary text-primary"
                }`}
              >
                <Icon className="size-6" />
              </span>
              <span className="flex-1">
                <span className="block text-xl font-bold">{title}</span>
                <span className="mt-0.5 block text-muted-foreground">{text}</span>
              </span>
              <AnimatePresence>
                {selected && (
                  <motion.span
                    key="check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={spring}
                    className="grid size-8 place-items-center rounded-full bg-brand text-black"
                  >
                    <Check className="size-5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </motion.div>
        );
      })}
    </motion.div>
  );
}