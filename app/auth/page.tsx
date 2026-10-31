"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Tab = "signup" | "signin";

const DEPARTMENTS = [
  "Computer Science",
  "Electrical and Electronics Engineering",
  "Computer Engineering",
  "Information Systems / Data Science",
];

const UNIVERSITIES = [
  "University of Lagos",
  "University of Ibadan",
  "Obafemi Awolowo University",
  "University of Nigeria, Nsukka",
  "Ahmadu Bello University",
  "University of Benin",
  "University of Ilorin",
  "Lagos State University",
  "Covenant University",
  "Babcock University",
  "Pan-Atlantic University",
  "Bells University of Technology",
  "Afe Babalola University",
  "Redeemer's University",
  "Nile University of Nigeria",
  "American University of Nigeria",
  "Federal University of Technology, Akure",
  "Federal University of Technology, Minna",
  "Federal University of Technology, Owerri",
];

const pillInput =
  "w-full rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-[#BEF264]/70 focus:bg-white/[0.07] focus:ring-4 focus:ring-[#BEF264]/10";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="tag-label mb-1.5 ml-2 block text-[10px] uppercase tracking-widest text-white/50">
        {label}
      </span>
      {children}
    </label>
  );
}

export default function AuthPage() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const supabase = useMemo(() => createClient(), []);

  const [tab, setTab] = useState<Tab>("signup");
  const [name, setName] = useState("");
  const [university, setUniversity] = useState("");
  const [uniOpen, setUniOpen] = useState(false);
  const [department, setDepartment] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState(0);

  const suggestions = UNIVERSITIES.filter((u) =>
    u.toLowerCase().includes(university.trim().toLowerCase())
  ).slice(0, 5);

  function fail(msg: string) {
    setError(msg);
    setErrorKey((k) => k + 1);
    setLoading(false);
  }

  function switchTab(next: Tab) {
    if (next === tab) return;
    setError(null);
    setTab(next);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (tab === "signup") {
      if (!name.trim()) return fail("Tell us your name first.");
      if (!university.trim()) return fail("Add your university (or the one you're aiming for).");
      if (!department) return fail("Pick your department.");
    }
    if (!email.trim()) return fail("Enter your email.");
    if (password.length < 8) return fail("Password needs at least 8 characters.");

    setLoading(true);

    if (tab === "signup") {
      const { data, error: err } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            display_name: name.trim(),
            university: university.trim(),
            department,
          },
        },
      });
      if (err) return fail(err.message);
      if (data.user && data.user.identities?.length === 0) {
        return fail("That email already has an account. Try signing in.");
      }
      router.push(`/auth/verify-email?email=${encodeURIComponent(email.trim())}`);
      return;
    }

    const { error: err } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (err) {
      if (err.message.toLowerCase().includes("not confirmed")) {
        router.push(`/auth/verify-email?email=${encodeURIComponent(email.trim())}`);
        return;
      }
      return fail("Wrong email or password.");
    }
    router.push("/roadmap");
    router.refresh();
  }

  return (
    <main className="relative grid min-h-dvh place-items-center px-4 py-10">
      {/* Drifting green glow */}
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
        {/* Glow behind the card */}
        <div className="absolute inset-0 -z-10 rounded-[28px] bg-gradient-to-br from-[#047857] to-[#BEF264] opacity-30 blur-2xl" />

        {/* Gradient border */}
        <motion.div
          layout
          style={{ borderRadius: 28 }}
          className="bg-gradient-to-br from-[#047857] via-[#047857]/40 to-[#BEF264] p-px"
        >
          <motion.div
            layout
            style={{ borderRadius: 27 }}
            className="bg-[#0a0f0b] px-6 py-8 sm:px-8"
          >
            {/* Wordmark */}
            <div className="mb-6 text-center">
              <h1 className="bg-gradient-to-r from-[#047857] to-[#BEF264] bg-clip-text text-4xl font-extrabold tracking-tight text-transparent">
                Ladda
              </h1>
              <p className="tag-label mt-2 text-[11px] uppercase tracking-widest text-white/50">
                Pick right. Learn real. Get hired.
              </p>
            </div>

            {/* Tabs */}
            <div className="relative mb-6 grid grid-cols-2 rounded-full border border-white/10 bg-white/[0.03] p-1">
              {(["signup", "signin"] as Tab[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => switchTab(t)}
                  className="relative z-10 rounded-full py-2 text-sm font-semibold transition-colors"
                  style={{ color: tab === t ? "#070A08" : "rgba(255,255,255,0.6)" }}
                >
                  {tab === t && (
                    <motion.span
                      layoutId="auth-tab-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-[#047857] to-[#BEF264]"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  {t === "signup" ? "Sign up" : "Sign in"}
                </button>
              ))}
            </div>

            <form onSubmit={onSubmit} noValidate>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {tab === "signup" && (
                    <>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Name">
                          <input
                            className={pillInput}
                            placeholder="Ada Obi"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoComplete="name"
                          />
                        </Field>

                        <Field label="University">
                          <div className="relative">
                            <input
                              className={pillInput}
                              placeholder="Start typing"
                              value={university}
                              onChange={(e) => {
                                setUniversity(e.target.value);
                                setUniOpen(true);
                              }}
                              onFocus={() => setUniOpen(true)}
                              onBlur={() => setTimeout(() => setUniOpen(false), 120)}
                              autoComplete="off"
                            />
                            <AnimatePresence>
                              {uniOpen && suggestions.length > 0 && (
                                <motion.ul
                                  initial={{ opacity: 0, y: -4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0 }}
                                  transition={{ duration: 0.15 }}
                                  className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-3xl border border-white/10 bg-[#0d130e] p-1 shadow-xl"
                                >
                                  {suggestions.map((u) => (
                                    <li key={u}>
                                      <button
                                        type="button"
                                        onMouseDown={(e) => {
                                          e.preventDefault();
                                          setUniversity(u);
                                          setUniOpen(false);
                                        }}
                                        className="w-full rounded-full px-4 py-2 text-left text-sm text-white/80 transition hover:bg-[#BEF264]/10 hover:text-[#BEF264]"
                                      >
                                        {u}
                                      </button>
                                    </li>
                                  ))}
                                </motion.ul>
                              )}
                            </AnimatePresence>
                          </div>
                        </Field>
                      </div>

                      <Field label="Department">
                        <select
                          className={`${pillInput} appearance-none`}
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                        >
                          <option value="" className="bg-[#0a0f0b]">
                            Choose one
                          </option>
                          {DEPARTMENTS.map((d) => (
                            <option key={d} value={d} className="bg-[#0a0f0b]">
                              {d}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </>
                  )}

                  <Field label="Email">
                    <input
                      type="email"
                      className={pillInput}
                      placeholder="you@school.edu.ng"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                    />
                  </Field>

                  <Field label="Password">
                    <div className="relative">
                      <input
                        type={showPw ? "text" : "password"}
                        className={`${pillInput} pr-12`}
                        placeholder="At least 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete={tab === "signup" ? "new-password" : "current-password"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw((s) => !s)}
                        aria-label={showPw ? "Hide password" : "Show password"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-white/50 transition hover:text-[#BEF264]"
                      >
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </Field>
                </motion.div>
              </AnimatePresence>

              {/* Error pill */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    key={errorKey}
                    initial={{ opacity: 0, y: -6 }}
                    animate={
                      reduce
                        ? { opacity: 1, y: 0 }
                        : { opacity: 1, y: 0, x: [0, -6, 6, -4, 4, 0] }
                    }
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    role="alert"
                    className="mt-5 rounded-full border border-[#BEF264]/30 bg-[#BEF264]/10 px-4 py-2.5 text-center text-sm text-[#d9f99d]"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={reduce || loading ? undefined : { y: -2 }}
                whileTap={reduce || loading ? undefined : { scale: 0.97 }}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#047857] to-[#BEF264] px-6 py-3.5 text-sm font-bold text-[#070A08] shadow-[0_0_32px_-6px_rgba(190,242,100,0.55)] transition disabled:opacity-70"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading
                  ? tab === "signup"
                    ? "Creating your account"
                    : "Signing you in"
                  : tab === "signup"
                    ? "Create my account"
                    : "Sign in"}
              </motion.button>
            </form>

            <p className="tag-label mt-5 text-center text-[10px] uppercase tracking-widest text-white/35">
              Email and password only. Employers verify without an account.
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </main>
  );
}