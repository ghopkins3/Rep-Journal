// TODO 
// CALENDAR FUNCTIONALTITY 
// DATABASING WITH ACTUAL DATA I.E. ACTUAL USE CASE

// populate from database now

// ADD EXERCISE TO DATALIST WHEN NEW EXERCISE ADDED
// MOBILE ACCESSIBLE 
// REFACTOR ASAP

// CARDIO/MILE TIMES 
// UI/UX, DESIGN, ETC
// Skeleton html on load
// MIGRATE TO TYPESCRIPT

// FEATURES SUCH AS WEIGHT LOG, RELEVANT RESOURCES, FILTER EXERCISES, OVERVIEW, 
// COMPARE TWO WORKOUTS IE WEEK VS WEEK, GRAPHWORKS, PR VIEW

const dateDisplay = document.querySelector("#date-display");
const addExerciseLink = document.querySelector("#add-exercise-link");
const addExerciseSetsLink = document.querySelector("#add-sets-link");
const strengthContainer = document.querySelector(".strength-container");
const exerciseFormTemplate = document.querySelector("#exercise-form-template");
const exerciseTable = document.querySelector(".exercise-table");
const exerciseTableBody = document.querySelector("#exercise-table-body");

let date = new Date().toLocaleDateString();
let dateSplitOnSlash = date.split("/");
let currentDate;

if(dateSplitOnSlash[0] < 10) {
    currentDate = `${dateSplitOnSlash[2]}-0${dateSplitOnSlash[0]}-${dateSplitOnSlash[1]}`;
} else {
    currentDate = `${dateSplitOnSlash[2]}-${dateSplitOnSlash[0]}-${dateSplitOnSlash[1]}`;
}
console.log(currentDate);

dateDisplay.addEventListener("change", () => {
    console.log("CHANGE");
    console.log("date selected: " + dateDisplay.value);
    sessionStorage.setItem("key", dateDisplay.value);
    console.log(sessionStorage.getItem("key"));

    // populate table

});

if(sessionStorage.getItem("key") === null) {
    dateDisplay.value = currentDate;
} else {
    dateDisplay.value = sessionStorage.getItem("key");
}

const test = await getWorkoutByDate(dateDisplay.value);
if(test !== null && test !== undefined) {
    console.log("here", test);
} else {
    console.log("not test");
}

document.addEventListener("click", (event) => {
    if(event.target.id === "exercise-search" || event.target.getAttribute("className") === "entered-exercise-name") {
        event.target.addEventListener("keydown", (event) => {
            let exerciseNamePattern = /^[a-zA-Z\s]$/;
            if(!exerciseNamePattern.test(event.key) && event.key !== "Backspace" && event.key !== "Tab") {
                event.preventDefault();
            } 
        });
    } else if(event.target.id === "sets-input" 
        || event.target.id === "reps-input" 
        || event.target.id === "weight-input"
        || event.target.getAttribute("className") === "entered-number") {
        event.target.addEventListener("keydown", (event) => {
            let numberInputPattern = /[0-9]/;
            if(!numberInputPattern.test(event.key) && event.key !== "Backspace") {
                event.preventDefault();
            }
        });
    } else if(event.target.id === "add-entered-data") {
        let exerciseNameInput = document.querySelector("#exercise-search");
        let exerciseSetsInput = document.querySelector("#sets-input");
        let exerciseRepsInput = document.querySelector("#reps-input");
        let exerciseWeightInput = document.querySelector("#weight-input");

        if((exerciseNameInput.value != "") && (exerciseSetsInput.value != "") && 
            (exerciseRepsInput.value != "") && (exerciseWeightInput.value != "")) {
                createExerciseRow();
                removeExerciseFormFromDOM();
        } else {
            event.preventDefault();
        }
    } else if(event.target.id === "close-exercise-form") {
        removeExerciseFormFromDOM();
    } else if(event.target.id === "delete-row-button") {
        console.log(event.target.parentNode.parentNode);
        console.log(exerciseTableBody.children);
        exerciseTableBody.removeChild(event.target.parentNode.parentNode);
    } else if(event.target.id === "edit-row-button") {
        console.log(event.target.parentNode.previousSibling);
        let element = event.target.parentNode.previousSibling;
        for(let i = 0; i < 4; i++) {
            element.contentEditable = true;
            element.style.caretColor = "auto";
            element = element.previousSibling;
        }
    } else if(event.target.id === "save-row-button") {
        let element = event.target.parentNode.previousSibling.previousSibling;
        for(let i = 0; i <4; i++) {
            element.contentEditable = false;
            element.style.caretColor = "transparent";
            element = element.previousSibling;
        }
    } 

    console.log(event.target);
    console.log(event.target.id);
    console.log(event.target.className);
});

