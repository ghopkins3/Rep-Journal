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

        return data;
    } catch(err) {
        console.error("Error creating auth user:", err.message);
        throw err;
    }
};