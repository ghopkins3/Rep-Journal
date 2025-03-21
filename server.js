import express from "express";
import cors from "cors";
import { supabase } from "./lib/supabaseClient.js";
import { convertToDatabaseFormat } from "./utils/formatUtils.js";
import { postSignUp } from "./auth/postSignUp.js";
import { postLogin } from "./auth/postLogin.js";
import { supabaseAuthMiddleware } from "./auth/supabaseAuthMiddleware.js";
import { getUser } from "./auth/getUser.js";
import { putUser } from "./auth/putUser.js";
import { deleteUser } from "./auth/deleteUser.js";

const app = express();
let PORT = process.env.PORT;
app.use(express.json());
app.use(cors());

app.get("/exercise/id=:id", supabaseAuthMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("exercise")
            .select()
            .eq("exercise_id", req.params.id)
            .eq("user_id", req.user.id);
        console.log(data);
        return res.send(data);
    } catch (error) {
        return res.send({error});
    }
});

app.get("/exercise/name=:name", supabaseAuthMiddleware,  async (req, res) => {
    let exerciseName = req.params.name.toLowerCase();
    try {
        const { data, error } = await supabase
            .from("exercise")
            .select()
            .eq("exercise_name", exerciseName)
            .eq("user_id", req.user.id);
        console.log(data);
        return res.send(data);
    } catch (error) {
        return res.send({error});
    }
});

app.get("/exercise", supabaseAuthMiddleware, async (req, res) => {
    try {
        const { data, error }  = await supabase
            .from("exercise")
            .select()
            .eq("user_id", req.user.auth_id);
        console.log(data);
        return res.status(200).send(data);
    } catch (error) {
        return res.status(500).send({ error });
    }
});

app.post("/exercise", supabaseAuthMiddleware, async (req, res) => {
    let exerciseName = convertToDatabaseFormat(req.body.exercise_name);
    const { data, error } = await supabase
        .from("exercise")
        .insert({
            exercise_name: exerciseName,
            user_id: req.body.user_id,
        })
        .select("exercise_id");

    if (error) {
        return res.status(400).json({ error: error.message });
    }
    res.status(201).json({
        message: "Exercise created successfully",
        exercise_id: data[0].exercise_id,
    });
}); 

app.put("/exercise/id=:id", supabaseAuthMiddleware, async (req, res) => {
    const { error }  = await supabase
        .from("exercise")
        .update({
            exercise_name: req.body.exercise_name
        })
        .eq("exercise_id", req.params.id);
    if(error) {
        return res.status(400).json({error: error.message});
    }
    res.status(201).send("updated exercise name of exercise with id: " + req.params.id);
});

app.delete("/exercise/id=:id", supabaseAuthMiddleware, async (req, res) => {
    const { error } = await supabase
        .from("exercise")
        .delete()
        .eq("exercise_id", req.params.id);
    if(error) {
        return res.status(400).json({error: error.message});
    }
    res.status(201).send("deleted exercise with id: " + req.params.id);
});

app.get("/exercise-set", async (req, res) => {
    try {
        let { data, error } = await supabase.from("exercise_set").select();
        console.log(data);
        return res.send(data);
    } catch (error) {
        return res.send({error});
    }
});

