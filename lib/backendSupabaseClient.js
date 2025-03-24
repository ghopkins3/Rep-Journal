import env from "dotenv";
import { createClient } from "@supabase/supabase-js";
env.config();

export const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLIC_KEY);