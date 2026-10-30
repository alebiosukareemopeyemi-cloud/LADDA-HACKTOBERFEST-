import { z } from "zod";

// POST /api/demo (public, rate limited): the landing try-it box
export const DemoModeSchema = z.enum(["course", "graduate"]);
export type DemoMode = z.infer<typeof DemoModeSchema>;

export const DemoRequestSchema = z.object({
  mode: DemoModeSchema,
  text: z.string().min(3).max(500),
});
export type DemoRequest = z.infer<typeof DemoRequestSchema>;

// Course mode: fit % bars. Graduate mode: skill-gap bars plus Plan B paths.
export const DemoCourseResultSchema = z.object({
  mode: z.literal("course"),
  fits: z.array(z.object({ label: z.string(), fit: z.number().int().min(0).max(100), why: z.string() })),
});
export const DemoGraduateResultSchema = z.object({
  mode: z.literal("graduate"),
  gaps: z.array(z.object({ skill: z.string(), gap: z.number().int().min(0).max(100) })),
  planB: z.array(z.object({ title: z.string(), why: z.string() })),
});
export const DemoResultSchema = z.discriminatedUnion("mode", [
  DemoCourseResultSchema,
  DemoGraduateResultSchema,
]);
export type DemoResult = z.infer<typeof DemoResultSchema>;