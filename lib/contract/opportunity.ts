import { z } from "zod";

export const OpportunityTypeSchema = z.enum(["competition", "internship"]);
export type OpportunityType = z.infer<typeof OpportunityTypeSchema>;

// GET /api/opportunities (cards) and /api/opportunities/[id] (detail)
export const OpportunitySchema = z.object({
  id: z.string(),
  title: z.string(),
  organiser: z.string(),
  type: OpportunityTypeSchema,
  deadline: z.string(),
  blurb: z.string(), // short text for the card
  description: z.string(),
  whoCanApply: z.string(),
  requirements: z.array(z.string()),
  applyUrl: z.string().url(), // opens in a new tab
  image: z.string().nullable(),
  tags: z.array(z.string()),
  featuredFrom: z.string().nullable(), // popup window, e.g. Hacktoberfest
  featuredUntil: z.string().nullable(),
});
export type Opportunity = z.infer<typeof OpportunitySchema>;

// GET /api/opportunities?type=...
export const OpportunityListSchema = z.object({
  items: z.array(OpportunitySchema),
  featured: OpportunitySchema.nullable(), // set only inside its date window and if not dismissed
});
export type OpportunityList = z.infer<typeof OpportunityListSchema>;

// POST /api/announcements/dismiss
export const DismissAnnouncementRequestSchema = z.object({ opportunityId: z.string() });