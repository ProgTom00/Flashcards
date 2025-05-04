import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { Database } from "./database.types";
import { SUPABASE_URL, SUPABASE_PUBLIC_KEY } from "astro:env/server";

if (!SUPABASE_URL || !SUPABASE_PUBLIC_KEY) {
  throw new Error("Missing required Supabase environment variables. Check your .env file.");
}

export const cookieOptions: CookieOptions = {
  path: "/",
  sameSite: "lax",
  secure: true,
  httpOnly: true,
};

function parseCookieHeader(cookieHeader: string): { name: string; value: string }[] {
  return cookieHeader.split(";").map((cookie) => {
    const [name, ...rest] = cookie.trim().split("=");
    return { name, value: rest.join("=") };
  });
}

interface CookieStore {
  set(name: string, value: string, options?: CookieOptions): void;
}

export const createSupabaseServer = ({ cookies, headers }: { cookies: CookieStore; headers: Headers }) => {
  return createServerClient<Database>(SUPABASE_URL, SUPABASE_PUBLIC_KEY, {
    cookies: {
      getAll() {
        return parseCookieHeader(headers.get("Cookie") ?? "");
      },
      setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value, options }) => cookies.set(name, value, { ...cookieOptions, ...options }));
      },
    },
  });
};