addExerciseLink.addEventListener("click", () => {
    appendExerciseFormToDOM();
    document.querySelector("#exercise-search").value = "";
    document.querySelector("#sets-input").value = "";
    document.querySelector("#reps-input").value = "";
    document.querySelector("#weight-input").value = ""; 
});

addExerciseSetsLink.addEventListener("click", (event) => {
    if(exerciseTable.rows.length <= 1) {
        event.preventDefault();
    } else {
        appendExerciseFormToDOM();
        document.querySelector("#exercise-search").value = exerciseTable.rows[exerciseTable.rows.length - 1].cells.item(0).textContent;
        document.querySelector("#sets-input").value = exerciseTable.rows[exerciseTable.rows.length - 1].cells.item(1).textContent;
        document.querySelector("#reps-input").value = exerciseTable.rows[exerciseTable.rows.length - 1].cells.item(2).textContent;
        document.querySelector("#weight-input").value = exerciseTable.rows[exerciseTable.rows.length - 1].cells.item(3).textContent;
        console.log(exerciseTable.rows.length);
        console.log(exerciseTable.rows[exerciseTable.rows.length - 1]);
        console.log(exerciseTable.rows[exerciseTable.rows.length - 1].cells);
        console.log(exerciseTable.rows[exerciseTable.rows.length - 1].cells.item(0));
        console.log(exerciseTable.rows[exerciseTable.rows.length - 1].cells.item(0).textContent);
    }
});

function createExerciseRow() {
    let exerciseNameInput = document.querySelector("#exercise-search");
    let exerciseSetsInput = document.querySelector("#sets-input");
    let exerciseRepsInput = document.querySelector("#reps-input");
    let exerciseWeightInput = document.querySelector("#weight-input");

    console.log(exerciseNameInput.value);
    console.log(exerciseSetsInput.value);
    console.log(exerciseRepsInput.value);
    console.log(exerciseWeightInput.value);

    let newRow = exerciseTableBody.insertRow();
    let exerciseNameCell = newRow.insertCell(0);
    let exerciseSetsCell = newRow.insertCell(1);
    let exerciseRepsCell = newRow.insertCell(2);
    let exerciseWeightCell = newRow.insertCell(3);
    let editRowCell = newRow.insertCell(4);
    let saveRowCell = newRow.insertCell(5);
    let deleteRowCell = newRow.insertCell(6);

    let editButton = document.createElement("button");
    editButton.setAttribute("id", "edit-row-button");
    editRowCell.appendChild(editButton);

    let saveButton = document.createElement("button");
    saveButton.setAttribute("id", "save-row-button");
    saveRowCell.appendChild(saveButton);
    
    deleteRowCell.className = "delete-button-cell";

    let deleteButton = document.createElement("button");
    deleteButton.setAttribute("id", "delete-row-button");
    deleteRowCell.appendChild(deleteButton);
    
    exerciseNameCell.textContent = exerciseNameInput.value;
    exerciseNameCell.setAttribute("className", "entered-exercise-name");

    exerciseSetsCell.textContent = exerciseSetsInput.value;
    exerciseSetsCell.setAttribute("className", "entered-number");

    exerciseRepsCell.textContent = exerciseRepsInput.value;
    exerciseRepsCell.setAttribute("className", "entered-number");

    exerciseWeightCell.textContent = exerciseWeightInput.value;
    exerciseWeightCell.setAttribute("className", "entered-number");

    editButton.textContent = "Edit";
    saveButton.textContent = "Save";
    deleteButton.textContent = "X";

    postExerciseData(exerciseNameInput.value, exerciseSetsInput.value, exerciseRepsInput.value, exerciseWeightInput.value, dateDisplay.value);
    console.log(dateDisplay.value);

}

function removeExerciseFormFromDOM() {
    let exerciseFormToRemove = document.querySelector(".exercise-form");
    strengthContainer.removeChild(exerciseFormToRemove);
}

function appendExerciseFormToDOM() {
    console.log(strengthContainer.children);
    let test = document.getElementsByClassName("exercise-form");
    if(test.length === 0) {
        console.log("HERE");
        let exerciseFormToAppend = exerciseFormTemplate.content.cloneNode(true);
        strengthContainer.appendChild(exerciseFormToAppend);
    }
}

const jsonHeaders = new Headers();
jsonHeaders.append("Content-Type", "application/json");

async function getAllExercises() {
    try {
        const response = await fetch("http://localhost:3000/exercise", {
            method: "GET",
        });

        if(!response.ok) {
            throw new Error("Could not fetch resource");
        }

        const data = await response.json();
        console.log(data);
    }
    catch(error) {
        console.error(error);
    }
}

async function getExerciseByName(exerciseName) {
    exerciseName = exerciseName.replaceAll(" ", "-").toLowerCase();
    console.log("exercise name: ", exerciseName);
    try {
        const response = await fetch(`http://localhost:3000/exercise/name=${exerciseName}`, {
            method: "GET",
        });

        if(!response.ok) {
            throw new Error("Could not fetch resource");
        }

        const data = await response.json();
        console.log("data: ", data);
        console.log("id: ", data[0].exercise_id);
    }
    catch(error) {
        console.error(error);
    }
}

