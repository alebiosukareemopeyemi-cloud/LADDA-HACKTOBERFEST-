"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Check,
  Cloud,
  Loader2,
  Lock,
  Monitor,
  Search,
  Server,
  type LucideIcon,
} from "lucide-react";
import type { PathSuggestion, Stage } from "@/lib/contract";
import { CountUp } from "@/components/roadmap/CountUp";
import { container, fadeUp, spring } from "@/lib/motion";

// Title and subtitle for the shell, depending on the stage.
export function targetCopy(stage: Stage) {
  return stage === "aspirant"
    ? { title: "What do you enjoy?", subtitle: "Tell us in your own words. We will rank the paths that fit you." }
    : { title: "What do you want to be?", subtitle: "Pick the path you want to climb." };
}

const ROLE_CARDS: { id: string; title: string; text: string; meta?: string; Icon: LucideIcon }[] = [
  { id: "backend", title: "Backend Engineer", text: "APIs, databases and servers", meta: "12 skills · about 105h", Icon: Server },
  { id: "frontend", title: "Frontend Engineer", text: "The interfaces people use", Icon: Monitor },
  { id: "data", title: "Data Analyst", text: "Turning data into answers", Icon: BarChart3 },
  { id: "devops", title: "DevOps Engineer", text: "Shipping and running software", Icon: Cloud },
];

const EXAMPLES = [
  "I love solving puzzles",
  "I like building things that work",
  "I enjoy design and visuals",
  "Numbers and patterns excite me",
];

type Props = {
  stage: Stage;
  value: string | null; // chosen role id
  onChange: (roleId: string) => void;
  availableRoleIds: string[]; // roles that are really built, e.g. ["backend"]
  interests: string;
  onInterests: (text: string) => void;
  paths: PathSuggestion[] | null;
  onPaths: (paths: PathSuggestion[]) => void;
  onSuggest: (interests: string) => Promise<PathSuggestion[]>;
};

function SoonTag() {
  return (
    <span className="tag-label inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-muted-foreground">
      <Lock className="size-3" /> Coming soon
    </span>
  );
}

function CheckBadge() {
  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={spring}
      className="grid size-8 shrink-0 place-items-center rounded-full bg-brand text-black"
    >
      <Check className="size-5" />
    </motion.span>
  );
}

// One selectable card. Unavailable ones are dimmed with a dashed outline.
function Choice({
  selected,
  available,
  onSelect,
  children,
}: {
  selected: boolean;
  available: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  if (!available) {
    return (
      <motion.div
        variants={fadeUp}
        aria-disabled
        className="rounded-[1.75rem] border border-dashed p-5 opacity-60"
      >
        {children}
      </motion.div>
    );
  }
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.985 }}
      className={`rounded-[1.75rem] p-px ${selected ? "bg-brand glow" : "bg-border"}`}
    >
      <button
        type="button"
        aria-pressed={selected}
        onClick={onSelect}
        className="w-full rounded-[calc(1.75rem-1px)] bg-card p-5 text-left"
      >
        {children}
      </button>
    </motion.div>
  );
}

