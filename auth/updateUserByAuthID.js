import { supabase } from "../lib/supabaseClient.js";

export const updateUserByAuthID = async (authID, updateData) => {
    if(!authID || !updateData) {
        throw new Error("Missing authID or updateData for updating user");
    }

    try {
        const { data, error } = await supabase
            .from("user")
            .update(updateData)
            .eq("auth_id", authID);

        if(error) {
            throw error;
        }

        return data;
    } catch(err) {
        console.error("Error updating user:", err);
        throw err;
    }
};