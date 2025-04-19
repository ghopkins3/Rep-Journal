import { authLogin } from "./authLogin.js";

export const postLogin = async (req, res) => {
    let { email, password } = req.body;
    try {
        let data = await authLogin(email, password);
        res.status(200).send(data);
        console.log(data);
        console.log("Login route hit.");
    } catch(error) {
        res.status(400).send("Failed to login");
    }
};