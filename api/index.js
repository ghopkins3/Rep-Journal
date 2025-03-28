import express from "express";
import cors  from "cors";
import { supabase } from "../lib/backendSupabaseClient.js";
import { convertToDatabaseFormat } from "../utils/formatUtils.js";
import { postSignUp } from "../auth/postSignUp.js";
import { postLogin } from "../auth/postLogin.js";
import { supabaseAuthMiddleware } from "../auth/supabaseAuthMiddleware.js";
import { getUser } from "../auth/getUser.js";
import { putUser } from "../auth/putUser.js";
import { deleteUser } from "../auth/deleteUser.js";

const app = express();
let PORT = process.env.PORT;
app.use(express.json());
app.use(cors());

app.use("/", (req, res) => {
    res.send("Express on Vercel.");
})

app.listen(PORT, () => {
    console.log(new Date().toLocaleTimeString() + `: Server is running on port ${PORT}...`)
});

export default app;