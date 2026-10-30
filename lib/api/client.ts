import { z } from "zod";
import {
  envelope,
  NodeDetailSchema,
  RoadmapSchema,
  EvidencePollSchema,
  SubmitProjectResponseSchema,
  VerifyResponseSchema,
  OpportunityListSchema,
  OpportunitySchema,
  DemoResultSchema,
  type ApiResult,
  type DemoRequest,
  type EvidencePoll,
  type NodeDetail,
  type OpportunityList,
  type Opportunity,
  type Roadmap,
  type VerifyResponse,
  type DemoResult,
} from "@/lib/contract";
import { mockRoadmap, mockNodeDetail } from "@/lib/mocks/roadmap";
import {
  mockPollEvidence,
  mockVerify,
  mockVerifyTampered,
  mockOpportunities,
  mockDemoCourse,
  mockDemoGraduate,
} from "@/lib/mocks/other";

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "1";

// Fake network delay so skeletons and polling UI get tested on mocks.
const wait = () => new Promise((r) => setTimeout(r, 300 + Math.random() * 500));

async function mock<T>(data: T): Promise<ApiResult<T>> {
  await wait();
  return { ok: true, data };
}

function notFound(): ApiResult<never> {
  return { ok: false, code: "VALIDATION", message: "Not found" };
}

// Real mode: call the route, validate the response with the same contract schema.
async function call<T extends z.ZodType>(
  path: string,
  schema: T,
  init?: RequestInit
): Promise<ApiResult<z.infer<T>>> {
  try {
    const res = await fetch(path, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    });
    const parsed = envelope(schema).safeParse(await res.json());
    if (!parsed.success) {
      return { ok: false, code: "VALIDATION", message: "Unexpected response from server" };
    }
    return parsed.data as ApiResult<z.infer<T>>;
  } catch {
    return { ok: false, code: "VALIDATION", message: "Network error. Try again." };
  }
}

const post = (body: unknown): RequestInit => ({ method: "POST", body: JSON.stringify(body) });

// ---- Roadmap and nodes ----
export async function getRoadmap(): Promise<ApiResult<Roadmap>> {
  return USE_MOCKS ? mock(mockRoadmap) : call("/api/roadmap", RoadmapSchema);
}

export async function getNodeDetail(nodeId: string): Promise<ApiResult<NodeDetail>> {
  if (USE_MOCKS) {
    const d = mockNodeDetail(nodeId);
    return d ? mock(d) : notFound();
  }
  return call(`/api/roadmap?node=${encodeURIComponent(nodeId)}`, NodeDetailSchema);
}

// ---- Project submit and polling ----
const pollCounts = new Map<string, number>();

export async function submitProject(
  nodeId: string,
  githubUrl: string,
  projectId: string
): Promise<ApiResult<{ evidenceId: string }>> {
  if (USE_MOCKS) {
    const evidenceId = `ev-${Date.now()}`;
    pollCounts.set(evidenceId, 0);
    return mock({ evidenceId });
  }
  return call(`/api/node/${nodeId}/project`, SubmitProjectResponseSchema, post({ githubUrl, projectId }));
}

export async function pollEvidence(nodeId: string, evidenceId: string): Promise<ApiResult<EvidencePoll>> {
  if (USE_MOCKS) {
    const attempt = pollCounts.get(evidenceId) ?? 0;
    pollCounts.set(evidenceId, attempt + 1);
    return mock(mockPollEvidence(evidenceId, attempt));
  }
  return call(`/api/node/${nodeId}/evidence/${evidenceId}`, EvidencePollSchema);
}

// ---- Credential verify (public) ----
export async function getVerify(id: string, opts?: { tampered?: boolean }): Promise<ApiResult<VerifyResponse>> {
  if (USE_MOCKS) return mock(opts?.tampered ? mockVerifyTampered : mockVerify);
  return call(`/api/verify/${encodeURIComponent(id)}`, VerifyResponseSchema);
}

// ---- Opportunities ----
export async function getOpportunities(): Promise<ApiResult<OpportunityList>> {
  if (USE_MOCKS) {
    return mock({ items: mockOpportunities, featured: mockOpportunities[0] });
  }
  return call("/api/opportunities", OpportunityListSchema);
}

export async function getOpportunity(id: string): Promise<ApiResult<Opportunity>> {
  if (USE_MOCKS) {
    const o = mockOpportunities.find((x) => x.id === id);
    return o ? mock(o) : notFound();
  }
  return call(`/api/opportunities/${encodeURIComponent(id)}`, OpportunitySchema);
}

// ---- Landing try-it demo (non-streaming placeholder; streaming comes in Step 11) ----
export async function runDemo(req: DemoRequest): Promise<ApiResult<DemoResult>> {
  if (USE_MOCKS) return mock(req.mode === "course" ? mockDemoCourse : mockDemoGraduate);
  return call("/api/demo", DemoResultSchema, post(req));
}