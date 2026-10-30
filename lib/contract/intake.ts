import { z } from "zod";
import { StageSchema } from "./enums";
import { RoadmapSchema } from "./roadmap";

// UI chips read from these, so the options live in one place.
export const HOURS_PER_WEEK_OPTIONS = [5, 10, 15, 20] as const;
export const HORIZON_OPTIONS = [4, 8, 12, null] as const; // null = until graduation

// Roles shown in the target picker (filtered by department).
export const RoleOptionSchema = z.object({
  id: z.string(),
  title: z.string(),
  department: z.string(),
});
export type RoleOption = z.infer<typeof RoleOptionSchema>;

// POST /api/intake/suggest-paths (aspirants type what they enjoy)
export const SuggestPathsRequestSchema = z.object({
  interests: z.string().min(3).max(500),
});
export const PathSuggestionSchema = z.object({
  roleId: z.string(),
  title: z.string(),
  fit: z.number().int().min(0).max(100), // fit %, computed in code, model only explains
  why: z.string(),
});
export type PathSuggestion = z.infer<typeof PathSuggestionSchema>;
export const SuggestPathsResponseSchema = z.object({
  paths: z.array(PathSuggestionSchema).max(3),
});

// POST /api/intake/parse-cv (multipart upload, so no JSON request schema)
export const CvMatchSchema = z.object({
  skillId: z.string(),
  skillName: z.string(),
  evidence: z.string(), // the CV line that backs it, contact details stripped
});
export type CvMatch = z.infer<typeof CvMatchSchema>;
export const ParseCvResponseSchema = z.object({
  readable: z.boolean(), // false = scanned PDF, fall back to the manual toggle
  matches: z.array(CvMatchSchema),
  hoursSaved: z.number(), // "Your CV saved you 24 hours"
});
export type ParseCvResponse = z.infer<typeof ParseCvResponseSchema>;

// POST /api/intake/build-roadmap
export const BuildRoadmapRequestSchema = z.object({
  stage: StageSchema,
  university: z.string().min(2),
  targetRoleId: z.string(),
  hoursPerWeek: z.number().int().min(1).max(60),
  horizonWeeks: z.number().int().min(1).nullable(), // null = until graduation
  knownSkillIds: z.array(z.string()), // ticked CV matches + manual "I already know"
});
export type BuildRoadmapRequest = z.infer<typeof BuildRoadmapRequestSchema>;
export const BuildRoadmapResponseSchema = z.object({
  roadmap: RoadmapSchema,
  hoursSaved: z.number(),
});
export type BuildRoadmapResponse = z.infer<typeof BuildRoadmapResponseSchema>;