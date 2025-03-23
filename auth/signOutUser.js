import { supabase } from "../lib/supabaseClient.js";

export const signOutUser = async (req, res) => {
    try {
        const { error } = await supabase.auth.signOut();

        if(error) {
            throw error;
        }

        res.status(200).send("Successfully signed out user.");

    } catch(error) {
        res.status(500).send("Error signing out user:", error.message);
        throw error;
    }
};