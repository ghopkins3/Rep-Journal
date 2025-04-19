import { getUserByAuthID } from "./getUserByAuthID.js";
import { supabase } from "../lib/backendSupabaseClient.js";

export const supabaseAuthMiddleware = async (req, res, next) => {
    let authHeader = req.headers.authorization;

    if(!authHeader) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    let { data, error } = await supabase.auth.getUser(token);

    if(error) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    let authID = data.user.id;

    console.log("auth id:", authID);

    let user = await getUserByAuthID(authID);

    console.log("user:", user);

    req.user = user;
    
    console.log("req user:", req.user);
    return next();
};