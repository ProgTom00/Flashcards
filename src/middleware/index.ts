import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerInstance } from "../db/supabase.client";

// Public paths that don't require authentication
const PUBLIC_PATHS = ["/auth/login", "/auth/register", "/auth/reset-password"];

export const onRequest = defineMiddleware(async ({ url, redirect, cookies, request }, next) => {
  // Skip auth check for public paths
  if (PUBLIC_PATHS.includes(url.pathname)) {
    return next();
  }

  const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    // Clear any invalid session cookies
    cookies.delete("sb-access-token");
    cookies.delete("sb-refresh-token");

    // Redirect to login for protected routes
    return redirect("/auth/login");
  }

  // Add user data to locals for use in routes
  locals.user = {
    id: user.id,
    email: user.email,
    emailVerified: user.email_confirmed_at !== null,
  };

  return next();
});
