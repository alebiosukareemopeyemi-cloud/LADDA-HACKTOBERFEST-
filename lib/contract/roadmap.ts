import { z } from "zod";
import { NodeStatusSchema, PhaseSchema, SourceSchema, StageSchema } from "./enums";

// The server pre-computes everything here. The UI never re-implements unlock rules.
export const NextStepSchema = z.enum(["learn", "build", "done"]);
export type NextStep = z.infer<typeof NextStepSchema>;

export const RoadmapNodeSchema = z.object({
  id: z.string(),
  title: z.string(),
  blurb: z.string(),
  phase: PhaseSchema,
  status: NodeStatusSchema,
  source: SourceSchema.nullable(), // how it became known/verified, if it did
  locked: z.boolean(), // computed, never stored
  blockedBy: z.array(z.string()), // prerequisite node IDs still unfinished
  prereqs: z.array(z.string()), // all prerequisite IDs (for drawing path edges)
  nextStep: NextStepSchema,
  hours: z.number(),
  isStretch: z.boolean(),
});
export type RoadmapNode = z.infer<typeof RoadmapNodeSchema>;

export const RoadmapSchema = z.object({
  roleId: z.string(),
  roleTitle: z.string(),
  stage: StageSchema,
  nodes: z.array(RoadmapNodeSchema),
  progress: z.object({
    verified: z.number(), // solid part of the ring
    known: z.number(), // light part of the ring
    total: z.number(),
  }),
  weeksLeft: z.number(),
  hoursPerWeek: z.number(),
});
export type Roadmap = z.infer<typeof RoadmapSchema>;