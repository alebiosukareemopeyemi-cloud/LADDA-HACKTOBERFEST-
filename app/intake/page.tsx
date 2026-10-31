"use client";

import { useState } from "react";
import { IntakeShell, type Direction } from "@/components/intake/IntakeShell";

export default function IntakePage() {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<Direction>(1);

  function go(n: number) {
    setDir(n > step ? 1 : -1);
    setStep(n);
  }

  return (
    <IntakeShell
      step={step}
      stepKey={`s${step}`}
      direction={dir}
      title={`Question ${step + 1} goes here`}
      subtitle="Temporary preview of the shell."
      onBack={step > 0 ? () => go(step - 1) : undefined}
      primaryLabel={step < 3 ? "Continue" : "Finish"}
      onPrimary={() => go(Math.min(step + 1, 3))}
      secondaryLabel={step === 2 ? "Skip for now" : undefined}
      onSecondary={() => go(3)}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        {["One", "Two", "Three"].map((t) => (
          <div key={t} className="rounded-[1.75rem] border bg-card p-6 font-semibold">
            {t}
          </div>
        ))}
      </div>
    </IntakeShell>
  );
}