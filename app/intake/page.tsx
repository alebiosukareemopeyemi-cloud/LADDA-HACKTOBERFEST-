"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import catalog from "@/content/catalog/backend.json";
import { IntakeShell, type Direction } from "@/components/intake/IntakeShell";
import { StageStep } from "@/components/intake/StageStep";
import { TargetStep, targetCopy } from "@/components/intake/TargetStep";
import { KnownStep, type KnownSkill } from "@/components/intake/KnownStep";
import { TimeStep } from "@/components/intake/TimeStep";
import { BuildingStep } from "@/components/intake/BuildingStep";
import { buildRoadmap, completeIntake, suggestPaths } from "@/lib/api/client";
import { hoursSavedBy, knowableSkills, planPace } from "@/lib/intake/planner";
import type { BuildRoadmapRequest, PathSuggestion, Roadmap, Stage } from "@/lib/contract";

const KNOWABLE: KnownSkill[] = knowableSkills().map((s) => ({
  id: s.id,
  title: s.title,
  phase: s.phase as "foundations" | "core",
  hours: s.hours,
}));

export default function IntakePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<Direction>(1);
  const [stage, setStage] = useState<Stage | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [interests, setInterests] = useState("");
  const [paths, setPaths] = useState<PathSuggestion[] | null>(null);
  const [known, setKnown] = useState<string[]>([]);
  const [hours, setHours] = useState(10);
  const [horizon, setHorizon] = useState<number | null>(12);
  const [built, setBuilt] = useState<Roadmap | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const finished = useRef(false);

  function go(n: number) {
    setDir(n > step ? 1 : -1);
    setStep(n);
  }

  function pickStage(s: Stage) {
    if (s !== stage) {
      setStage(s);
      setRole(null);
      setPaths(null);
    }
  }

  // University is not asked here: the server reads it from the profile made at sign-up.
  // The contract needs 2+ characters, so a placeholder goes in this field.
  function request(s: Stage): BuildRoadmapRequest {
    return {
      stage: s,
      university: "From profile",
      targetRoleId: role ?? catalog.roleId,
      hoursPerWeek: hours,
      horizonWeeks: horizon,
      knownSkillIds: known,
    };
  }

  async function buildPath() {
    if (!stage || busy) return;
    setBusy(true);
    setError(null);
    const res = await buildRoadmap(request(stage));
    setBusy(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    setBuilt(res.data.roadmap);
    go(4);
  }

  async function finish() {
    if (finished.current || !stage) return;
    finished.current = true;
    const res = await completeIntake(request(stage));
    if (!res.ok) console.warn("Intake answers were not saved:", res.message);
    router.push("/roadmap");
  }

  if (step === 0 || !stage) {
    return (
      <IntakeShell
        step={0}
        stepKey="stage"
        direction={dir}
        title="Where are you right now?"
        subtitle="One tap. We tailor everything to this."
        primaryLabel="Continue"
        primaryDisabled={!stage}
        onPrimary={() => go(1)}
      >
        <StageStep value={stage} onChange={pickStage} />
      </IntakeShell>
    );
  }

  if (step === 1) {
    const copy = targetCopy(stage);
    return (
      <IntakeShell
        step={1}
        stepKey={`target-${stage}`}
        direction={dir}
        title={copy.title}
        subtitle={copy.subtitle}
        onBack={() => go(0)}
        primaryLabel="Continue"
        primaryDisabled={!role}
        onPrimary={() => go(2)}
      >
        <TargetStep
          stage={stage}
          value={role}
          onChange={setRole}
          availableRoleIds={[catalog.roleId]}
          interests={interests}
          onInterests={setInterests}
          paths={paths}
          onPaths={setPaths}
          onSuggest={async (text) => {
            const res = await suggestPaths(text);
            return res.ok ? res.data.paths : [];
          }}
        />
      </IntakeShell>
    );
  }

  if (step === 2) {
    return (
      <IntakeShell
        step={2}
        stepKey="known"
        direction={dir}
        title="Anything you already know?"
        subtitle="Tick what you are comfortable with. We skip the learning and you go straight to proving it."
        onBack={() => go(1)}
        primaryLabel="Continue"
        onPrimary={() => go(3)}
        secondaryLabel={known.length === 0 ? "Skip for now" : undefined}
        onSecondary={() => go(3)}
      >
        <KnownStep
          skills={KNOWABLE}
          value={known}
          onChange={setKnown}
          hoursSaved={hoursSavedBy(known)}
        />
      </IntakeShell>
    );
  }

  if (step === 4 && built) {
    return <BuildingStep nodes={built.nodes} weeks={built.weeksLeft} onDone={finish} />;
  }

  const p = planPace(known, hours, horizon);

  return (
    <IntakeShell
      step={3}
      stepKey="time"
      direction={dir}
      title="How much time can you give?"
      subtitle={error ?? "We plan your path around it."}
      onBack={() => go(2)}
      primaryLabel={busy ? "Working..." : "Build my path"}
      primaryDisabled={busy}
      onPrimary={buildPath}
    >
      <TimeStep
        hoursPerWeek={hours}
        onHours={setHours}
        horizon={horizon}
        onHorizon={setHorizon}
        pace={{ message: p.message, fits: p.fits !== false, suggestedHours: p.suggestedHours }}
      />
    </IntakeShell>
  );
}