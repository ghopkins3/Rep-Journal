import { supabase } from "../lib/backendSupabaseClient.js";

export const authLogin = async (email, password) => {

    try {
        if(!email.includes("@")) {
            const { data, error } = await supabase
                .from("user")
                .select("email")
                .eq("username", email);
    
            if(error) return res.status(400).json({ error: "Username not found" });

            email = data[0].email;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if(error) {
            console.log("errors?");
            throw error;
        }
        
        console.log("auth data:", data);
        console.log("auth login route hit.");
        return data;
    } catch(error) {
        return res.status(500).json({ error: "Internal server error" });
    }
};