import express from "express";
import env from "dotenv";
import {createClient, RealtimeChannel} from "@supabase/supabase-js";
env.config();
const supabase = createClient(process.env.DATABSE_URL, process.env.DATABASE_SECRET_KEY);
const app = express();
let PORT = process.env.PORT;
app.use(express.json());

app.get("/test", async (req, res) => {
    try {
        let {data, error} = await supabase.from("test").select();
        console.log(data);
        return res.send(data);
    } catch (error) {
        return res.send({error});
    }
});

app.get("/test/date=:date", async (req, res) => {
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

app.get("/test/id=:id", async (req, res) => {
    try {
        const {data, error} = await supabase
            .from("test")
            .select()
            .eq("test_id", req.params.id);
        console.log(data);
        return res.send(data);
    } catch (error) {
        return res.send({error});
    }
});

app.post("/test", async (req, res) => {
    const { error } = await supabase
        .from("test")
        .insert({
            test: req.body.test,
            date: req.body.date,
            test_id: req.body.test_id
        });

    if (error) {
        return res.status(400).json({ error: error.message });
    }
    res.status(201).send("created!!");
}); 

app.delete("/test/date=:date", async (req, res) => {
    const {error} = await supabase
        .from("test")
        .delete()
        .eq("date", req.params.date)
    if(error) {
        return res.status(400).json({error: error.message});
    }
    res.status(201).send("deleted items created on date: " + req.params.date);
});

app.delete("/test/id=:id", async (req, res) => {
    const {error} = await supabase
        .from("test")
        .delete()
        .eq("test_id", req.params.id)
    if(error) {
        return res.status(400).json({error: error.message});
    }
    res.status(201).send("deleted item with id: " + req.params.id);
});

app.put("/test/id=:id", async (req, res) => {
    const {error} = await supabase
        .from("test")
        .update({
            test: req.body.test
        })
        .eq("test_id", req.params.id)
    if(error) {
        return res.status(400).json({error: error.message});
    }
    res.status(201).send("updated item with id: " + req.params.id);
});

app.get("/", (req, res) => {
    res.send("Hello Worldington!");
});

app.listen(PORT, () => {
    console.log(
        new Date().toLocaleTimeString() + `: Server is running on port ${PORT}...`
    )
})