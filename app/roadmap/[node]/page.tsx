"use client";

import { useEffect, useState } from "react";
import { CertificatesPanel } from "@/components/roadmap/CertificatesPanel";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, ExternalLink } from "lucide-react";
import { getNodeDetail } from "@/lib/api/client";
import type { NodeDetail, NodeStatus, ProjectBrief, Resource, RoadmapNode, StepId } from "@/lib/contract";
import { RoadmapRoad } from "@/components/roadmap/RoadmapRoad";
import { CountUp } from "@/components/roadmap/CountUp";
import { fadeUp, spring } from "@/lib/motion";

const stepTitle: Record<StepId, string> = { learn: "Learn", build: "Build", test: "Test" };

const statusText: Record<NodeStatus, string> = {
  todo: "Not started",
  known: "Known",
  in_progress: "In progress",
  verified: "Verified",
};

const PASS_MARK = 70;

// Turn the 3 steps into pseudo-nodes so the same road component can draw them.
function toStops(d: NodeDetail, approved: boolean): RoadmapNode[] {
  return d.steps.map((s) => {
    let status: NodeStatus =
      s.state === "done"
        ? "verified"
        : s.state === "open" && s.id === d.node.nextStep
          ? "in_progress"
          : "todo";
    if (approved && s.id === "build") status = "verified";
    return {
      id: s.id,
      title: stepTitle[s.id],
      blurb: "",
      phase: d.node.phase,
      status,
      source: null,
      locked: s.state === "locked" || s.state === "coming_soon",
      blockedBy: [],
      prereqs: [],
      nextStep: d.node.nextStep,
      hours: 0,
      isStretch: false,
    };
  });
}

// ---- Mock review (swapped for the real AI review in Step 9) ----
type Review = { approved: boolean; score: number; scores: number[]; feedback: string };

function fakeReview(url: string, count: number): Review {
  const fail = url.toLowerCase().includes("fail");
  const scores = Array.from({ length: count }, (_, i) => {
    const seed = (url.length * 7 + i * 13) % 11;
    return fail ? 38 + seed * 2 + (i === 0 ? 20 : 0) : 78 + seed;
  });
  const score = Math.round(scores.reduce((a, b) => a + b, 0) / Math.max(1, scores.length));
  const approved = !fail && score >= PASS_MARK;
  return {
    approved,
    score,
    scores,
    feedback: approved
      ? "Solid structure and a clear README. Nice work."
      : "Some criteria are not met yet. Fix the low scores and submit again.",
  };
}

// ---- Learn panel ----
function LearnPanel({ resources, hasRepo }: { resources: Resource[]; hasRepo: boolean }) {
  return (
    <div>
      <p className="tag-label text-muted-foreground">Learn step</p>
      <h2 className="mt-2 text-xl font-bold">Resources</h2>

      {resources.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Hand-checked resources for this skill are coming soon.
        </p>
      ) : (
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {resources.map((r, i) => (
            <motion.li
              key={r.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: i * 0.06 }}
            >
              <a
                href={r.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-3 rounded-full border px-5 py-3 text-sm transition hover:border-primary"
              >
                <span className="font-medium">{r.title}</span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="tag-label rounded-full border px-2 py-0.5">{r.cost}</span>
                  <ExternalLink className="size-4 text-muted-foreground" />
                </span>
              </a>
            </motion.li>
          ))}
        </ul>
      )}

      {hasRepo && (
        <button
          disabled
          className="tag-label mt-5 cursor-not-allowed rounded-full border px-5 py-3 opacity-50"
        >
          Study it in a real repo · coming soon
        </button>
      )}
    </div>
  );
}

