# WorkoutTracker
Personal workout tracker 


add exercise -> exercise added to exercises, exercise set added to sets linked to exercise,
                exercises linked to workouts, workouts and exercises added to junction table

TODO: User table

user [icon: user, color: blue] {
  id int
  username text
  password text
  timestamp/date created date
}

exercise [icon: user, color: blue] {
  exercise_id int
  exercise_name string
}

exercise_set [icon: users, color: blue] {
  exercise_set_id int
  exercise_id int
  reps int
  weight float
}

workout [icon: users, color: blue] {
  workout_id id 
  date date
}

workouts_exercise [icon: user, color: green] {
  workout_exercises_id int
  workout_id int
  exercise_id int
}



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

dateDisplay.addEventListener("change", () => {
    console.log("CHANGE");
    while(exerciseTableBody.lastElementChild) {
        exerciseTableBody.removeChild(exerciseTableBody.lastElementChild);
    }
    console.log("date selected: " + dateDisplay.value);
    sessionStorage.setItem("key", dateDisplay.value);
    console.log(sessionStorage.getItem("key"));
    checkWorkoutOnDate(dateDisplay.value);
    
});

// if session storage object is null, current date is displayed
// else not

// so i want to populate on change but 
if(sessionStorage.getItem("key") === null) {
    dateDisplay.value = currentDate;
} else {
    dateDisplay.value = sessionStorage.getItem("key");
}

async function checkWorkoutOnDate(date) {
    const workoutOnDate = await getWorkoutByDate(date);
    if(workoutOnDate !== null && workoutOnDate !== undefined) {
        console.log("here:", workoutOnDate);
        populateTableFromData(workoutOnDate);
    }
}

while(exerciseTableBody.lastElementChild) {
  exerciseTableBody.removeChild(exerciseTableBody.lastElementChild);
}