import { createClient } from "https://esm.sh/@supabase/supabase-js";

const SUPABASE_URL = "https://telbbmbnfwazsageyezo.supabase.co";
const SUPABASE_PUBLIC_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlbGJibWJuZndhenNhZ2V5ZXpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc1NzgxODIsImV4cCI6MjA1MzE1NDE4Mn0.swJF_dpQypl9PRZvblapLrn3y99uja2_Mr3_UzmUzuc";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);