import catalog from "@/content/catalog/backend.json";
import {
  HOURS_PER_WEEK_OPTIONS,
  type NodeStatus,
  type Phase,
  type Roadmap,
  type RoadmapNode,
  type Stage,
} from "@/lib/contract";

type Skill = (typeof catalog.skills)[number];

// Only early skills can be ticked as Known. Capstone and proof never can.
const KNOWABLE_PHASES: Phase[] = ["foundations", "core"];

export function knowableSkills(): Skill[] {
  return catalog.skills.filter((s) => KNOWABLE_PHASES.includes(s.phase as Phase));
}

function cleanKnown(ids: string[]): Set<string> {
  const ok = new Set(knowableSkills().map((s) => s.id));
  return new Set(ids.filter((id) => ok.has(id)));
}

function mustHaveHoursLeft(known: Set<string>): number {
  return catalog.skills
    .filter((s) => !s.stretch && !known.has(s.id))
    .reduce((t, s) => t + s.hours, 0);
}

// "Your CV saved you 24 hours" (must-have skills only, stretch is not in the plan)
export function hoursSavedBy(ids: string[]): number {
  const known = cleanKnown(ids);
  return catalog.skills
    .filter((s) => !s.stretch && known.has(s.id))
    .reduce((t, s) => t + s.hours, 0);
}

export type Pace = {
  weeksNeeded: number;
  hoursLeft: number;
  fits: boolean | null; // null = "until graduation"
  suggestedHours: number | null;
  message: string;
};

// Time planner: code, not AI.
export function planPace(
  knownIds: string[],
  hoursPerWeek: number,
  horizonWeeks: number | null
): Pace {
  const hoursLeft = mustHaveHoursLeft(cleanKnown(knownIds));
  const weeksNeeded = Math.max(1, Math.ceil(hoursLeft / hoursPerWeek));

  if (horizonWeeks === null) {
    return {
      weeksNeeded,
      hoursLeft,
      fits: null,
      suggestedHours: null,
      message: `About ${weeksNeeded} weeks at ${hoursPerWeek}h a week.`,
    };
  }

  if (weeksNeeded <= horizonWeeks) {
    return {
      weeksNeeded,
      hoursLeft,
      fits: true,
      suggestedHours: null,
      message: `About ${weeksNeeded} weeks at ${hoursPerWeek}h a week. That fits your ${horizonWeeks}-week plan.`,
    };
  }

  const suggested =
    HOURS_PER_WEEK_OPTIONS.find((h) => Math.ceil(hoursLeft / h) <= horizonWeeks) ?? null;
  const over = weeksNeeded - horizonWeeks;
  const maxH = HOURS_PER_WEEK_OPTIONS[HOURS_PER_WEEK_OPTIONS.length - 1];

  return {
    weeksNeeded,
    hoursLeft,
    fits: false,
    suggestedHours: suggested,
    message: suggested
      ? `At ${hoursPerWeek}h a week this takes about ${weeksNeeded} weeks, ${over} over your ${horizonWeeks}-week plan. Try ${suggested}h a week.`
      : `Even at ${maxH}h a week this takes about ${Math.ceil(hoursLeft / maxH)} weeks. Try a longer horizon.`,
  };
}

// Builds the roadmap the student lands on after Intake.
// Same locked/blockedBy logic as the mock; the real engine replaces this in Step 8.
export function buildPlannedRoadmap(input: {
  stage: Stage;
  hoursPerWeek: number;
  knownSkillIds: string[];
}): { roadmap: Roadmap; hoursSaved: number } {
  const known = cleanKnown(input.knownSkillIds);
  const statusOf = (id: string): NodeStatus => (known.has(id) ? "known" : "todo");

  const nodes: RoadmapNode[] = catalog.skills.map((s: Skill): RoadmapNode => {
    const status = statusOf(s.id);
    const prereqs = s.prereqs as string[];
    const blockedBy = prereqs.filter((p) => statusOf(p) !== "known");
    return {
      id: s.id,
      title: s.title,
      blurb: s.blurb,
      phase: s.phase as Phase,
      status,
      source: status === "known" ? "manual" : null,
      locked: status === "todo" && blockedBy.length > 0,
      blockedBy,
      prereqs,
      nextStep: status === "known" ? "build" : "learn",
      hours: s.hours,
      isStretch: s.stretch,
    };
  });

  const hoursLeft = mustHaveHoursLeft(known);

  return {
    roadmap: {
      roleId: catalog.roleId,
      roleTitle: catalog.roleTitle,
      stage: input.stage,
      nodes,
      progress: { verified: 0, known: known.size, total: nodes.length },
      weeksLeft: Math.max(1, Math.ceil(hoursLeft / input.hoursPerWeek)),
      hoursPerWeek: input.hoursPerWeek,
    },
    hoursSaved: hoursSavedBy(input.knownSkillIds),
  };
}