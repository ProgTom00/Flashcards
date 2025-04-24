import type { AstroCookies } from "astro";
import { createBrowserClient, createServerClient, type CookieOptionsWithName } from "@supabase/ssr";
import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;
export const DEFAULT_USER_ID = "60d1da17-760f-484c-84e2-d6364a32f8e7";

export const cookieOptions: CookieOptionsWithName = {
  path: "/",
  secure: true,
  httpOnly: true,
  sameSite: "lax",
};

function parseCookieHeader(cookieHeader: string): { name: string; value: string }[] {
  return cookieHeader.split(";").map((cookie) => {
    const [name, ...rest] = cookie.trim().split("=");
    return { name, value: rest.join("=") };
  });
}

export const createSupabaseServerInstance = (context: { headers: Headers; cookies: AstroCookies }) => {
  const supabase = createServerClient<Database>(import.meta.env.SUPABASE_URL, import.meta.env.SUPABASE_KEY, {
    cookieOptions,
    cookies: {
      // @ts-expect-error - correct implementation per Supabase docs
      getAll() {
        const cookieHeader = context.headers.get("Cookie") ?? "";
        return parseCookieHeader(cookieHeader);
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => context.cookies.set(name, value, options));
      },
    },
  });

  return supabase;
};

// For client-side usage only
export const supabaseClient = createBrowserClient<Database>(
  import.meta.env.SUPABASE_URL,
  import.meta.env.SUPABASE_KEY,
  {
    cookieOptions,
    cookies: {
      get(key) {
        const cookie = document.cookie.split("; ").find((row) => row.startsWith(`${key}=`));
        return cookie ? cookie.split("=")[1] : "";
      },
      set(key, value, options) {
        document.cookie = `${key}=${value}${
          options?.path ? `; path=${options.path}` : ""
        }${options?.sameSite ? `; samesite=${options.sameSite}` : ""}${
          options?.secure ? "; secure" : ""
        }${options?.httpOnly ? "; httponly" : ""}`;
      },
      remove(key, options) {
        document.cookie = `${key}=; max-age=0${options?.path ? `; path=${options.path}` : ""}`;
      },
    },
  }
);
