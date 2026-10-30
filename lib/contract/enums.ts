import { z } from "zod";

// Frozen contract enums. Change these only on purpose: everything imports from here.

export const StageSchema = z.enum(["aspirant", "studying", "graduating"]);
export type Stage = z.infer<typeof StageSchema>;

// "locked" is never stored. The server computes it from prerequisites.
export const NodeStatusSchema = z.enum(["todo", "known", "in_progress", "verified"]);
export type NodeStatus = z.infer<typeof NodeStatusSchema>;

export const EvidenceTypeSchema = z.enum(["resource", "project", "certificate", "test"]);
export type EvidenceType = z.infer<typeof EvidenceTypeSchema>;

export const SourceSchema = z.enum(["cv", "manual", "task"]);
export type Source = z.infer<typeof SourceSchema>;

// Added beyond the plan's four: roadmap phases run in this order.
export const PhaseSchema = z.enum(["foundations", "core", "build", "proof"]);
export type Phase = z.infer<typeof PhaseSchema>;

// Every { ok: false } response carries one of these.
export const ErrorCodeSchema = z.enum([
  "UNAUTHENTICATED",
  "EMAIL_UNVERIFIED",
  "PROFILE_INCOMPLETE",
  "NODE_LOCKED",
  "VALIDATION",
  "AI_FAILED",
  "RATE_LIMITED",
]);
export type ErrorCode = z.infer<typeof ErrorCodeSchema>;
