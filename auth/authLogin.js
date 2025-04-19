import { supabase } from "../lib/backendSupabaseClient.js";

export const authLogin = async (email, password) => {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if(error) {
            throw error;
        }
        
        console.log("auth data:", data);
        console.log("auth login route hit.");
        return data;
    } catch(err) {
        console.error("Error signing in auth user:", err.message);
        throw err;
    }
};