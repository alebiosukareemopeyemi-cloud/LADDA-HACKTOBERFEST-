import { z } from "zod";
import { RoadmapNodeSchema } from "./roadmap";

// The three steps inside a node panel.
export const StepIdSchema = z.enum(["learn", "build", "test"]);
export type StepId = z.infer<typeof StepIdSchema>;

// locked = lock icon + reason. coming_soon = Test during the hackathon.
export const StepStateSchema = z.enum(["locked", "open", "done", "coming_soon"]);
export type StepState = z.infer<typeof StepStateSchema>;

export const NodeStepSchema = z.object({
  id: StepIdSchema,
  state: StepStateSchema,
  lockedReason: z.string().nullable(), // shown next to the lock icon
});
export type NodeStep = z.infer<typeof NodeStepSchema>;

export const CostSchema = z.enum(["free", "paid"]);

export const ResourceSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string().url(),
  cost: CostSchema,
  why: z.string().nullable(), // AI explains why it fits, never invents the URL
});
export type Resource = z.infer<typeof ResourceSchema>;

// Build step: one assigned project plus suggestions. Rubric stays loose for now.
export const ProjectBriefSchema = z.object({
  id: z.string(),
  kind: z.enum(["assigned", "suggested"]),
  title: z.string(),
  brief: z.string(),
  criteria: z.array(z.string()), // labels only, scoring details come later
});
export type ProjectBrief = z.infer<typeof ProjectBriefSchema>;

// Certificates panel: suggested list + the student's uploads.
export const CertificateSuggestionSchema = z.object({
  id: z.string(),
  title: z.string(),
  provider: z.string(),
  url: z.string().url(),
  cost: CostSchema,
});
export type CertificateSuggestion = z.infer<typeof CertificateSuggestionSchema>;

export const EvidenceStatusSchema = z.enum(["pending", "approved", "rejected", "attached"]);
export type EvidenceStatus = z.infer<typeof EvidenceStatusSchema>;

export const EvidenceSchema = z.object({
  id: z.string(),
  type: z.enum(["resource", "project", "certificate", "test"]),
  status: EvidenceStatusSchema,
  url: z.string().nullable(),
  fileName: z.string().nullable(),
  score: z.number().nullable(),
  passMark: z.number().nullable(),
  feedback: z.string().nullable(),
  fallback: z.boolean(), // true if a cached AI result was used
  createdAt: z.string(),
});
export type Evidence = z.infer<typeof EvidenceSchema>;

// GET /api/roadmap?node=ID
export const NodeDetailSchema = z.object({
  node: RoadmapNodeSchema,
  steps: z.array(NodeStepSchema), // always learn, build, test
  resources: z.array(ResourceSchema),
  repoId: z.string().nullable(), // "Study it in a real repo"
  projects: z.array(ProjectBriefSchema),
  suggestedCertificates: z.array(CertificateSuggestionSchema),
  evidence: z.array(EvidenceSchema),
});
export type NodeDetail = z.infer<typeof NodeDetailSchema>;

// POST /api/node/[id]/project
export const SubmitProjectRequestSchema = z.object({
  githubUrl: z.string().url(),
  projectId: z.string(),
});
export const SubmitProjectResponseSchema = z.object({ evidenceId: z.string() });

// POST /api/node/[id]/certificate (link or uploaded file name)
export const AttachCertificateRequestSchema = z.object({
  url: z.string().url().optional(),
  fileName: z.string().optional(),
});

// GET /api/node/[id]/evidence/[evidenceId], polled every 2s
export const EvidencePollSchema = z.object({
  evidence: EvidenceSchema,
  unlockedNodeIds: z.array(z.string()), // drives the unlock animation
});
export type EvidencePoll = z.infer<typeof EvidencePollSchema>;