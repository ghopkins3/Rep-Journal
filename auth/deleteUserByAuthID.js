import { supabase } from "../lib/supabaseClient.js";

export const deleteUserByAuthID = async (authID) => {
    if(!authID) {
        throw new Error("Auth ID is required to delete a user.");
    }

    try {
        const { data, error } = await supabase
            .from("user")
            .delete()
            .eq("auth_id", authID);
        
        if(error) {
            throw error;
        }

        return data;
    } catch(err) {
        console.error("Error deleting user:", err);
        throw err;
    }
}