async function getDataByDate(selectedDate) {
    try {
        const response = await fetch(`http://localhost:3000/test/date=${selectedDate}`, {
            method: "GET",
        });

        if(!response.ok) {
            throw new Error("Could not fetch resource");
        }

        const data = await response.json();
        console.log("Data by date: ", data);
    }
    catch(error) {
        console.error(error);
    }
}

async function postData(testInput, dateInput) {
    try {
        const response = await fetch("http://localhost:3000/test", {
            method: "POST",
            body: JSON.stringify({
                test: testInput,
                date: dateInput
            }),
            headers: jsonHeaders,
        });

        if(!response.ok) {
            throw new Error("Could not post");
        }
    }
    catch(error) {
        console.error(error);
    }

    console.log("posted");
}

async function deleteDataByID(id) {
    try {
        const response = await fetch(`http://localhost:3000/test/id=${id}`, {
            method: "DELETE"
        })

        if(!response.ok) {
            throw new Error(`Could not delete data with id: ${id}`);
        }
    }
    catch(error) {
        console.error(error);
    }

    console.log(`Deleted data with id: ${id}`);
}

async function updateDataByID(testInput, id) {
    try {
        const response = await fetch(`http://localhost:3000/test/id=${id}`, {
            method: "PUT",
            body: JSON.stringify({
                test: testInput,
            }),
            headers: jsonHeaders,
        });

        if(!response.ok) {
            throw new Error("Could not put");
        }
    }
    catch(error) {
        console.error(error);
    }

    console.log(`Updated data with id: ${id}`);
}

// functions to post to all tables -> add data to row

// post to exercise table
async function postExerciseData(exerciseName, sets, repetitions, weight, date) {
    try {
        const response = await fetch("http://localhost:3000/exercise", {
            method: "POST",
            body: JSON.stringify({
                exercise_name: exerciseName
            }),
            headers: jsonHeaders,
        });

        if(!response.ok) {
            throw new Error("Could not post exercise");
        }

        const data = await response.json();
        console.log("data: ", data);
        console.log("exercise id: ", data.exercise_id);
        postExerciseSetData(data.exercise_id, sets, repetitions, weight);

        const workoutID = await getWorkoutByDate(date);
        if(workoutID !== null && workoutID !== undefined) {
            console.log("workout id from thing: ", workoutID);
        } else {
            postWorkoutData(date);
        }

        postWorkoutExerciseJoinData(workoutID, data.exercise_id);
    }
    catch(error) {
        console.error(error);
    }
}

// post to exercise sets table
async function postExerciseSetData(exerciseID, sets, repetitions, weight) {
    try {
        const response = await fetch("http://localhost:3000/exercise-set", {
            method: "POST",
            body: JSON.stringify({
                exercise_id: exerciseID,
                amount_of_sets: sets,
                repetitions: repetitions,
                weight: weight,
            }),
            headers: jsonHeaders,
        });

        if(!response.ok) {
            throw new Error("Could not post exercise set data");
        }
    }
    catch(error) {
        console.error(error);
    }

    console.log(`Posted exercise with exercise id: ${exerciseID}`);
}

async function getWorkoutByDate(date) {
    try {
        const response = await fetch(`http://localhost:3000/workout/date=${date}`, {
            method: "GET",
        });

        if(!response.ok) {
            throw new Error("Could not fetch resource");
        }

        const data = await response.json();
        console.log("Workout by date: ", data);
        console.log("workout id: ", data[0].workout_id);
        return data[0].workout_id;
    }
    catch(error) {
        console.error(error);
    }
}

// post to workout table
async function postWorkoutData(date) {
    try {
        const response = await fetch("http://localhost:3000/workout", {
            method: "POST",
            body: JSON.stringify({
                date: date,
            }),
            headers: jsonHeaders,
        });

        if(!response.ok) {
            throw new Error("Could not post workout data");
        }
    }
    catch(error) {
        console.error(error);
    }

    console.log(`Posted workout with date: ${date}`);
}
``
// post to workout exercises junction table
async function postWorkoutExerciseJoinData(workoutID, exerciseID) {
    try {
        const response = await fetch("http://localhost:3000/workout-exercise", {
            method: "POST",
            body: JSON.stringify({
                workout_id: workoutID,
                exercise_id: exerciseID,
            }),
            headers: jsonHeaders,
        });

        if(!response.ok) {
            throw new Error("Could not post workout data");
        }
    }
    catch(error) {
        console.error(error);
    }

    console.log(`Posted junction with ids: ${workoutID}, ${exerciseID}`);
}

// functions to put to appropriate tables -> edit data in row

// functions to delete from appropriate tables -> delete data in row
