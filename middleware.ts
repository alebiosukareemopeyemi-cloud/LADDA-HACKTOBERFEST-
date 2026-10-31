import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Where signed-in users land.
const HOME = "/dashboard";

// Flip to true only after Intake is confirmed to save a profile row,
// or everyone gets stuck at /intake.
const ENFORCE_INTAKE = false;

// /design and /dev are throwaway pages; remove them here when you delete them.
const PUBLIC_PREFIXES = ["/auth", "/verify", "/api/demo", "/api/verify", "/design", "/dev"];

function isPublic(path: string) {
  return (
    path === "/" ||
    PUBLIC_PREFIXES.some((p) => path === p || path.startsWith(p + "/"))
  );
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Safety net: a confirmation link that lands on the home page with ?code= goes to the callback.
  if (path === "/" && request.nextUrl.searchParams.has("code")) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/callback";
    return NextResponse.redirect(url);
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(list) {
          list.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          list.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect, but keep any refreshed session cookies.
  const go = (to: string) => {
    const redirect = NextResponse.redirect(new URL(to, request.url));
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  };

  // 5. Signed in and visiting /auth: send home
  if (user && path === "/auth") return go(HOME);

  // 1. Public routes
  if (isPublic(path)) return response;

  // 2. Not signed in: send to /auth
  if (!user) return go("/auth");

  // 3. Email unverified: send to /auth/verify-email
  if (!user.email_confirmed_at) return go("/auth/verify-email");

  // 4. Profile incomplete: send to /intake
  if (ENFORCE_INTAKE && path !== "/intake" && !path.startsWith("/api")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("profile_complete")
      .eq("id", user.id)
      .single();
    if (!profile?.profile_complete) return go("/intake");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};