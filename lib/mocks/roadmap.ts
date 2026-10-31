import catalog from "@/content/catalog/backend.json";
import type {
  NodeDetail,
  NodeStatus,
  Phase,
  Roadmap,
  RoadmapNode,
  StepState,
} from "@/lib/contract";

type Skill = (typeof catalog.skills)[number];

// Demo student part-way through the Backend path.
const demoStatus: Record<string, NodeStatus> = {
  "js-ts-basics": "verified",
  "git-github": "known",
  "http-rest": "verified",
  "node-express": "in_progress",
  "sql-postgres": "verified",
};

const statusOf = (id: string): NodeStatus => demoStatus[id] ?? "todo";
const finished = (id: string) => statusOf(id) === "verified" || statusOf(id) === "known";

const nodes: RoadmapNode[] = catalog.skills.map((s: Skill): RoadmapNode => {
  const status = statusOf(s.id);
  const prereqs = s.prereqs as string[];
  const blockedBy = prereqs.filter((p) => !finished(p));
  return {
    id: s.id,
    title: s.title,
    blurb: s.blurb,
    phase: s.phase as Phase,
    status,
    source: status === "known" ? "cv" : status === "verified" ? "task" : null,
    locked: status === "todo" && blockedBy.length > 0,
    blockedBy,
    prereqs,
    nextStep: status === "verified" ? "done" : status === "todo" ? "learn" : "build",
    hours: s.hours,
    isStretch: s.stretch,
  };
});

const hoursLeft = nodes
  .filter((n) => !n.isStretch && n.status !== "verified" && n.status !== "known")
  .reduce((t, n) => t + n.hours, 0);

export const mockRoadmap: Roadmap = {
  roleId: catalog.roleId,
  roleTitle: catalog.roleTitle,
  stage: "studying",
  nodes,
  progress: {
    verified: nodes.filter((n) => n.status === "verified").length,
    known: nodes.filter((n) => n.status === "known").length,
    total: nodes.length,
  },
  weeksLeft: Math.ceil(hoursLeft / 10),
  hoursPerWeek: 10,
};

export function mockNodeDetail(id: string): NodeDetail | null {
  const n = nodes.find((x) => x.id === id);
  const s = catalog.skills.find((x) => x.id === id);
  if (!n || !s) return null;

  const blockers = n.blockedBy
    .map((b) => nodes.find((x) => x.id === b)?.title)
    .filter(Boolean)
    .join(" and ");
  const lockedReason = `Finish ${blockers} first`;
  const criteria = s.project.criteria as string[];
  const suggested = s.suggested as { title: string; brief: string }[];

  const learn: StepState = n.locked ? "locked" : n.status === "verified" ? "done" : "open";
  const build: StepState = n.locked
    ? "locked"
    : n.status === "verified"
      ? "done"
      : n.status === "todo"
        ? "locked"
        : "open";

  return {
    node: n,
    steps: [
      { id: "learn", state: learn, lockedReason: n.locked ? lockedReason : null },
      {
        id: "build",
        state: build,
        lockedReason: n.locked ? lockedReason : build === "locked" ? "Finish Learn first, or attach a certificate" : null,
      },
      { id: "test", state: "coming_soon", lockedReason: "Coming soon" },
    ],
    // Placeholder links for UI testing only. Real, hand-checked links come from the catalog later.
    resources: [
      { id: `${id}-r1`, title: `${s.title}: placeholder guide`, url: "https://example.com/guide", cost: "free", why: null },
      { id: `${id}-r2`, title: `${s.title}: placeholder course`, url: "https://example.com/course", cost: "paid", why: null },
    ],
    repoId: ["http-rest", "node-express", "rest-api"].includes(id) ? "repo-1" : null,
    projects: [
      { id: `${id}-p1`, kind: "assigned", title: s.project.title, brief: s.project.brief, criteria },
      ...suggested.map((x, i) => ({
        id: `${id}-p${i + 2}`,
        kind: "suggested" as const,
        title: x.title,
        brief: x.brief,
        criteria,
      })),
    ],
    suggestedCertificates: [
      { id: `${id}-c1`, title: `${s.title} certificate`, provider: "Example Academy", url: "https://example.com/cert", cost: "free" },
    ],
    evidence:
      n.status === "verified"
        ? [{ id: `${id}-e1`, type: "project", status: "approved", url: "https://github.com/example/project", fileName: null, score: 84, passMark: 70, feedback: "Solid structure and a clear README.", fallback: false, createdAt: "2026-10-28T10:00:00Z" }]
        : [],
  };
}