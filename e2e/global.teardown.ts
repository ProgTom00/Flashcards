import { test as teardown } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/db/database.types";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_PUBLIC_KEY;
const TEST_USER_ID = process.env.E2E_USERNAME_ID as string;
const E2E_USERNAME = process.env.E2E_USERNAME;
const E2E_PASSWORD = process.env.E2E_PASSWORD;

if (!supabaseUrl || !supabaseKey || !E2E_USERNAME || !E2E_PASSWORD) {
  throw new Error("Missing required environment variables");
}

teardown("cleanup database", async () => {
  const supabase = createClient<Database>(supabaseUrl, supabaseKey);
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: E2E_USERNAME,
    password: E2E_PASSWORD,
  });

  if (signInError) {
    console.error("Error signing in:", signInError);
    throw signInError;
  }
  console.log("Starting database cleanup for test user...");

  try {
    // Delete records in correct order using raw SQL
    const { error } = await supabase.from("flashcards").delete().eq("user_id", TEST_USER_ID);

    if (error) {
      console.error("Error deleting flashcards:", error);
      throw error;
    }

    const { error: genError } = await supabase.from("generations").delete().eq("user_id", TEST_USER_ID);

    if (genError) {
      console.error("Error deleting generations:", genError);
      throw genError;
    }

    const { error: logError } = await supabase.from("generation_logs").delete().eq("user_id", TEST_USER_ID);

    if (logError) {
      console.error("Error deleting logs:", logError);
      throw logError;
    }

    console.log("Database cleanup completed successfully for test user");
  } catch (error) {
    console.error("Error during database cleanup:", error);
    throw error;
  }
});
