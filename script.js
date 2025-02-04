// TODO 
// DELETE ROW BUTTON
// ADD EXERCISE VALIDATION
// CALENDAR FUNCTIONALTITY 
// DATABASING 
// ADD EXERCISE TO DATALIST WHEN NEW EXERCISE ADDED
// MOBILE ACCESSIBLE 
// UI/UX, DESIGN, ETC
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

let currentDate = new Date().toJSON().slice(0, 10);

document.addEventListener("click", (event) => {
    if(event.target.id === "add-entered-data") {
        createExerciseRow();
        removeExerciseFormFromDOM();
    } else if(event.target.id === "close-exercise-form") {
        removeExerciseFormFromDOM();
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

    exerciseNameCell.textContent = exerciseNameInput.value;
    exerciseSetsCell.textContent = exerciseSetsInput.value;
    exerciseRepsCell.textContent = exerciseRepsInput.value;
    exerciseWeightCell.textContent = exerciseWeightInput.value;
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

dateDisplay.value = currentDate;