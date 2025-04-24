import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client";

export const POST: APIRoute = async ({ request, cookies }) => {
  // Set JSON content type header
  const headers = new Headers({
    "Content-Type": "application/json",
  });

  try {
    if (!request.body) {
      return new Response(
        JSON.stringify({
          error: "Request body is required",
        }),
        {
          status: 400,
          headers,
        }
      );
    }

    const { email, password, confirmPassword } = await request.json();

    // Basic validation
    if (!email || !password || !confirmPassword) {
      return new Response(
        JSON.stringify({
          error: "Email and password are required",
        }),
        {
          status: 400,
          headers,
        }
      );
    }

    // Validate password match
    if (password !== confirmPassword) {
      return new Response(
        JSON.stringify({
          error: "Passwords do not match",
        }),
        {
          status: 400,
          headers,
        }
      );
    }

    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `/generate`,
      },
    });

    if (error) {
      console.error("Supabase registration error:", error);

      // Handle rate limiting errors specifically
      if (error.message.includes("rate limit")) {
        return new Response(
          JSON.stringify({
            error: "Too many registration attempts. Please try again later.",
          }),
          {
            status: 429,
            headers,
          }
        );
      }

      return new Response(
        JSON.stringify({
          error: error.message || "Registration failed",
          details: error.status ? `Status: ${error.status}` : undefined,
        }),
        {
          status: error.status || 400,
          headers,
        }
      );
    }

    if (!data.user) {
      return new Response(
        JSON.stringify({
          error: "Registration failed - no user data returned",
        }),
        {
          status: 400,
          headers,
        }
      );
    }

    return new Response(
      JSON.stringify({
        user: data.user,
      }),
      {
        status: 200,
        headers,
      }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "An unexpected error occurred during registration",
        details: error instanceof Error ? error.stack : undefined,
      }),
      {
        status: 500,
        headers,
      }
    );
  }
};
