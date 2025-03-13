import { supabase } from "../lib/supabaseClient.js";

export const deleteAuthUser = async (userID) => {
    if(!userID) {
        throw new Error("User ID is required to delete an auth user.");
    }

    try {
        const { error } = await supabase.auth.admin.deleteUser(userID);

        if(error) {
            throw error;
        }

        return { message: "User successfully deleted." };
    } catch(err) {
        console.error("Error deleting user:", err);
        throw err;
    }
}