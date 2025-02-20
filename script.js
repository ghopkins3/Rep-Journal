// TODO 
// ADD EXERCISE TO DATALIST WHEN NEW EXERCISE ADDED

// user should only be able to edit one entry at a time. -- DONE
// escape, click out, or press edit on another entry something 
// validation when saving, do nothing if click outside of save perhaps -- ASAP  

// MOBILE ACCESSIBLE 
// REFACTOR ASAP

// CARDIO/MILE TIMES 
// UI/UX, DESIGN, ETC
// Skeleton html on load
// MIGRATE TO TYPESCRIPT

// FEATURES SUCH AS WEIGHT LOG, RELEVANT RESOURCES, FILTER EXERCISES, OVERVIEW, 
// COMPARE TWO WORKOUTS IE WEEK VS WEEK, GRAPHWORKS, PR VIEW

import { convertToDatabaseFormat } from "./convertToDatabaseFormat.js";

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
let isEditing = false;
let rowToEdit;
let rowID;

if(dateSplitOnSlash[0] < 10) {
    currentDate = `${dateSplitOnSlash[2]}-0${dateSplitOnSlash[0]}-${dateSplitOnSlash[1]}`;
} else {
    currentDate = `${dateSplitOnSlash[2]}-${dateSplitOnSlash[0]}-${dateSplitOnSlash[1]}`;
}
console.log(currentDate);

let selectedDate = "selectedDate";

// if a saved date doesnt exist reset
// PAGE LOADS HERE

if(sessionStorage.getItem(selectedDate) === null) {
    dateDisplay.value = currentDate;
    sessionStorage.setItem(selectedDate, dateDisplay.value);
    console.log("HERE");
} else {
    dateDisplay.value = sessionStorage.getItem(selectedDate);
    console.log("here");
}

checkWorkoutOnDate(dateDisplay.value);

dateDisplay.addEventListener("change", () => {
    while(exerciseTableBody.lastElementChild) {
        exerciseTableBody.removeChild(exerciseTableBody.lastElementChild);
    }
    sessionStorage.setItem(selectedDate, dateDisplay.value);
    console.log("session object date:", sessionStorage.getItem(selectedDate));
    checkWorkoutOnDate(dateDisplay.value);
});

async function checkWorkoutOnDate(date) {
    const workoutOnDate = await getWorkoutByDate(date);
    if(workoutOnDate !== null && workoutOnDate !== undefined) {
        populateTableFromData(workoutOnDate);
    }
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
        console.log("here:", event.target.parentNode.parentNode);
        console.log(exerciseTableBody.children);
        exerciseTableBody.removeChild(event.target.parentNode.parentNode);
        let rowToDelete = event.target.closest("tr");
        rowID = rowToDelete.getAttribute("data-id");
        console.log("delete id:", rowID);
        console.log("here here:", rowToDelete);

        deleteExerciseByID(rowID);
    } else if(event.target.id === "edit-row-button") {
        console.log(rowToEdit);

        if(!isEditing) {
            isEditing = true
            let editableCell = event.target.closest("tr").children;
            rowToEdit = event.target.closest("tr");
            if(rowToEdit !== null || rowToEdit !== undefined) {
                for(let i = 0; i < 4; i++) {
                    editableCell[i].contentEditable = true;
                    editableCell[i].style.caretColor = "auto";
                }
            }

            rowID = rowToEdit.getAttribute("data-id");
            console.log("editing:", rowToEdit);
        } else {
            console.log("~~~~~~ HERE ~~~~~~~");
            let saveButtons = document.querySelectorAll("#save-row-button");
            saveButtons.forEach(btn => {
                if(btn.parentNode.parentNode.getAttribute("data-id") === rowToEdit.getAttribute("data-id")) {
                    btn.click();
                }
            });
            event.preventDefault();
        }
    } else if(event.target.id === "save-row-button") {
        console.log("row to edit:", rowToEdit);
        console.log("row id:", rowID);
        console.log("id of tr:", event.target.closest("tr").getAttribute("data-id"));
        if(event.target.closest("tr").getAttribute("data-id") === rowToEdit.getAttribute("data-id")) {
            console.log("saving row:", rowToEdit);
            console.log("row id:", rowID);
            console.log("id of tr:", event.target.closest("tr").getAttribute("data-id"));
            
            let editableCell = event.target.closest("tr").children;
            for(let i = 0; i < 4; i++) {
                editableCell[i].contentEditable = false;
                editableCell[i].style.caretColor = "transparent";
            }

            // validating 
            editableCell[0].textContent = toTitleCase(editableCell[0].textContent);

            console.log("exercies name:", editableCell[0].textContent);
            console.log("row id when save:", rowID);
            updateExerciseByID(rowToEdit.getAttribute("data-id"), convertToDatabaseFormat(editableCell[0].textContent), editableCell[1].textContent, editableCell[2].textContent, editableCell[3].textContent);
            isEditing = false;
        } else {
            event.preventDefault();
        }
    } 

    // if isEditing = true 
    // AND event.target.parentNode DOES NOT EQUAL rowToEdit 
    // AND event.target.id IS NOT edit-row-button -> SAVE
    if(isEditing && event.target.parentNode !== rowToEdit && event.target.id !== "edit-row-button") {
        let saveButtons = document.querySelectorAll("#save-row-button");
        console.log("row to edit:", rowToEdit);
        console.log("row id:", rowID);
        saveButtons.forEach(btn => {
            console.log("data id:", btn.parentNode.parentNode.getAttribute("data-id"));
            if(btn.parentNode.parentNode.getAttribute("data-id") === rowToEdit.getAttribute("data-id")) {
                console.log("yes");
                btn.click();
            }
        });
    }

    /* console.log(event.target);
    console.log(event.target.id);
    console.log("parent:", event.target.parentNode);
    console.log(event.target.className);
    */
});

