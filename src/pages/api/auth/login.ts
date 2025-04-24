import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { email, password } = await request.json();

    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Handle rate limiting errors specifically
      if (error.message.includes("rate limit")) {
        return new Response(
          JSON.stringify({
            error: "Too many login attempts. Please try again later.",
          }),
          {
            status: 429,
          }
        );
      }

      return new Response(
        JSON.stringify({
          error: error.message,
        }),
        {
          status: 400,
        }
      );
    }

    return new Response(
      JSON.stringify({
        user: data.user,
      }),
      {
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred",
      }),
      {
        status: 500,
      }
    );
  }
};
