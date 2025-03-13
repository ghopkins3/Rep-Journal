import { supabase } from "../lib/supabaseClient.js";

export const getUserByAuthID = async (authID) => {
    if(!authID) {
        throw new Error("Auth ID is required to fetch user");
    }

    try {
        const { data, error } = await supabase
            .from("user")
            .select("*")
            .eq("auth_id", authID)
            .single();
        if(error) {
            throw error;
        }

        return data;
    } catch(err) {
        console.error("Error fetching user by auth ID:", err);
        throw err;
    }
};