"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { verifyAsync } from "@noble/ed25519";
import { ChevronDown, ExternalLink, ShieldAlert, ShieldCheck, ShieldX } from "lucide-react";
import {
  envelope,
  VerifyResponseSchema,
  type CredentialPayload,
  type VerifyResponse,
} from "@/lib/contract";
import { base64ToBytes, payloadBytes } from "@/lib/credential/encoding";
import { CountUp } from "@/components/roadmap/CountUp";
import { fadeUp, spring } from "@/lib/motion";

type Check = "idle" | "checking" | "valid" | "invalid";

const look = {
  valid: { label: "Valid", Icon: ShieldCheck, ring: "border-primary", text: "text-primary" },
  invalid: { label: "Invalid", Icon: ShieldX, ring: "border-destructive", text: "text-destructive" },
  revoked: { label: "Revoked", Icon: ShieldAlert, ring: "border-amber-400", text: "text-amber-400" },
} as const;

// Tamper test: quietly raise the last skill's scores, then re-check the ORIGINAL signature.
function tamper(p: CredentialPayload): CredentialPayload {
  const copy: CredentialPayload = JSON.parse(JSON.stringify(p));
  const last = copy.skills[copy.skills.length - 1];
  if (last) {
    last.overall = 99;
    const first = Object.keys(last.scores)[0];
    if (first) last.scores[first] = 99;
  }
  return copy;
}

function Bar({ value, delay = 0 }: { value: number; delay?: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-secondary">
      <motion.div
        className="h-full rounded-full bg-brand"
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.9, delay, ease: "easeOut" }}
      />
    </div>
  );
}

