import type { APIRoute } from "astro";
import { createSupabaseServer } from "@/db/supabase.client";

export const POST: APIRoute = async ({ request, cookies }) => {
  // Check if auth feature is enabled

  try {
    const supabase = createSupabaseServer({ cookies, headers: request.headers });
    const { error } = await supabase.auth.signOut();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
    });
  } catch (err) {
    console.error("Logout error:", err);
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), {
      status: 500,
    });
  }
};
