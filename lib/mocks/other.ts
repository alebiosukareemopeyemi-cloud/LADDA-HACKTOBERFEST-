import type {
  DemoResult,
  EvidencePoll,
  Opportunity,
  VerifyResponse,
} from "@/lib/contract";

// ---- Evidence polling: pending for the first 2 polls, then approved ----
// Demo story: submit a project for "Building an API" (n6), which unlocks n8 and n9.
export function mockPollEvidence(evidenceId: string, attempt: number): EvidencePoll {
  const done = attempt >= 2;
  return {
    evidence: {
      id: evidenceId,
      type: "project",
      status: done ? "approved" : "pending",
      url: "https://github.com/example/my-api",
      fileName: null,
      score: done ? 82 : null,
      passMark: done ? 70 : null,
      feedback: done ? "Clean routes and a solid README. Add input validation next." : null,
      fallback: false,
      createdAt: "2026-10-30T09:00:00Z",
    },
    unlockedNodeIds: done ? ["n8", "n9"] : [],
  };
}

// ---- Credential: valid copy plus a tampered copy for the tamper-test demo ----
// The signature here is fake. Real ed25519 signing arrives in the credential step.
export const mockVerify: VerifyResponse = {
  status: "valid",
  payload: {
    id: "cred-demo-1",
    candidateName: "Demo Student",
    university: "Demo University",
    department: "Computer Science",
    roleTitle: "Backend Engineer",
    skills: [
      {
        skillId: "n1",
        skillName: "Programming fundamentals",
        taskTitle: "Build: Programming fundamentals project",
        repoUrl: "https://github.com/example/fundamentals",
        commitHash: "a1b2c3d",
        overall: 88,
        scores: { "Works end to end": 90, "Clean structure": 85, "Readable README": 89 },
        certificate: null,
      },
      {
        skillId: "n3",
        skillName: "HTTP and REST",
        taskTitle: "Build: HTTP and REST project",
        repoUrl: "https://github.com/example/rest",
        commitHash: "e4f5a6b",
        overall: 84,
        scores: { "Works end to end": 86, "Clean structure": 82, "Readable README": 84 },
        certificate: { title: "HTTP and REST certificate", url: null },
      },
    ],
    issuedAt: "2026-10-29T12:00:00Z",
  },
  signature: "MOCK_SIGNATURE_NOT_REAL",
  publicKey: "MOCK_PUBLIC_KEY_NOT_REAL",
  summary:
    "Demo Student has proven two backend skills by building real projects, each reviewed against a clear rubric. Both repos are open for you to inspect.",
  summaryFallback: false,
};

export const mockVerifyTampered: VerifyResponse = {
  ...mockVerify,
  status: "invalid",
  payload: {
    ...mockVerify.payload,
    skills: mockVerify.payload.skills.map((s, i) => (i === 0 ? { ...s, overall: 99 } : s)),
  },
};

// ---- Opportunities: placeholders. Replace with real ones by hand. ----
const base = {
  image: null,
  featuredFrom: null,
  featuredUntil: null,
  requirements: ["Placeholder requirement one", "Placeholder requirement two"],
  whoCanApply: "Placeholder: who can apply",
  applyUrl: "https://example.com/apply",
};

export const mockOpportunities: Opportunity[] = [
  {
    ...base,
    id: "opp-hacktoberfest",
    title: "AWS Hacktoberfest",
    organiser: "AWS",
    type: "competition",
    deadline: "2026-11-05",
    blurb: "Build, ship and compete in the live AWS Hacktoberfest.",
    description: "Placeholder description for the Hacktoberfest detail page.",
    tags: ["cloud", "open source"],
    featuredFrom: "2026-10-25", // popup window, so it shows during the demo
    featuredUntil: "2026-11-05",
  },
  { ...base, id: "opp-2", title: "Placeholder Hackathon", organiser: "Organiser A", type: "competition", deadline: "2026-12-01", blurb: "Placeholder competition card.", description: "Placeholder.", tags: ["hackathon"] },
  { ...base, id: "opp-3", title: "Placeholder Coding Challenge", organiser: "Organiser B", type: "competition", deadline: "2026-12-15", blurb: "Placeholder competition card.", description: "Placeholder.", tags: ["coding"] },
  { ...base, id: "opp-4", title: "Placeholder Backend Internship", organiser: "Company C", type: "internship", deadline: "2026-11-30", blurb: "Placeholder internship card.", description: "Placeholder.", tags: ["backend"] },
  { ...base, id: "opp-5", title: "Placeholder Software Internship", organiser: "Company D", type: "internship", deadline: "2027-01-10", blurb: "Placeholder internship card.", description: "Placeholder.", tags: ["software"] },
  { ...base, id: "opp-6", title: "Placeholder Data Internship", organiser: "Company E", type: "internship", deadline: "2027-01-31", blurb: "Placeholder internship card.", description: "Placeholder.", tags: ["data"] },
];

// ---- Landing try-it demo results ----
export const mockDemoCourse: DemoResult = {
  mode: "course",
  fits: [
    { label: "Backend Engineering", fit: 86, why: "You like building things that run behind the scenes." },
    { label: "Data Science", fit: 72, why: "Your interest in patterns fits, but you did not mention maths." },
    { label: "Frontend Engineering", fit: 58, why: "Less overlap with what you said you enjoy." },
  ],
};

export const mockDemoGraduate: DemoResult = {
  mode: "graduate",
  gaps: [
    { skill: "Version control", gap: 30 },
    { skill: "Building APIs", gap: 70 },
    { skill: "Deployment", gap: 85 },
  ],
  planB: [
    { title: "QA and test engineering", why: "Uses your degree and needs fewer new tools." },
    { title: "Technical support engineering", why: "A quick way into industry while you build projects." },
  ],
};