export default function VerifyPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<VerifyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tampered, setTampered] = useState(false);
  const [check, setCheck] = useState<Check>("idle");
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/verify/${encodeURIComponent(id)}`)
      .then((r) => r.json())
      .then((json) => {
        const parsed = envelope(VerifyResponseSchema).safeParse(json);
        if (!parsed.success) setError("Unexpected response from the server.");
        else if (!parsed.data.ok) setError(parsed.data.message);
        else setData(parsed.data.data);
      })
      .catch(() => setError("Network error. Try again."));
  }, [id]);

  async function runCheck(payload: CredentialPayload) {
    if (!data) return;
    setCheck("checking");
    await new Promise((r) => setTimeout(r, 900));
    try {
      const ok = await verifyAsync(
        base64ToBytes(data.signature),
        payloadBytes(payload),
        base64ToBytes(data.publicKey)
      );
      setCheck(ok ? "valid" : "invalid");
    } catch {
      setCheck("invalid");
    }
  }

  const shown = data ? (tampered ? tamper(data.payload) : data.payload) : null;
  const status: keyof typeof look = !data
    ? "valid"
    : data.status === "revoked"
      ? "revoked"
      : check === "invalid"
        ? "invalid"
        : "valid";
  const { label, Icon, ring, text } = look[status];

  return (
    <main className="relative min-h-dvh px-4 py-8 md:px-10">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute -left-40 top-20 size-[520px] rounded-full bg-[#BEF264]/10 blur-3xl"
          animate={{ x: [0, 80, 0], y: [0, 50, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-32 bottom-0 size-[560px] rounded-full bg-[#047857]/20 blur-3xl"
          animate={{ x: [0, -70, 0], y: [0, -60, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="mx-auto max-w-3xl">
        <p className="tag-label text-muted-foreground">Ladda / Credential check</p>

        {error && <p className="mt-6 text-destructive">{error}</p>}
        {!data && !error && <div className="skeleton mt-6 h-72 rounded-[1.75rem]" />}

        {data && shown && (
          <>
            {/* Status */}
            <motion.div
              key={status}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={spring}
              className={`mt-6 flex items-center gap-4 rounded-[1.75rem] border-2 bg-card p-6 ${ring}`}
            >
              <Icon className={`size-12 ${text}`} />
              <div>
                <p className={`text-4xl font-extrabold md:text-5xl ${text}`}>{label}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {status === "valid" && "Issued by Ladda and not altered since."}
                  {status === "invalid" && "This record does not match its signature. Do not trust it."}
                  {status === "revoked" && "Ladda has withdrawn this credential."}
                </p>
              </div>
            </motion.div>

            {/* Candidate */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="mt-4 rounded-[1.75rem] border bg-card p-6"
            >
              <p className="tag-label text-muted-foreground">Candidate</p>
              <h1 className="mt-2 text-2xl font-extrabold md:text-3xl">{shown.candidateName}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {shown.roleTitle} · {shown.department} · {shown.university}
              </p>
              <p className="tag-label mt-3 text-muted-foreground">
                Issued {shown.issuedAt.slice(0, 10)} · ID {shown.id}
              </p>
              <p className="mt-4 text-sm">{data.summary}</p>
            </motion.div>

            {/* Browser check + tamper test */}
            <div className="mt-4 rounded-[1.75rem] border bg-card p-6">
              <p className="tag-label text-muted-foreground">Check it yourself</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => runCheck(shown)}
                  disabled={check === "checking"}
                  className="glow rounded-full bg-brand px-6 py-3 text-sm font-semibold text-black disabled:opacity-60"
                >
                  {check === "checking" ? "Checking..." : "Verify in your browser"}
                </motion.button>

                {!tampered ? (
                  <button
                    onClick={() => {
                      setTampered(true);
                      runCheck(tamper(data.payload));
                    }}
                    className="rounded-full border px-6 py-3 text-sm font-semibold transition hover:border-destructive"
                  >
                    Run the tamper test
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setTampered(false);
                      setCheck("idle");
                    }}
                    className="rounded-full border px-6 py-3 text-sm font-semibold transition hover:border-primary"
                  >
                    Undo tampering
                  </button>
                )}
              </div>

              <AnimatePresence mode="wait">
                {check !== "idle" && (
                  <motion.p
                    key={check}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`tag-label mt-4 ${
                      check === "invalid" ? "text-destructive" : check === "valid" ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {check === "checking" && "Checking the signature in your browser..."}
                    {check === "valid" && "Signature matches. This record is exactly what Ladda issued."}
                    {check === "invalid" &&
                      "Signature does NOT match. This record was changed after it was issued."}
                  </motion.p>
                )}
              </AnimatePresence>
              {tampered && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Tamper test is on: the last skill&apos;s scores were quietly raised to 99. The original
                  signature no longer fits.
                </p>
              )}
            </div>

            {/* Verified skills */}
            <p className="tag-label mt-8 text-muted-foreground">
              Verified skills · {shown.skills.length}
            </p>
            <div className="mt-3 grid gap-3">
              {shown.skills.map((s, i) => {
                const isOpen = open === s.skillId;
                return (
                  <motion.div
                    key={s.skillId}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...spring, delay: 0.1 + i * 0.08 }}
                    className="rounded-[1.5rem] border bg-card p-5"
                  >
                    <button
                      onClick={() => setOpen(isOpen ? null : s.skillId)}
                      className="flex w-full items-center justify-between gap-4 text-left"
                    >
                      <span>
                        <span className="block text-lg font-bold">{s.skillName}</span>
                        <span className="text-sm text-muted-foreground">{s.taskTitle}</span>
                      </span>
                      <span className="flex items-center gap-3">
                        <span className="text-2xl font-extrabold">
                          <CountUp key={`${s.skillId}-${s.overall}`} to={s.overall} />
                        </span>
                        <ChevronDown
                          className={`size-5 text-muted-foreground transition ${isOpen ? "rotate-180" : ""}`}
                        />
                      </span>
                    </button>
                    <div className="mt-3">
                      <Bar value={s.overall} delay={0.2 + i * 0.1} />
                    </div>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={spring}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 grid gap-3 border-t pt-4">
                            {Object.entries(s.scores).map(([name, v]) => (
                              <div key={name}>
                                <div className="flex justify-between text-sm">
                                  <span>{name}</span>
                                  <span className="tag-label">{v}%</span>
                                </div>
                                <div className="mt-1">
                                  <Bar value={v} />
                                </div>
                              </div>
                            ))}
                            <div className="tag-label flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground">
                              <a
                                href={s.repoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 hover:text-foreground"
                              >
                                Repo <ExternalLink className="size-3" />
                              </a>
                              <span>Commit {s.commitHash}</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>

            <p className="mt-8 text-xs text-muted-foreground">
              Honest limit: the signature proves Ladda issued this record and that it was not changed
              afterwards. It does not prove the AI grading was perfect, which is why the repo and commit
              behind every score are open for you to inspect. This is a sample credential made for the demo.
            </p>
          </>
        )}
      </div>
    </main>
  );
}