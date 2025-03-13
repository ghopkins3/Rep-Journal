import env from "dotenv";
import { createClient } from "@supabase/supabase-js";
env.config();

export const supabase = createClient(process.env.DATABASE_URL, process.env.DATABASE_SECRET_KEY);