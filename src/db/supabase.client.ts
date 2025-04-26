import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;
export const DEFAULT_USER_ID = "4ec4f564-fa47-4d77-9040-dac6c64b3fff";

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
