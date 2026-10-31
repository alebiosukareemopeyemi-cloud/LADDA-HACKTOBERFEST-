import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Change to "/dashboard" once the dashboard exists.
const HOME = "/roadmap";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${HOME}`);
  }

  return NextResponse.redirect(`${origin}/auth?error=link`);
}