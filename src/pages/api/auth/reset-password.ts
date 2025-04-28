import type { APIRoute } from "astro";
import { createSupabaseServer } from "@/db/supabase.client";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { email } = await request.json();

    if (!email) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Email is required",
        }),
        { status: 400 }
      );
    }

    const supabase = createSupabaseServer({ cookies, headers: request.headers });

    // Get the current URL and replace the path
    const url = new URL(request.url);
    const redirectTo = `${url.protocol}//${url.host}/auth/new-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      return new Response(
        JSON.stringify({
          success: false,
          message: error.message,
        }),
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Password reset instructions have been sent to your email",
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Reset password error:", err);
    return new Response(
      JSON.stringify({
        success: false,
        message: "An unexpected error occurred",
      }),
      { status: 500 }
    );
  }
};
