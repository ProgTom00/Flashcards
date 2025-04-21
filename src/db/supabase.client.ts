import { createClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;
export const DEFAULT_USER_ID = "60d1da17-760f-484c-84e2-d6364a32f8e7";

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
