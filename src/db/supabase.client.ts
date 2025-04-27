import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { Database } from "./database.types";

const isTestEnvironment = process.env.NODE_ENV === "test";

const supabaseUrl = isTestEnvironment ? import.meta.env.NEXT_PUBLIC_SUPABASE_URL : import.meta.env.SUPABASE_URL;

const supabaseAnonKey = isTestEnvironment
  ? import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  : import.meta.env.SUPABASE_KEY;

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

export const createSupabaseServer = ({ cookies, headers }: { cookies: any; headers: Headers }) => {
  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
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
