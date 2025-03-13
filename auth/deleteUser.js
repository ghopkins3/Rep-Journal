import { deleteUserByAuthID } from "./deleteUserByAuthID.js";
import { deleteAuthUser } from "./deleteAuthUser.js";

export const deleteUser = async (req, res) => {
    let authID = req.user.auth_id;

    try {
        await deleteUserByAuthID(authID);
        await deleteAuthUser(authID);
        res.status(200).send("Successfully deleted user");
    } catch(error) {
        res.status(400).send("Failed to delete user");
    }
};