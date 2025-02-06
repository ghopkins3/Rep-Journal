// TODO 
// ADD EXERCISE VALIDATION
// CALENDAR FUNCTIONALTITY 
// SAVE EDITS SOMEHOW? BUTTON? POPUP?
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
    } else if(event.target.id === "delete-row-button") {
        console.log(event.target.parentNode.parentNode);
        console.log(exerciseTableBody.children);
        exerciseTableBody.removeChild(event.target.parentNode.parentNode);
    } else if(event.target.id === "edit-row-button") {
        console.log(event.target.parentNode.previousSibling);
        let element = event.target.parentNode.previousSibling;
        for(let i = 0; i < 4; i++) {
            element.contentEditable = true;
            element = element.previousSibling;
        }
    } else if(event.target.id === "save-row-button") {
        let element = event.target.parentNode.previousSibling.previousSibling;
        for(let i = 0; i <4; i++) {
            element.contentEditable = false;
            element = element.previousSibling;
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
    exerciseSetsCell.textContent = exerciseSetsInput.value;
    exerciseRepsCell.textContent = exerciseRepsInput.value;
    exerciseWeightCell.textContent = exerciseWeightInput.value;

    editButton.textContent = "Edit";
    saveButton.textContent = "Save";
    deleteButton.textContent = "X";
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