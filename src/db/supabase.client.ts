import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;
export const DEFAULT_USER_ID = "60d1da17-760f-484c-84e2-d6364a32f8e7";

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
