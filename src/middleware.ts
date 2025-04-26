import { defineMiddleware } from "astro:middleware";
import { createSupabaseServer } from "./db/supabase.client";

// Public paths that don't require authentication
const PUBLIC_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/reset-password",
  "/auth/new-password",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/reset-password",
  "/api/auth/new-password",
];

export const onRequest = defineMiddleware(async ({ locals, cookies, url, request, redirect }, next) => {
  // Skip authorization check for public paths
  if (PUBLIC_PATHS.includes(url.pathname)) {
    return next();
  }

  const supabase = createSupabaseServer({ cookies, headers: request.headers });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Add user information to locals
  locals.user = user
    ? {
        id: user.id,
        email: user.email,
      }
    : null;

  // Redirect to login if not authenticated and trying to access protected route
  if (!user && !PUBLIC_PATHS.includes(url.pathname)) {
    return redirect("/auth/login");
  }

  return next();
});
