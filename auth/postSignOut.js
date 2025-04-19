import { supabase } from "../lib/backendSupabaseClient.js";

export const postSignOut = async (req, res) => {
    try {
        const { error } = await supabase.auth.signOut();

        if(error) {
            throw error;
        }

        console.log("sign out route hit.");
        res.status(200).send("Successfully signed out user.");

    } catch(error) {
        res.status(500).send("Error signing out user:", error.message);
    }
};