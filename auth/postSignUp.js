import { createAuthUser } from "./createAuthUser.js";
import { createDbUser } from "./createDbUser.js";
import { supabase } from "../lib/backendSupabaseClient.js";

export const postSignUp = async (req, res) => {
    let {email, password, username} = req.body;

    username = username.trim();
    email = email.trim();

    const { count: usernameCount, error: usernameError } = await supabase
        .from("user")
        .select("username", { count: "exact", head: true })
        .ilike("username", username);
    console.log("data:", usernameCount);
    console.log("username:", username);


    const { count: emailCount, error: emailError } = await supabase
        .from("user")
        .select("username", { count: "exact", head: true })
        .ilike("username", email);
    console.log("data:", emailCount);
    console.log("username:", email);

    if(usernameError) {
        res.status(500).send(error.message, "Username already exists.");
    }

    if(emailError) {
        res.status(500).send(error.message, "Email address already exists.")
    }

    // if(usernameCount === 1) {
    //     res.status(409).send({ error: "Username already taken." });
    // } else {
    //     try {
    //         let authID = await createAuthUser(email, password);
    
    //         await createDbUser({ auth_id: authID, username, email })
    
    //         res.status(200).send("Successfully signed user up");
    //     } catch(error) {
    //         res.status(400).send("Failed to sign user up");
    //     }
    // }
};