// ---- Build panel ----
function BuildPanel({
  project,
  suggested,
  approved,
  onApproved,
}: {
  project: ProjectBrief | undefined;
  suggested: ProjectBrief[];
  approved: boolean;
  onApproved: () => void;
}) {
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState<"idle" | "pending" | "done">("idle");
  const [review, setReview] = useState<Review | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!project) {
    return <p className="text-sm text-muted-foreground">No project is assigned for this skill yet.</p>;
  }

  async function submit() {
    if (!project) return;
    const v = url.trim();
    if (!/^https:\/\/github\.com\/[^\s/]+\/[^\s/]+/i.test(v)) {
      setError("Paste a GitHub repo link, like https://github.com/you/project");
      return;
    }
    setError(null);
    setPhase("pending");
    await new Promise((r) => setTimeout(r, 2500));
    const result = fakeReview(v, project.criteria.length);
    setReview(result);
    setPhase("done");
    if (result.approved) onApproved();
  }

  return (
    <div>
      <p className="tag-label text-muted-foreground">Build step</p>
      <h2 className="mt-2 text-xl font-bold">{project.title}</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{project.brief}</p>

      {/* Criteria / rubric */}
      <div className="mt-5 grid gap-3">
        {project.criteria.map((c, i) => {
          const s = phase === "done" && review ? review.scores[i] : null;
          const pass = s !== null && s >= PASS_MARK;
          return (
            <div key={c}>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span
                    className={`grid size-5 place-items-center rounded-full border ${
                      pass || approved ? "border-transparent bg-brand text-black" : ""
                    }`}
                  >
                    {(pass || approved) && <Check className="size-3" />}
                  </span>
                  {c}
                </span>
                {s !== null && <span className="tag-label">{s}%</span>}
              </div>
              {s !== null && (
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                  <motion.div
                    className={`h-full rounded-full ${pass ? "bg-brand" : "bg-destructive"}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${s}%` }}
                    transition={{ duration: 0.9, delay: i * 0.15, ease: "easeOut" }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit / states */}
      <div className="mt-6">
        {phase === "pending" && (
          <div>
            <p className="tag-label text-muted-foreground">Reviewing your repo</p>
            <div className="skeleton mt-3 h-10 rounded-full" />
          </div>
        )}

        {phase === "done" && review && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={spring}
            className={`rounded-[1.25rem] border p-5 ${review.approved ? "border-primary" : ""}`}
          >
            <p className="tag-label text-muted-foreground">
              {review.approved ? "Approved" : "Needs work"}
            </p>
            <p className="mt-1 text-3xl font-extrabold">
              <CountUp to={review.score} />
              <span className="text-lg text-muted-foreground"> / 100</span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{review.feedback}</p>
            {!review.approved && (
              <button
                onClick={() => setPhase("idle")}
                className="tag-label mt-4 rounded-full border px-5 py-2 transition hover:border-primary"
              >
                Fix and resubmit
              </button>
            )}
          </motion.div>
        )}

        {phase === "idle" && approved && (
          <div className="rounded-[1.25rem] border border-primary p-5">
            <p className="tag-label text-muted-foreground">Approved</p>
            <p className="mt-1 text-sm">This skill is verified. Nice work.</p>
          </div>
        )}

        {phase === "idle" && !approved && (
          <div>
            <div className="flex flex-col gap-3 md:flex-row">
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://github.com/you/project"
                className="w-full rounded-full border bg-background px-5 py-3 text-sm outline-none focus:border-primary"
              />
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={submit}
                className="glow shrink-0 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-black"
              >
                Submit project
              </motion.button>
            </div>
            {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
          </div>
        )}
      </div>

      {/* Other ideas */}
      {suggested.length > 0 && (
        <div className="mt-8">
          <p className="tag-label text-muted-foreground">Other project ideas</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {suggested.map((p) => (
              <div key={p.id} className="rounded-[1.25rem] border p-4">
                <p className="text-sm font-semibold">{p.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{p.brief}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Page ----
export default function NodePage() {
  const { node } = useParams<{ node: string }>();
  const router = useRouter();
  const [detail, setDetail] = useState<NodeDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<StepId | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    getNodeDetail(node).then((res) => {
      if (res.ok) {
        setDetail(res.data);
        if (res.data.node.nextStep !== "done") setActive(res.data.node.nextStep);
      } else {
        setError(res.message);
      }
    });
  }, [node]);

  function onSelect(stop: RoadmapNode) {
    if (!detail) return;
    const step = detail.steps.find((s) => s.id === stop.id);
    if (!step) return;
    if (step.state === "coming_soon") {
      setActive(null);
      setNotice("Test is coming soon. For now, an approved project is what verifies a skill.");
    } else if (step.state === "locked") {
      setActive(null);
      setNotice(step.lockedReason ?? "Finish the earlier step first.");
    } else {
      setNotice(null);
      setActive(active === step.id ? null : step.id);
    }
  }

  const labels = detail
    ? Object.fromEntries(
        detail.steps.filter((s) => s.state === "coming_soon").map((s) => [s.id, "Coming soon"])
      )
    : undefined;

  const assigned = detail?.projects.find((p) => p.kind === "assigned");
  const suggested = detail?.projects.filter((p) => p.kind === "suggested") ?? [];

  return (
    <main className="relative min-h-dvh px-4 py-6 md:px-10">
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

      <button
        onClick={() => router.push("/roadmap")}
        className="tag-label mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Roadmap
      </button>

      {error && <p className="text-destructive">{error}</p>}
      {!detail && !error && <div className="skeleton h-[420px] rounded-[1.75rem]" />}

      {detail && (
        <>
          <motion.header variants={fadeUp} initial="hidden" animate="show" className="mb-4">
            <p className="tag-label text-muted-foreground">Skill / {detail.node.phase}</p>
            <h1 className="text-3xl font-extrabold md:text-5xl">{detail.node.title}</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">{detail.node.blurb}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="tag-label rounded-full border px-3 py-1">
                {detail.node.locked ? "Locked" : approved ? "Verified" : statusText[detail.node.status]}
              </span>
              <span className="tag-label rounded-full border px-3 py-1">{detail.node.hours}h</span>
              {detail.node.isStretch && (
                <span className="tag-label rounded-full border px-3 py-1">Stretch</span>
              )}
            </div>
          </motion.header>

          {/* On wider screens the 3-stop road fits without a scrollbar */}
          <div className="md:[&>div]:overflow-x-hidden md:[&>div>div]:min-w-0!">
            <RoadmapRoad
              nodes={toStops(detail, approved)}
              onSelect={onSelect}
              highlightId={active}
              labels={labels}
            />
          </div>

          <AnimatePresence>
            {notice && (
              <motion.div
                key={notice}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-4 rounded-full border bg-card px-5 py-3 text-sm"
              >
                {notice}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {active && (
              <motion.section
                key={active}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={spring}
                className="overflow-hidden"
              >
                <div className="rounded-[1.75rem] border bg-card p-6 md:p-8">
                  {active === "learn" && (
                    <LearnPanel resources={detail.resources} hasRepo={detail.repoId !== null} />
                  )}
                  {active === "build" && (
                    <BuildPanel
                      project={assigned}
                      suggested={suggested}
                      approved={approved}
                      onApproved={() => setApproved(true)}
                    />
                  )}
                </div>
              </motion.section>
            )}
          </AnimatePresence>
          <CertificatesPanel suggested={detail.suggestedCertificates} />
        </>
      )}
    </main>
  );
}