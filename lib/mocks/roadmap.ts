import type { NodeDetail, Roadmap, RoadmapNode } from "@/lib/contract";

// Placeholder content. Real names, resources and rubrics arrive with the Step 3 catalog.
function node(
  o: Pick<RoadmapNode, "id" | "title" | "phase" | "hours"> & Partial<RoadmapNode>
): RoadmapNode {
  return {
    blurb: `Placeholder: ${o.title}`,
    status: "todo",
    source: null,
    locked: false,
    blockedBy: [],
    prereqs: [],
    nextStep: "learn",
    isStretch: false,
    ...o,
  };
}

const nodes: RoadmapNode[] = [
  node({ id: "n1", title: "Programming fundamentals", phase: "foundations", hours: 8, status: "verified", source: "task", nextStep: "done" }),
  node({ id: "n2", title: "Git and GitHub", phase: "foundations", hours: 4, status: "known", source: "cv", nextStep: "build" }),
  node({ id: "n3", title: "HTTP and REST", phase: "foundations", hours: 6, status: "verified", source: "task", nextStep: "done", prereqs: ["n1"] }),
  node({ id: "n4", title: "Command line basics", phase: "foundations", hours: 3, isStretch: true }),
  node({ id: "n5", title: "SQL and databases", phase: "core", hours: 10, status: "in_progress", nextStep: "build", prereqs: ["n1"] }),
  node({ id: "n6", title: "Building an API", phase: "core", hours: 12, prereqs: ["n2", "n3"] }),
  node({ id: "n7", title: "Authentication", phase: "core", hours: 8, prereqs: ["n5", "n6"], locked: true, blockedBy: ["n5", "n6"] }),
  node({ id: "n8", title: "Testing basics", phase: "core", hours: 6, isStretch: true, prereqs: ["n6"], locked: true, blockedBy: ["n6"] }),
  node({ id: "n9", title: "Deploying a service", phase: "build", hours: 8, prereqs: ["n6"], locked: true, blockedBy: ["n6"] }),
  node({ id: "n10", title: "Caching and queues", phase: "build", hours: 8, isStretch: true, prereqs: ["n7"], locked: true, blockedBy: ["n7"] }),
  node({ id: "n11", title: "Capstone API", phase: "build", hours: 20, prereqs: ["n7", "n9"], locked: true, blockedBy: ["n7", "n9"] }),
  node({ id: "n12", title: "Proof: verified capstone", phase: "proof", hours: 6, prereqs: ["n11"], locked: true, blockedBy: ["n11"] }),
];

export const mockRoadmap: Roadmap = {
  roleId: "backend",
  roleTitle: "Backend Engineer",
  stage: "studying",
  nodes,
  progress: { verified: 2, known: 1, total: 12 },
  weeksLeft: 7,
  hoursPerWeek: 10,
};

export function mockNodeDetail(id: string): NodeDetail | null {
  const n = nodes.find((x) => x.id === id);
  if (!n) return null;

  const blockers = n.blockedBy
    .map((b) => nodes.find((x) => x.id === b)?.title)
    .filter(Boolean)
    .join(" and ");
  const lockedReason = `Finish ${blockers} first`;

  const learnState = n.locked ? "locked" : n.status === "todo" || n.status === "known" ? "open" : "done";
  const buildState = n.locked
    ? "locked"
    : n.status === "verified"
      ? "done"
      : n.status === "todo"
        ? "locked"
        : "open";

  return {
    node: n,
    steps: [
      { id: "learn", state: learnState, lockedReason: n.locked ? lockedReason : null },
      {
        id: "build",
        state: buildState,
        lockedReason: n.locked ? lockedReason : buildState === "locked" ? "Finish Learn first, or attach a certificate" : null,
      },
      { id: "test", state: "coming_soon", lockedReason: "Coming soon" },
    ],
    resources: [
      { id: `${id}-r1`, title: `${n.title}: official guide`, url: "https://example.com/guide", cost: "free", why: "Covers the basics at the right pace for your time." },
      { id: `${id}-r2`, title: `${n.title}: video course`, url: "https://example.com/video", cost: "free", why: null },
      { id: `${id}-r3`, title: `${n.title}: paid bootcamp module`, url: "https://example.com/paid", cost: "paid", why: null },
    ],
    repoId: ["n3", "n5", "n6"].includes(id) ? "repo-1" : null,
    projects: [
      { id: `${id}-p1`, kind: "assigned", title: `Build: ${n.title} project`, brief: "Placeholder brief for the assigned project.", criteria: ["Works end to end", "Clean structure", "Readable README"] },
      { id: `${id}-p2`, kind: "suggested", title: "Suggested idea A", brief: "Placeholder suggestion.", criteria: ["Works end to end", "Clean structure", "Readable README"] },
      { id: `${id}-p3`, kind: "suggested", title: "Suggested idea B", brief: "Placeholder suggestion.", criteria: ["Works end to end", "Clean structure", "Readable README"] },
    ],
    suggestedCertificates: [
      { id: `${id}-c1`, title: `${n.title} certificate`, provider: "Example Academy", url: "https://example.com/cert", cost: "free" },
      { id: `${id}-c2`, title: `${n.title} professional certificate`, provider: "Example Learning", url: "https://example.com/cert-pro", cost: "paid" },
    ],
    evidence:
      n.status === "verified"
        ? [{ id: `${id}-e1`, type: "project", status: "approved", url: "https://github.com/example/project", fileName: null, score: 84, passMark: 70, feedback: "Solid structure and a clear README.", fallback: false, createdAt: "2026-10-28T10:00:00Z" }]
        : [],
  };
}