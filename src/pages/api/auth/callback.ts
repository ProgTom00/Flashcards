import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../db/supabase.client";

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return redirect("/generate");
    }
  }

  // If there's no code or there was an error, redirect to login
  return redirect("/auth/login");
};