app.post("/exercise-set", supabaseAuthMiddleware, async (req, res) => {
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

app.put("/exercise-set/id=:id", supabaseAuthMiddleware, async (req, res) => {
    const { error } = await supabase
        .from("exercise_set")
        .update({
            amount_of_sets: req.body.sets,
            repetitions: req.body.repetitions,
            weight: req.body.weight,
        })
        .eq("exercise_id", req.params.id);
    if(error) {
        return res.status(400).json({error: error.message});
    }
    res.status(201).send("updated exercise set of exercise_set with id: " + req.params.id);
});

app.delete("/exercise-set/id=:id", supabaseAuthMiddleware, async (req, res) => {
    const { error } = await supabase
        .from("exercise_set")
        .delete()
        .eq("exercise_id", req.params.id);
    if(error) {
        return res.status(400).json({error: error.message});
    }
    res.status(201).send("deleted exercise set with id: " + req.params.id);
});

app.get("/workout", supabaseAuthMiddleware, async (req, res) => {
    console.log("user:", req.user);
    try {
        let { data, error } = await supabase
        .from("workout")
        .select()
        .eq("user_id", req.user.auth_id);
        console.log(data);
        return res.send(data);
    } catch (error) {
        return res.send({ error });
    }
});

app.get("/workout/date=:date", supabaseAuthMiddleware, async (req, res) => {
    console.log("User", req.user);
    try {
        const { data, error } = await supabase
            .from("workout")
            .select("workout_id")
            .eq("date", req.params.date)
            .eq("user_id", req.user.auth_id)
            .limit(1);
        console.log("data:", data);
        console.log("auth:", req.user.auth_id);
        return res.send(data);
    } catch (error) {
        return res.send({error});
    }
});

app.post("/workout", supabaseAuthMiddleware, async (req, res) => {
    const { data, error } = await supabase
        .from("workout")
        .insert({
            date: req.body.date,
            user_id: req.body.user_id,
        })
        .select("workout_id");

    if (error) {
        return res.status(400).json({ error: error.message });
    }
    res.status(201).json({
        message: "workout posted successfully",
        workout_id: data[0].workout_id,
    });
});

app.put("/workout/id=:id", supabaseAuthMiddleware, async (req, res) => {
    const { error } = await supabase
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

app.delete("/workout/date=:date", supabaseAuthMiddleware, async (req, res) => {
    const { error } = await supabase
        .from("workout")
        .delete()
        .eq("date", req.params.date)
    if(error) {
        return res.status(400).json({error: error.message});
    }
    res.status(201).send("deleted workout on date: " + req.params.date);
});

app.get("/workout-exercise", supabaseAuthMiddleware, async (req, res) => {
    try {
        let { data, error } = await supabase
        .from("workout_exercise")
        .select()
        .eq("user_id", req.user.auth_id);
        console.log(data);
        return res.send(data);
    } catch (error) {
        return res.send({error});
    }
});

app.get("/workout-exercise/workout-id=:id", supabaseAuthMiddleware, async (req, res) => {
    console.log(req.user);
    try {
        // select exercise id and exercise name from exercise equal to workout id
        const { data: workoutExercises, error: exerciseError } = await supabase
            .from("workout_exercise")
            .select(`
                exercise_id,
                exercise (exercise_name)
            `)
            .eq("user_id", req.user.auth_id)
            .eq("workout_id", req.params.id);

        if(exerciseError) throw exerciseError;
        
        // extract exerciseIDs from workoutExercises
        const exerciseIDs = workoutExercises.map(exercise => exercise.exercise_id);

        // select exercise id, sets, reps, weight from exercise set with id
        const { data: exerciseSets, error: setError } = await supabase
            .from("exercise_set")
            .select("exercise_id, amount_of_sets, repetitions, weight")
            .in("exercise_id", exerciseIDs);
        
        if(setError) throw setError;

        // extract exercise names, keep exercise id, then filter data by matching exercise IDs
        const combinedData = workoutExercises.map(exercise => ({
            exercise_name: exercise.exercise.exercise_name,
            exercise_id: exercise.exercise_id,
            sets: exerciseSets.filter(set => set.exercise_id === exercise.exercise_id)
        }));

        return res.send(combinedData);
    } catch (error) {
        console.error(error);
        return res.status(500).send({error: error.message});
    }
});

app.post("/workout-exercise", supabaseAuthMiddleware, async (req, res) => {
    const { error } = await supabase
        .from("workout_exercise")
        .insert({
            workout_id: req.body.workout_id,
            exercise_id: req.body.exercise_id,
            user_id: req.body.user_id,
        });

    if (error) {
        return res.status(400).json({ error: error.message });
    }
    res.status(201).send("created!! workout-exercises");
});

app.put("/workout-exercise/id=:id", supabaseAuthMiddleware, async (req, res) => {
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

app.delete("/workout-exercise/id=:id", supabaseAuthMiddleware, async (req, res) => {
    const {error} = await supabase
        .from("workout_exercise")
        .delete()
        .eq("workout_exercises_id", req.params.id)
    if(error) {
        return res.status(400).json({error: error.message});
    }
    res.status(201).send("deleted workout exercises junction with id: " + req.params.id);
});

app.get("/exercise_library", async (req, res) => {
    try {
        let {data, error} = await supabase.from("exercise_library").select();
        console.log(data);
        return res.send(data);
    } catch(error) {
        return res.send({error});
    }
});

app.get("/exercise_library/name", async (req, res) => {
    try {
        let {data, error} = await supabase
        .from("exercise_library")
        .select("name")
        console.log(data);
        return res.send(data);
    } catch (error) {
        return res.send({error});
    }
});

/////////////////////////////////////////////////////

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

app.get("/signup", async (req, res) => {
    res.send("hello man");
})

app.post("/signup", postSignUp);
app.post("/login", postLogin);

app.get("/auth/user", supabaseAuthMiddleware, getUser);
app.put("/auth/user", supabaseAuthMiddleware, putUser);
app.delete("/auth/user", supabaseAuthMiddleware, deleteUser);

app.listen(PORT, () => {
    console.log(
        new Date().toLocaleTimeString() + `: Server is running on port ${PORT}...`
    )
});