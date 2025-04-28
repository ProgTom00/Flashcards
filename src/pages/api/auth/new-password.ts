import type { APIRoute } from "astro";
import { createSupabaseServer } from "@/db/supabase.client";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { password } = await request.json();

    if (!password) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "New password is required",
        }),
        { status: 400 }
      );
    }

    const supabase = createSupabaseServer({ cookies, headers: request.headers });

    // Get the current session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Auth session missing!",
        }),
        { status: 401 }
      );
    }

    const { error } = await supabase.auth.updateUser({
      password: password,
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

    // Sign out after password change
    await supabase.auth.signOut();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Password has been updated successfully",
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Update password error:", err);
    return new Response(
      JSON.stringify({
        success: false,
        message: "An unexpected error occurred",
      }),
      { status: 500 }
    );
  }
};
