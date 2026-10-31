import { NextResponse } from "next/server";
import { createClient as createAdmin } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { BuildRoadmapRequestSchema } from "@/lib/contract";
import { knowableSkills } from "@/lib/intake/planner";

function fail(status: number, code: "UNAUTHENTICATED" | "VALIDATION", message: string) {
  return NextResponse.json({ ok: false, code, message }, { status });
}

export async function POST(req: Request) {
  // 1. Who is this? Always from the session cookie, never from the request body.
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return fail(401, "UNAUTHENTICATED", "Please sign in again.");

  // 2. Validate the answers with the shared contract.
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail(400, "VALIDATION", "Bad request.");
  }
  const parsed = BuildRoadmapRequestSchema.safeParse(body);
  if (!parsed.success) return fail(400, "VALIDATION", "Some answers are missing or invalid.");
  const input = parsed.data;

  // 3. Service-role client (server only) so we can write the protected fields.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return fail(500, "VALIDATION", "Server is missing its Supabase service key.");
  }
  const admin = createAdmin(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Only early skills can ever be Known (capstone and proof never).
  const allowed = new Set(knowableSkills().map((s) => s.id));
  const known = Array.from(new Set(input.knownSkillIds)).filter((id) => allowed.has(id));

  // 4. Save the profile answers and mark Intake complete.
  const { error: profileError } = await admin
    .from("profiles")
    .update({
      stage: input.stage,
      target_role_id: input.targetRoleId,
      hours_per_week: input.hoursPerWeek,
      horizon_weeks: input.horizonWeeks,
      profile_complete: true,
    })
    .eq("id", user.id);
  if (profileError) return fail(500, "VALIDATION", "Could not save your answers.");

  // 5. Save Known skills without touching anything already verified or in progress.
  const { data: existing, error: readError } = await admin
    .from("user_nodes")
    .select("skill_id,status,source")
    .eq("user_id", user.id);
  if (readError) return fail(500, "VALIDATION", "Could not read your skills.");

  const rows = existing ?? [];
  const protectedIds = new Set(
    rows
      .filter((r) => r.status === "verified" || r.status === "in_progress")
      .map((r) => r.skill_id as string)
  );
  const stale = rows
    .filter((r) => r.status === "known" && r.source === "manual" && !known.includes(r.skill_id))
    .map((r) => r.skill_id as string);

  if (stale.length > 0) {
    const { error } = await admin
      .from("user_nodes")
      .delete()
      .eq("user_id", user.id)
      .in("skill_id", stale);
    if (error) return fail(500, "VALIDATION", "Could not update your skills.");
  }

  const toWrite = known
    .filter((id) => !protectedIds.has(id))
    .map((id) => ({
      user_id: user.id,
      skill_id: id,
      status: "known",
      source: "manual",
      updated_at: new Date().toISOString(),
    }));

  if (toWrite.length > 0) {
    const { error } = await admin
      .from("user_nodes")
      .upsert(toWrite, { onConflict: "user_id,skill_id" });
    if (error) return fail(500, "VALIDATION", "Could not save your skills.");
  }

  return NextResponse.json({ ok: true, data: { done: true } });
}