import { updateUserByAuthID } from "./updateUserByAuthID.js";

export const putUser = async (req, res) => {
    let { username } = req.body;
    let authID = req.user.auth_id;
    try {
        await updateUserByAuthID(authID, { username });    
        res.status(200).send("Successfully updated user");
    } catch(error) {
        res.status(400).send("Failed to update user");
    }
};