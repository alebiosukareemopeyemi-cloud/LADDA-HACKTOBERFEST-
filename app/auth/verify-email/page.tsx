"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Loader2, Mail, MailOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const COOLDOWN = 60;

function VerifyEmail() {
  const reduce = useReducedMotion();
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const supabase = useMemo(() => createClient(), []);

  const [opened, setOpened] = useState(false);
  const [seconds, setSeconds] = useState(COOLDOWN);
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Envelope "opens" shortly after the card appears
  useEffect(() => {
    const t = setTimeout(() => setOpened(true), 900);
    return () => clearTimeout(t);
  }, []);

  // Resend cooldown
  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  async function resend() {
    if (!email || seconds > 0 || sending) return;
    setSending(true);
    setMsg(null);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setSending(false);
    if (error) {
      setMsg("Couldn't resend just yet. Wait a bit and try again.");
      return;
    }
    setMsg("Sent. Check your inbox and spam folder.");
    setSeconds(COOLDOWN);
  }

  return (
    <main className="relative grid min-h-dvh place-items-center px-4 py-10">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#070A08]">
        <motion.div
          className="absolute -left-40 top-20 size-[520px] rounded-full bg-[#BEF264]/10 blur-3xl"
          animate={reduce ? undefined : { x: [0, 80, 0], y: [0, 50, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-32 bottom-0 size-[560px] rounded-full bg-[#047857]/25 blur-3xl"
          animate={reduce ? undefined : { x: [0, -70, 0], y: [0, -60, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        <div className="absolute inset-0 -z-10 rounded-[28px] bg-gradient-to-br from-[#047857] to-[#BEF264] opacity-30 blur-2xl" />
        <div
          style={{ borderRadius: 28 }}
          className="bg-gradient-to-br from-[#047857] via-[#047857]/40 to-[#BEF264] p-px"
        >
          <div
            style={{ borderRadius: 27 }}
            className="bg-[#0a0f0b] px-6 py-10 text-center sm:px-8"
          >
            {/* Envelope */}
            <motion.div
              animate={reduce ? undefined : { y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="mx-auto mb-6 grid size-20 place-items-center rounded-full border border-[#BEF264]/30 bg-[#BEF264]/10 shadow-[0_0_40px_-8px_rgba(190,242,100,0.6)]"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={opened ? "open" : "closed"}
                  initial={{ opacity: 0, scale: 0.6, rotate: -12 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ type: "spring", stiffness: 380, damping: 22 }}
                  className="text-[#BEF264]"
                >
                  {opened ? <MailOpen size={34} /> : <Mail size={34} />}
                </motion.span>
              </AnimatePresence>
            </motion.div>

            <p className="tag-label text-[11px] uppercase tracking-widest text-white/50">
              One more step
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white">
              Check your inbox
            </h1>
            <p className="mt-3 text-sm text-white/60">
              We sent a verification link to{" "}
              <span className="font-semibold text-[#BEF264]">
                {email || "your email"}
              </span>
              . Open it in this same browser to unlock your dashboard.
            </p>

            <AnimatePresence>
              {msg && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-5 rounded-full border border-[#BEF264]/30 bg-[#BEF264]/10 px-4 py-2.5 text-sm text-[#d9f99d]"
                >
                  {msg}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              type="button"
              onClick={resend}
              disabled={seconds > 0 || sending || !email}
              whileHover={reduce || seconds > 0 ? undefined : { y: -2 }}
              whileTap={reduce || seconds > 0 ? undefined : { scale: 0.97 }}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#047857] to-[#BEF264] px-6 py-3.5 text-sm font-bold text-[#070A08] shadow-[0_0_32px_-6px_rgba(190,242,100,0.55)] transition disabled:opacity-50 disabled:shadow-none"
            >
              {sending && <Loader2 size={16} className="animate-spin" />}
              {sending
                ? "Sending"
                : seconds > 0
                  ? `Resend email in ${seconds}s`
                  : "Resend email"}
            </motion.button>

            <Link
              href="/auth"
              className="tag-label mt-5 inline-block text-[11px] uppercase tracking-widest text-white/45 transition hover:text-[#BEF264]"
            >
              Wrong email? Start over
            </Link>
          </div>
        </div>
      </motion.div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmail />
    </Suspense>
  );
}