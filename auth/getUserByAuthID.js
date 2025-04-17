import { supabase } from "../lib/backendSupabaseClient.js";

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

        console.log("Getting user by auth id.");
        return data;
    } catch(err) {
        console.error("Error fetching user by auth ID:", err);
        throw err;
    }
};