// Circular fit ring: fills while the percentage counts up.
function Ring({ fit, id }: { fit: number; id: string }) {
  return (
    <div className="relative size-20 shrink-0">
      <svg viewBox="0 0 80 80" className="size-full -rotate-90">
        <defs>
          <linearGradient id={`ring-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#047857" />
            <stop offset="100%" stopColor="#BEF264" />
          </linearGradient>
        </defs>
        <circle cx="40" cy="40" r="32" fill="none" stroke="var(--muted)" strokeWidth="7" />
        <motion.circle
          cx="40"
          cy="40"
          r="32"
          fill="none"
          stroke={`url(#ring-${id})`}
          strokeWidth="7"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: fit / 100 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center font-mono text-sm font-bold">
        <span>
          <CountUp to={fit} />%
        </span>
      </span>
    </div>
  );
}

function Aspirant({
  value,
  onChange,
  availableRoleIds,
  interests,
  onInterests,
  paths,
  onPaths,
  onSuggest,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function find() {
    if (interests.trim().length < 3) {
      setError("Tell us a little more first.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      onPaths(await onSuggest(interests.trim()));
    } catch {
      setError("Could not find paths right now. Try again.");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-5">
      <textarea
        rows={3}
        maxLength={500}
        value={interests}
        onChange={(e) => onInterests(e.target.value)}
        placeholder="e.g. I like building things, solving puzzles, and I am not great at drawing"
        className="w-full resize-none rounded-3xl border bg-card px-5 py-4 outline-none transition focus:border-primary/70 focus:ring-4 focus:ring-primary/10"
      />

      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => onInterests(interests.trim() ? `${interests.trim()}. ${ex}` : ex)}
            className="rounded-full border px-4 py-1.5 text-sm text-muted-foreground transition hover:border-primary/50 hover:text-foreground"
          >
            {ex}
          </button>
        ))}
      </div>

      <motion.button
        type="button"
        onClick={find}
        disabled={loading}
        whileHover={loading ? undefined : { y: -2 }}
        whileTap={loading ? undefined : { scale: 0.97 }}
        className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 font-semibold text-black disabled:opacity-60"
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
        {paths ? "Find again" : "Find my paths"}
      </motion.button>

      {error && (
        <p role="alert" className="rounded-full border border-primary/30 bg-primary/10 px-4 py-2.5 text-center text-sm">
          {error}
        </p>
      )}

      {loading && (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-28 rounded-[1.75rem]" />
          ))}
        </div>
      )}

      {!loading && paths && (
        <>
          <motion.div
            key={paths.map((p) => `${p.roleId}${p.fit}`).join("|")}
            variants={container(0.05)}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {paths.map((p, i) => {
              const available = availableRoleIds.includes(p.roleId);
              const selected = value === p.roleId;
              return (
                <Choice key={p.roleId} selected={selected} available={available} onSelect={() => onChange(p.roleId)}>
                  <div className="flex items-center gap-4">
                    <Ring fit={p.fit} id={p.roleId} />
                    <span className="flex-1">
                      <span className="tag-label block text-muted-foreground">#{i + 1} match</span>
                      <span className="block text-lg font-bold">{p.title}</span>
                      <span className="block text-sm text-muted-foreground">{p.why}</span>
                    </span>
                    {available ? selected && <CheckBadge /> : <SoonTag />}
                  </div>
                </Choice>
              );
            })}
          </motion.div>
          <p className="tag-label text-muted-foreground">
            Only Backend Engineer is open for now. The rest are coming soon.
          </p>
        </>
      )}
    </div>
  );
}

export function TargetStep(props: Props) {
  if (props.stage === "aspirant") return <Aspirant {...props} />;

  return (
    <motion.div variants={container(0.1)} initial="hidden" animate="show" className="space-y-4">
      {ROLE_CARDS.map(({ id, title, text, meta, Icon }) => {
        const available = props.availableRoleIds.includes(id);
        const selected = props.value === id;
        return (
          <Choice key={id} selected={selected} available={available} onSelect={() => props.onChange(id)}>
            <div className="flex items-center gap-4">
              <span
                className={`grid size-12 shrink-0 place-items-center rounded-full ${
                  available && selected ? "bg-brand text-black" : "bg-secondary text-primary"
                }`}
              >
                <Icon className="size-5" />
              </span>
              <span className="flex-1">
                <span className="block text-lg font-bold">{title}</span>
                <span className="block text-sm text-muted-foreground">{text}</span>
                {available && meta && <span className="tag-label mt-1 block text-primary">{meta}</span>}
              </span>
              {available ? selected && <CheckBadge /> : <SoonTag />}
            </div>
          </Choice>
        );
      })}
    </motion.div>
  );
}