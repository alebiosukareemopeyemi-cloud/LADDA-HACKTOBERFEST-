import { z } from "zod";

// What actually gets signed. The server serialises this with sorted keys
// (canonical JSON) so the browser can rebuild the exact same bytes to re-check.
export const CredentialSkillSchema = z.object({
  skillId: z.string(),
  skillName: z.string(),
  taskTitle: z.string(),
  repoUrl: z.string().url(),
  commitHash: z.string(),
  overall: z.number(), // loose on purpose: scoring details are still locked
  scores: z.record(z.string(), z.number()), // criterion label -> score
  certificate: z
    .object({ title: z.string(), url: z.string().nullable() })
    .nullable(),
});
export type CredentialSkill = z.infer<typeof CredentialSkillSchema>;

export const CredentialPayloadSchema = z.object({
  id: z.string(),
  candidateName: z.string(),
  university: z.string(),
  department: z.string(),
  roleTitle: z.string(),
  skills: z.array(CredentialSkillSchema), // Verified skills only
  issuedAt: z.string(),
});
export type CredentialPayload = z.infer<typeof CredentialPayloadSchema>;

export const CredentialStatusSchema = z.enum(["valid", "invalid", "revoked"]);
export type CredentialStatus = z.infer<typeof CredentialStatusSchema>;

// GET /api/verify/[id] (public). Carries everything the browser needs to re-check.
export const VerifyResponseSchema = z.object({
  status: CredentialStatusSchema, // server's verdict
  payload: CredentialPayloadSchema,
  signature: z.string(), // base64
  publicKey: z.string(), // base64, same as /api/keys/public
  summary: z.string(), // AI plain-language summary, shown above the evidence
  summaryFallback: z.boolean(),
});
export type VerifyResponse = z.infer<typeof VerifyResponseSchema>;

// GET /api/keys/public
export const PublicKeyResponseSchema = z.object({ publicKey: z.string() });

// POST /api/credential/issue (user comes from the session, never the body)
export const IssueCredentialResponseSchema = z.object({ credentialId: z.string() });

// /credentials list
export const CredentialSummarySchema = z.object({
  id: z.string(),
  roleTitle: z.string(),
  skillCount: z.number(),
  issuedAt: z.string(),
  revoked: z.boolean(),
});
export type CredentialSummary = z.infer<typeof CredentialSummarySchema>;