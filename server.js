import express from "express";
import env from "dotenv";

import {createClient} from "@supabase/supabase-js";

env.config();

const supabase = createClient(process.env.DATABSE_URL, process.env.DATABASE_SECRET_KEY);

const app = express();

app.get("/test", async (req, res) => {
    try {
        const {data, error} = await supabase.from("test").select();
        console.log(data);
        return res.send(data);
    } catch (error) {
        return res.send({error});
    }
});

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.get("*", (req, res) => {
    res.send("TEST");
});

app.listen(3000, () => {
    console.log(
        new Date().toLocaleTimeString() + `: Server is running on port 3000...`
    )
})