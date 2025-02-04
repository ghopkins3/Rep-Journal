import express from "express";
import env from "dotenv";
import {createClient} from "@supabase/supabase-js";
env.config();
const supabase = createClient(process.env.DATABSE_URL, process.env.DATABASE_SECRET_KEY);
const app = express();
let PORT = process.env.PORT;

app.get("/test", async (req, res) => {
    try {
        let {data, error} = await supabase.from("test").select();
        console.log(data);
        return res.send(data);
    } catch (error) {
        return res.send({error});
    }
});

app.get("/test/:date", async (req, res) => {
    try {
        const {data, error} = await supabase
            .from("test")
            .select()
            .eq("date", req.params.date);
        console.log(data);
        return res.send(data);
    } catch (error) {
        return res.send({error});
    }
});

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.listen(PORT, () => {
    console.log(
        new Date().toLocaleTimeString() + `: Server is running on port ${PORT}...`
    )
})