import { createClient } from "https://esm.sh/@supabase/supabase-js";

const SUPABASE_URL = "https://xvqdmhhzhtqkswvpyiym.supabase.co";
const SUPABASE_PUBLIC_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2cWRtaGh6aHRxa3N3dnB5aXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2MjM3NDQsImV4cCI6MjA1NzE5OTc0NH0.m_wg-qgU2af3Vcs0DFsDcQZUSVXh2GUHOb1vGcdEe0g";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);