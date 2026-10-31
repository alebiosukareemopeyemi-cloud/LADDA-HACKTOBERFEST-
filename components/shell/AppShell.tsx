"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

const SHOW_ON = ["/dashboard", "/roadmap", "/opportunities"];

const MENU: { label: string; href: string | null }[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Roadmap", href: "/roadmap" },
  { label: "Opportunities", href: "/opportunities" },
  { label: "Leaderboard", href: null },
  { label: "Your Notes", href: null },
  { label: "Connect", href: null },
];

export default function AppShell() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close everything when the page changes.
  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  // Who is signed in (best effort).
  useEffect(() => {
    let alive = true;
    try {
      createClient()
        .auth.getUser()
        .then(({ data }) => {
          if (alive) setEmail(data.user?.email ?? null);
        })
        .catch(() => {});
    } catch {}
    return () => {
      alive = false;
    };
  }, []);

  // Escape closes menus; clicking outside closes the profile menu.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setProfileOpen(false);
      }
    }
    function onDown(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onDown);
    };
  }, []);

  async function signOut() {
    try {
      await createClient().auth.signOut();
    } catch {}
    setProfileOpen(false);
    router.push("/auth");
    router.refresh();
  }

  const visible = SHOW_ON.some((p) => pathname.startsWith(p));
  if (!visible) return null;

  const initial = email ? email[0].toUpperCase() : null;

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 h-14 border-b border-white/10 bg-black/60 backdrop-blur-md">
        <div className="flex h-full items-center justify-between px-4 md:px-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              className="flex size-10 flex-col items-center justify-center gap-1.5 rounded-full border border-white/15 transition-colors hover:border-[#BEF264]/50"
            >
              <span className="h-0.5 w-4 rounded bg-white" />
              <span className="h-0.5 w-4 rounded bg-white" />
              <span className="h-0.5 w-4 rounded bg-white" />
            </button>
            <Link href="/dashboard" className="text-lg font-extrabold">
              Ladda<span className="text-[#BEF264]">.</span>
            </Link>
          </div>

          <div ref={profileRef} className="relative">
            <button
              onClick={() => setProfileOpen((v) => !v)}
              aria-label="Profile menu"
              aria-expanded={profileOpen}
              className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-[#047857] to-[#BEF264] font-bold text-black transition-transform hover:scale-105 active:scale-95"
            >
              {initial ?? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8z" />
                </svg>
              )}
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 w-64 rounded-3xl border border-white/10 bg-[#0B100D] p-2 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)]"
                >
                  {email && (
                    <p className="tag-label truncate px-4 py-3 text-muted-foreground">{email}</p>
                  )}
                  <span className="flex items-center justify-between rounded-full px-4 py-2.5 text-sm text-white/40">
                    Profile <span className="tag-label">Soon</span>
                  </span>
                  <span className="flex items-center justify-between rounded-full px-4 py-2.5 text-sm text-white/40">
                    Settings <span className="tag-label">Soon</span>
                  </span>
                  <Link
                    href="/verify/demo-001"
                    className="block rounded-full px-4 py-2.5 text-sm transition-colors hover:bg-white/5"
                  >
                    Sample credential
                  </Link>
                  <button
                    onClick={signOut}
                    className="mt-1 block w-full rounded-full px-4 py-2.5 text-left text-sm text-[#BEF264] transition-colors hover:bg-white/5"
                  >
                    Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>
      <div className="h-14" aria-hidden="true" />

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              aria-hidden="true"
            />
            <motion.nav
              role="dialog"
              aria-label="Menu"
              className="fixed bottom-0 left-0 top-0 z-50 flex w-72 flex-col border-r border-white/10 bg-[#0B100D] p-6"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
            >
              <div className="mb-8 flex items-center justify-between">
                <span className="text-xl font-extrabold">
                  Ladda<span className="text-[#BEF264]">.</span>
                </span>
                <button
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                  className="tag-label rounded-full border border-white/15 px-3 py-1.5"
                >
                  Close
                </button>
              </div>
              <ul className="flex flex-col gap-1">
                {MENU.map((m) => {
                  const active = m.href ? pathname.startsWith(m.href) : false;
                  return (
                    <li key={m.label}>
                      {m.href ? (
                        <Link
                          href={m.href}
                          className={`block rounded-full px-5 py-3 font-medium transition-colors ${
                            active
                              ? "bg-[#BEF264] text-black"
                              : "text-white/80 hover:bg-white/5"
                          }`}
                        >
                          {m.label}
                        </Link>
                      ) : (
                        <span
                          aria-disabled="true"
                          className="flex items-center justify-between rounded-full px-5 py-3 text-white/35"
                        >
                          {m.label} <span className="tag-label">Soon</span>
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}