// added for increased testing speed
document.addEventListener("keydown", (event) => {
    if(event.key === "Enter") {
        let existingExerciseForms = document.getElementsByClassName("exercise-form");
        if(existingExerciseForms.length > 0) {
            let addButton = document.querySelector("#add-entered-data");
            addButton.click();
        }
    }

    if(event.target.getAttribute("className") === "entered-number") {
        let numberInputPattern = /[0-9]/;
        if(!numberInputPattern.test(event.key) && event.key !== "Backspace") {
            event.preventDefault();
        }
    }
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

async function createExerciseRow() {
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
    
    exerciseNameCell.textContent = convertToDisplayFormat(exerciseNameInput.value);
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

    console.log("sets from create row:", exerciseSetsInput.value);
    let exerciseID = await postExerciseData(exerciseNameInput.value, Number(exerciseSetsInput.value), Number(exerciseRepsInput.value), Number(exerciseWeightInput.value), dateDisplay.value);
    console.log("exercise id:", exerciseID);
    newRow.setAttribute("data-id", exerciseID);
    console.log(dateDisplay.value);
}

async function populateTableFromData(workoutDate) {
    const exerciseData = await getExerciseDataByWorkoutID(workoutDate);

    exerciseData.forEach(exercise => {
        let newRow = exerciseTableBody.insertRow();
        newRow.setAttribute("data-id", exercise.exercise_id);

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
    
        exerciseNameCell.textContent = convertToDisplayFormat(exercise.exercise_name);
        exerciseNameCell.setAttribute("className", "entered-exercise-name");

        exerciseSetsCell.textContent = exercise.sets[0].amount_of_sets;
        exerciseSetsCell.setAttribute("className", "entered-number");

        exerciseRepsCell.textContent = exercise.sets[0].repetitions;
        exerciseRepsCell.setAttribute("className", "entered-number");

        exerciseWeightCell.textContent = exercise.sets[0].weight;
        exerciseWeightCell.setAttribute("className", "entered-number");

        editButton.textContent = "Edit";
        saveButton.textContent = "Save";
        deleteButton.textContent = "X";
    
        console.log("test:", exercise.exercise_id);
        console.log(exercise);
    });
}

function removeExerciseFormFromDOM() {
    let exerciseFormToRemove = document.querySelector(".exercise-form");
    strengthContainer.removeChild(exerciseFormToRemove);
}

function appendExerciseFormToDOM() {
    console.log(strengthContainer.children);
    let existingExerciseForms = document.getElementsByClassName("exercise-form");
    if(existingExerciseForms.length === 0) {
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
    exerciseName = convertToDatabaseFormat(exerciseName);
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
    console.log("sets from exercise data:", sets);
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
        if(!data.exercise_id) {
            throw new Error("Exercise ID is missing");
        }

        console.log("sets immediate before:", sets);

        if(sets !== null || sets !== undefined) {
            await postExerciseSetData(data.exercise_id, sets, repetitions, weight);
        } else {
            console.log("HMMM");
        }


        // enter first exercise on a date -> check if workout on date exists, if it doesn't, post workout date to
        // workout table. 
        // wait for workout data to be posted before posting join data
        // join data needs to be posted;
        
        let workoutID = await getWorkoutByDate(date);
        if(workoutID) {
            console.log("workout id from thing:", workoutID);
            await postWorkoutExerciseJoinData(workoutID, data.exercise_id);
        } else {
            workoutID = await postWorkoutData(date);
            await postWorkoutExerciseJoinData(workoutID, data.exercise_id);
        }

        return data.exercise_id;
    }
    catch(error) {
        console.error(error);
    }
}

// post to exercise sets table
async function postExerciseSetData(exerciseID, sets, repetitions, weight) {
    console.log("before posting sets:", sets);

    if (sets === null || sets === undefined) {
        console.error("Error: sets is null or undefined before posting");
        return;
    }

    try {
        console.log("sets from within try:", sets);
        const response = await fetch("http://localhost:3000/exercise-set", {
            method: "POST",
            body: JSON.stringify({
                exercise_id: exerciseID,
                sets: Number(sets),
                repetitions: Number(repetitions),
                weight: Number(weight)
            }),
            headers: jsonHeaders,
        });

        if(!response.ok) {
            console.log("sets from error:", sets);
            throw new Error("Could not post exercise set data");
        }
    }
    catch(error) {
        console.error(error);
    }

    console.log(`Posted exercise with exercise id: ${exerciseID} and sets: ${sets}`);
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
        if(data.length > 0) {
            return data[0].workout_id;
        }
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

        const result = await response.json();
        if(response.ok) {
            return result.workout_id;
        } else {
            throw new Error(result.error);
        }
    }
    catch(error) {
        console.error(error);
    }

    console.log(`Posted workout with date: ${date}`);
}

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

// function to get data to popoulate table
async function getExerciseDataByWorkoutID(workoutID) {
    try {
        const response = await fetch(`http://localhost:3000/workout-exercise/workout-id=${workoutID}`, {
            method: "GET",
        });

        if(!response.ok) {
            throw new Error("Could not fetch exercise data by workout ID");
        }

        const data = await response.json();
        return data;
    }
    catch(error) {
        console.error(error);
    }
}

// functions to put to appropriate tables -> edit data in row
async function updateExerciseByID(exerciseID, exerciseName, sets, repetitions, weight) {
    try {
        const response = await fetch(`http://localhost:3000/exercise/id=${exerciseID}`, {
            method: "PUT",
            body: JSON.stringify({
                exercise_name: exerciseName
            }),
            headers: jsonHeaders,
        });

        if(!response.ok) {
            console.log("Failure to update exercise by id");
        }

        await updateExerciseSetByExerciseID(exerciseID, sets, repetitions, weight);

    }
    catch(error) {
        console.error(error);
    }

    console.log(`attempting to update exercise with id, ${exerciseID} to new name: ${exerciseName}`);
}

async function updateExerciseSetByExerciseID(exerciseID, sets, repetitions, weight) {
    try {
        const response = await fetch(`http://localhost:3000/exercise-set/id=${exerciseID}`, {
            method: "PUT",
            body: JSON.stringify({
                sets: sets,
                repetitions: repetitions,
                weight: weight
            }),
            headers: jsonHeaders,
        })

        if(!response.ok) {
            console.log("Failure to update exercise_set by exerciseid");
        }
    }
    catch(error) {
        console.error(error);
    }
}

// functions to delete from appropriate tables -> delete data in row
async function deleteExerciseByID(exerciseID) {
    try {
        const response = await fetch(`http://localhost:3000/exercise/id=${exerciseID}`, {
            method: "DELETE",
        });

        if(!response.ok) {
            throw new Error(`Could not delete exercise with id: ${exerciseID}`);
        }

        await deleteExerciseSetDataByID(exerciseID);
    }
    catch(error) {
        console.error(error);
    }
}

async function deleteExerciseSetDataByID(exerciseID) {
    try {
        const response = await fetch(`http://localhost:3000/exercise-set/id=${exerciseID}`, {
            method: "DELETE",
        });

        if(!response.ok) {
            throw new Error(`Could not delete exercise set data with id: ${exerciseID}`);
        }
    }
    catch(error) {
        console.error(error);
    }
}

function removeExcessWhiteSpace(str) {
    return str.replace(/\s{2,}/g,' ').trim();
}

function toTitleCase(str) {
    return removeExcessWhiteSpace(str.replace(
        /\w\S*/g,
        text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
    ));
}

function convertToDisplayFormat(str) {
    return toTitleCase(str.replaceAll("-", " "));
}