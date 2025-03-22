import { supabase } from "../lib/supabaseClient";

export const signOutUser = async (req, res) => {
    try {
        await supabase.auth.signOut();
        res.status(200).send("Successfully signed user out.");
    } catch(error) {
        res.status(500).send("Error signing out user.");
    }
}