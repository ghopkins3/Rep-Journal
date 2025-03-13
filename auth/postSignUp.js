import { createAuthUser } from "./createAuthUser.js";
import { createDbUser } from "./createDbUser.js";

export const postSignUp = async (req, res) => {
    let {email, password, username} = req.body;

    try {
        let authID = await createAuthUser(email, password);

        await createDbUser({ auth_id: authID, username, email })

        res.status(200).send("Successfully signed user up");
    } catch(error) {
        res.status(400).send("Failed to sign user up");
    }
};