import express from "express";
import cors from "cors";
import env from "dotenv";
import {createClient} from "@supabase/supabase-js";
env.config();
const supabase = createClient(process.env.DATABSE_URL, process.env.DATABASE_SECRET_KEY);
const app = express();
let PORT = process.env.PORT;
app.use(express.json());
app.use(cors());

app.get("/exercise", async (req, res) => {
    try {
        let {data, error} = await supabase.from("exercise").select();
        console.log(data);
        return res.send(data);
    } catch (error) {
        return res.send({error});
    }
});

app.get("/exercise/id=:id", async (req, res) => {
    try {
        const {data, error} = await supabase
            .from("exercise")
            .select()
            .eq("exercise_id", req.params.id);
        console.log(data);
        return res.send(data);
    } catch (error) {
        return res.send({error});
    }
});

app.post("/exercise", async (req, res) => {
    const { error } = await supabase
        .from("exercise")
        .insert({
            exercise_name: req.body.exercise_name,
        });

    if (error) {
        return res.status(400).json({ error: error.message });
    }
    res.status(201).send("created!! exercise");
}); 

app.put("/exercise/id=:id", async (req, res) => {
    const {error} = await supabase
        .from("exercise")
        .update({
            exercise_name: req.body.exercise_name
        })
        .eq("exercise_id", req.params.id)
    if(error) {
        return res.status(400).json({error: error.message});
    }
    res.status(201).send("updated exercise name of exercise with id: " + req.params.id);
});

app.delete("/exercise/id=:id", async (req, res) => {
    const {error} = await supabase
        .from("exercise")
        .delete()
        .eq("exercise_id", req.params.id)
    if(error) {
        return res.status(400).json({error: error.message});
    }
    res.status(201).send("deleted exercise with id: " + req.params.id);
});

app.get("/exercise-set", async (req, res) => {
    try {
        let {data, error} = await supabase.from("exercise_set").select();
        console.log(data);
        return res.send(data);
    } catch (error) {
        return res.send({error});
    }
});

app.post("/exercise-set", async (req, res) => {
    const { error } = await supabase
        .from("exercise_set")
        .insert({
            exercise_id: req.body.exercise_id,
            amount_of_sets: req.body.sets,
            repetitions: req.body.repetitions,
            weight: req.body.weight,
        });

    if (error) {
        return res.status(400).json({ error: error.message });
    }
    res.status(201).send("created!! exercise-set");
});

app.put("/exercise-set/id=:id", async (req, res) => {
    const {error} = await supabase
        .from("exercise_set")
        .update({
            amount_of_sets: req.body.sets,
            repetitions: req.body.repetitions,
            weight: req.body.weight,
        })
        .eq("exercise_set_id", req.params.id)
    if(error) {
        return res.status(400).json({error: error.message});
    }
    res.status(201).send("updated exercise set of exercise set with id: " + req.params.id);
});

app.delete("/exercise-set/id=:id", async (req, res) => {
    const {error} = await supabase
        .from("exercise_set")
        .delete()
        .eq("exercise_set_id", req.params.id)
    if(error) {
        return res.status(400).json({error: error.message});
    }
    res.status(201).send("deleted exercise set with id: " + req.params.id);
});

app.get("/workout", async (req, res) => {
    try {
        let {data, error} = await supabase.from("workout").select();
        console.log(data);
        return res.send(data);
    } catch (error) {
        return res.send({error});
    }
});

app.post("/workout", async (req, res) => {
    const { error } = await supabase
        .from("workout")
        .insert({
            date: req.body.date,
        });

    if (error) {
        return res.status(400).json({ error: error.message });
    }
    res.status(201).send("created!! workout");
});

app.put("/workout/id=:id", async (req, res) => {
    const {error} = await supabase
        .from("workout")
        .update({
            date: req.body.date
        })
        .eq("workout_id", req.params.id)
    if(error) {
        return res.status(400).json({error: error.message});
    }
    res.status(201).send("updated date of workout with id: " + req.params.id);
});

app.delete("/workout/id=:id", async (req, res) => {
    const {error} = await supabase
        .from("workout")
        .delete()
        .eq("workout_id", req.params.id)
    if(error) {
        return res.status(400).json({error: error.message});
    }
    res.status(201).send("deleted workout with id: " + req.params.id);
});

app.get("/workout-exercise", async (req, res) => {
    try {
        let {data, error} = await supabase.from("workout_exercise").select();
        console.log(data);
        return res.send(data);
    } catch (error) {
        return res.send({error});
    }
});

app.post("/workout-exercise", async (req, res) => {
    const { error } = await supabase
        .from("workout_exercise")
        .insert({
            workout_id: req.body.workout_id,
            exercise_id: req.body.exercise_id,
        });

    if (error) {
        return res.status(400).json({ error: error.message });
    }
    res.status(201).send("created!! workout-exercises");
});

app.put("/workout-exercise/id=:id", async (req, res) => {
    const {error} = await supabase
        .from("workout_exercise")
        .update({
            workout_id: req.body.workout_id,
            exercise_id: req.body.exercise_id
        })
        .eq("workout_exercises_id", req.params.id)
    if(error) {
        return res.status(400).json({error: error.message});
    }
    res.status(201).send("updated workout exercise junction with id: " + req.params.id);
});

app.delete("/workout-exercise/id=:id", async (req, res) => {
    const {error} = await supabase
        .from("workout_exercise")
        .delete()
        .eq("workout_exercises_id", req.params.id)
    if(error) {
        return res.status(400).json({error: error.message});
    }
    res.status(201).send("deleted workout exercises junction with id: " + req.params.id);
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