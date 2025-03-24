import { supabase } from "../lib/backendSupabaseClient.js";

export const getSession = async (req, res) => {
    try {
        const { data, error } = await supabase.auth.getSession();

        if(error) {
            throw error;
        }

        if(!data || !data.session) {
            return res.status(401).send("No active session found.");
        }

        return res.status(200).send({ user: data.session.user });

    } catch(error) {
        res.status(500).send("Error signing out user:", error.message);
        throw error;
    }
};