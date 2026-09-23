import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Not logged in
  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/auth/login";
    return NextResponse.redirect(loginUrl);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("status, is_admin")
    .eq("id", user.id)
    .single();

  // Suspended account
  if (profile?.status === "suspended") {
    const suspendedUrl = request.nextUrl.clone();
    suspendedUrl.pathname = "/auth/suspended";
    return NextResponse.redirect(suspendedUrl);
  }

  // Admin trying to access student dashboard
  if (profile?.is_admin && pathname === "/dashboard") {
    const adminUrl = request.nextUrl.clone();
    adminUrl.pathname = "/admin";
    return NextResponse.redirect(adminUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/subjects/:path*",
    "/notes/:path*",
    "/calendar/:path*",
    "/profile/:path*",
  ],
};