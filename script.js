import { convertToDatabaseFormat, convertToDisplayFormat, toTitleCase } from "../utils/formatUtils.js";
import { supabase } from "../lib/frontendSupabaseClient.js";

const dateDisplay = document.querySelector("#date-display");
const addExerciseLink = document.querySelector("#add-exercise-link");
const addExerciseSetsLink = document.querySelector("#add-sets-link");
const exerciseFormContainer = document.querySelector(".exercise-form-container")
const exerciseFormTemplate = document.querySelector("#exercise-form-template");
const editExerciseFormTemplate = document.querySelector("#edit-exercise-form-template");
const exerciseTable = document.querySelector(".exercise-table");
const exerciseTableBody = document.querySelector("#exercise-table-body");
const cells = exerciseTable.getElementsByTagName("td");
const loginBtn = document.querySelector(".login-button");
const signUpBtn = document.querySelector(".sign-up-button");
const loginDialog = document.querySelector(".login-dialog");
const closeLoginDialogBtn = document.querySelector(".close-login-dialog-button");
const signUpDialog = document.querySelector(".sign-up-dialog");
const closeSignUpDialogBtn = document.querySelector(".close-signup-dialog-button");
const submitLoginBtn = document.querySelector(".submit-login-button");
const submitSignUpBtn = document.querySelector(".submit-sign-up-button");

const signupEmailInput = signUpDialog.querySelector(".email-input");
const signupUsernameInput = signUpDialog.querySelector(".username-input");
const signupPasswordInput = signUpDialog.querySelector(".password-input");

const loginUsernameInput = loginDialog.querySelector(".username-input");
const loginPasswordInput = loginDialog.querySelector(".password-input");

let date = new Date().toLocaleDateString();
let dateSplitOnSlash = date.split("/");
let currentDate;
let isEditing = false;
let rowToEdit;
let rowID;
let userAccessToken;
let userID;

supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN") {
        loginBtn.textContent = "Log Out";
    } else if(event === "SIGNED_OUT") {
        localStorage.clear();
        loginBtn.textContent = "Log In";
    }
});

const userData = await supabase.auth.getUser();
if(userData.data.user) {
    const userSession = await supabase.auth.getSession();
    userAccessToken = userSession.data.session.access_token;
    userID = userData.data.user.id;
}

if(dateSplitOnSlash[0] < 10) {
    if(dateSplitOnSlash[1] < 10) {
        currentDate = `${dateSplitOnSlash[2]}-0${dateSplitOnSlash[0]}-0${dateSplitOnSlash[1]}`;
    } else if(dateSplitOnSlash[1] >= 10) {
        currentDate = `${dateSplitOnSlash[2]}-0${dateSplitOnSlash[0]}-${dateSplitOnSlash[1]}`;
    }
} else if(dateSplitOnSlash[0] >= 10) {
    if(dateSplitOnSlash[1] < 10) {
        currentDate = `${dateSplitOnSlash[2]}-${dateSplitOnSlash[0]}-0${dateSplitOnSlash[1]}`;
    } else if(dateSplitOnSlash[1] >= 10) {
        currentDate = `${dateSplitOnSlash[2]}-0${dateSplitOnSlash[0]}-${dateSplitOnSlash[1]}`;
    }
}

let selectedDate = "selectedDate";

if(sessionStorage.getItem(selectedDate) === null) {
    dateDisplay.value = currentDate;
    sessionStorage.setItem(selectedDate, dateDisplay.value);
} else {
    dateDisplay.value = sessionStorage.getItem(selectedDate);
}

if(userData.data.user) {
    await checkWorkoutOnDate(dateDisplay.value, userAccessToken);
}

dateDisplay.addEventListener("change", () => {
    while(exerciseTableBody.lastElementChild) {
        exerciseTableBody.removeChild(exerciseTableBody.lastElementChild);
    }
    sessionStorage.setItem(selectedDate, dateDisplay.value);
    if(userData.data.user) {
        checkWorkoutOnDate(dateDisplay.value, userAccessToken);
    }
});

async function checkWorkoutOnDate(date, authToken) {
    if(userData.data.user) {
        const workoutOnDate = await getWorkoutByDate(date, authToken);
        if(workoutOnDate !== null && workoutOnDate !== undefined) {
            populateTableFromData(workoutOnDate, authToken);
        } 
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
    } else if(event.target.id === "delete-row-button" || event.target.id === "mobile-delete-button") {
        exerciseTableBody.removeChild(event.target.parentNode.parentNode);
        let rowToDelete = event.target.closest("tr");
        rowID = rowToDelete.getAttribute("data-id");
    
        if(exerciseTableBody.childElementCount === 0) {
            deleteWorkoutByDate(dateDisplay.value, userAccessToken);
        }
        deleteExerciseByID(rowID, userAccessToken);
        localStorage.removeItem(rowID);
    } else if(event.target.id === "edit-row-button") {
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
        } else {
            let saveButtons = document.querySelectorAll("#save-row-button");
            saveButtons.forEach(btn => {
                if(btn.parentNode.parentNode.getAttribute("data-id") === rowToEdit.getAttribute("data-id")) {
                    btn.click();
                }
            });
            event.preventDefault();
        }
    } else if(event.target.id === "save-row-button") {
        if(event.target.closest("tr").getAttribute("data-id") === rowToEdit.getAttribute("data-id")) {
            let editableCell = event.target.closest("tr").children;
            for(let i = 0; i < 4; i++) {
                editableCell[i].contentEditable = false;
                editableCell[i].style.caretColor = "transparent";
            }
            editableCell[0].textContent = toTitleCase(editableCell[0].textContent);
            updateExerciseByID(rowToEdit.getAttribute("data-id"), convertToDatabaseFormat(editableCell[0].textContent), editableCell[1].textContent, editableCell[2].textContent, editableCell[3].textContent, userAccessToken);
            isEditing = false;
        } else {
            event.preventDefault();
        }
    } else if(event.target.id === "mobile-hide-button") {
        let mobileRowContent = event.target.parentNode.parentNode.children;
        let targetRowDataID = event.target.parentNode.parentNode.getAttribute("data-id");

        if(event.target.textContent === "-") {
            event.target.textContent = "+";
        } else if(event.target.textContent === "+") {
            event.target.textContent = "-";
        }

        for(let i = 1; i < mobileRowContent.length; i++) {
            if(mobileRowContent[i].getAttribute("data-cell") !== "name") {
                mobileRowContent[i].classList.toggle("hidden");
            }
        
            localStorage.setItem(targetRowDataID, mobileRowContent[i].classList.contains("hidden"));
        }
    } else if(event.target.id === "mobile-edit-button") {
        
        let testOne = event.target.parentNode.parentNode.children[1];
        for(let i = 1; i < 5; i++) {
            
        }
        
        rowID = event.target.parentNode.parentNode.getAttribute("data-id");

        appendEditExerciseFormToDOM();
        document.querySelector("#exercise-search").value = event.target.parentNode.parentNode.children[1].textContent;
        document.querySelector("#sets-input").value = event.target.parentNode.parentNode.children[2].textContent;
        document.querySelector("#reps-input").value = event.target.parentNode.parentNode.children[3].textContent;
        document.querySelector("#weight-input").value = event.target.parentNode.parentNode.children[4].textContent; 

        let mobileRowContent = event.target.parentNode.parentNode.children;
        let targetRowDataID = event.target.parentNode.parentNode.getAttribute("data-id");
        
        for(let i = 1; i < mobileRowContent.length; i++) {

            if(mobileRowContent[i].getAttribute("class") === "hidden") {
                mobileRowContent[i].classList.remove("hidden");
            }
        
            localStorage.setItem(targetRowDataID, "false");
        }

        if(event.target.parentNode.children[2].textContent === "+") {
            event.target.parentNode.children[2].textContent = "-";
        }

    } else if(event.target.id === "save-entered-data") {
        const exerciseInput = document.querySelector("#exercise-search").value;
        const setsInput = document.querySelector("#sets-input").value;
        const repsInput = document.querySelector("#reps-input").value;
        const weightInput = document.querySelector("#weight-input").value;
        const displayExerciseName = convertToDisplayFormat(exerciseInput);
        const dbExerciseName = convertToDatabaseFormat(displayExerciseName);
        const row = document.querySelector(`[data-id="${rowID}"]`);
    
        if(row) {
            row.children[1].textContent = displayExerciseName;
            row.children[2].textContent = setsInput;
            row.children[3].textContent = repsInput;
            row.children[4].textContent = weightInput;
        }

        updateExerciseByID(rowID, dbExerciseName, setsInput, repsInput, weightInput, userAccessToken);
        removeExerciseFormFromDOM();
    } 

    if(isEditing && event.target.parentNode !== rowToEdit && event.target.id !== "edit-row-button") {
        let saveButtons = document.querySelectorAll("#save-row-button");
        saveButtons.forEach(btn => {
            
            if(btn.parentNode.parentNode.getAttribute("data-id") === rowToEdit.getAttribute("data-id")) {
                
                btn.click();
            }
        });
    }
});


document.addEventListener("keydown", (event) => {
    if(event.key === "Enter") {
        let existingExerciseForms = document.getElementsByClassName("exercise-form");
        if(existingExerciseForms.length > 0) {
            let addButton = document.querySelector("#add-entered-data");
            addButton.click();
        }
    } else if(event.key === "Escape") {
        if(signUpDialog.open) {
            signupEmailInput.value = "";
            signupUsernameInput.value = "";
            signupPasswordInput.value = "";
            signUpDialog.close();
        } else if(loginDialog.open) {
            loginUsernameInput.value = "";
            loginPasswordInput.value = "";
            loginDialog.close();
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
        
        if(window.screen.width >= 601) {
            document.querySelector("#exercise-search").value = exerciseTable.rows[exerciseTable.rows.length - 1].cells.item(0).textContent;
            document.querySelector("#sets-input").value = exerciseTable.rows[exerciseTable.rows.length - 1].cells.item(1).textContent;
            document.querySelector("#reps-input").value = exerciseTable.rows[exerciseTable.rows.length - 1].cells.item(2).textContent;
            document.querySelector("#weight-input").value = exerciseTable.rows[exerciseTable.rows.length - 1].cells.item(3).textContent;
        } else if(window.screen.width <= 600) {
            document.querySelector("#exercise-search").value = exerciseTable.rows[exerciseTable.rows.length - 1].cells.item(1).textContent;
            document.querySelector("#sets-input").value = exerciseTable.rows[exerciseTable.rows.length - 1].cells.item(2).textContent;
            document.querySelector("#reps-input").value = exerciseTable.rows[exerciseTable.rows.length - 1].cells.item(3).textContent;
            document.querySelector("#weight-input").value = exerciseTable.rows[exerciseTable.rows.length - 1].cells.item(4).textContent;
        }
    }
});

loginBtn.addEventListener("click", () => {
    if(loginBtn.textContent === "Log In") {
        loginDialog.showModal();
    } else if(loginBtn.textContent === "Log Out") {
        logout();
    }
});

signUpBtn.addEventListener("click", () => {
    if(loginBtn.textContent === "Log In") {
        signUpDialog.showModal();
    } else if(loginBtn.textContent === "Log Out") {
        event.preventDefault();
    }
});

closeLoginDialogBtn.addEventListener("click", () => {
    loginUsernameInput.value = "";
    loginPasswordInput.value = "";
    loginDialog.close();
});

closeSignUpDialogBtn.addEventListener("click", () => {
    signupEmailInput.value = "";
    signupUsernameInput.value = "";
    signupPasswordInput.value = "";
    signUpDialog.close();
});

submitLoginBtn.addEventListener("click", (event) => {
    alert("clicked!");
    try {
        loginUser(loginUsernameInput.value, loginPasswordInput.value);
    } catch(error) {
        console.error(error);
    }
});

submitLoginBtn.addEventListener("touchstart", (event) => {
    alert("touch started.");
    try {
        loginUser(loginUsernameInput.value, loginPasswordInput.value);
    } catch(error) {
        console.error(error);
    }
});

submitSignUpBtn.addEventListener("click", (event) => {
    alert("clicked!");
    try {
        postUser(signupEmailInput.value, signupUsernameInput.value, signupPasswordInput.value);
    } catch(error) {
        console.error(error);
    }

});

submitSignUpBtn.addEventListener("touchstart", (event) => {
    alert("touch started.");
    try {
        postUser(signupEmailInput.value, signupUsernameInput.value, signupPasswordInput.value);
    } catch(error) {
        console.error(error);
    }

});

async function createExerciseRow() {
    if(!userData.data.user) {
        console.error("User not authenticated");
        return;
    } else {
        
        let exerciseNameInput = document.querySelector("#exercise-search");
        let exerciseSetsInput = document.querySelector("#sets-input");
        let exerciseRepsInput = document.querySelector("#reps-input");
        let exerciseWeightInput = document.querySelector("#weight-input");

        let newRow = exerciseTableBody.insertRow();
        let mobileHideBtnCell = newRow.insertCell(0);
        let exerciseNameCell = newRow.insertCell(1);
        let exerciseSetsCell = newRow.insertCell(2);
        let exerciseRepsCell = newRow.insertCell(3);
        let exerciseWeightCell = newRow.insertCell(4);
        let editRowCell = newRow.insertCell(5);
        let saveRowCell = newRow.insertCell(6);
        let deleteRowCell = newRow.insertCell(7);

        mobileHideBtnCell.className = "mobile-hide-button-cell";

        let mobileDeleteBtn = document.createElement("button");
        let mobileEditBtn = document.createElement("button");   
        let mobileHideBtn = document.createElement("button");

        mobileDeleteBtn.setAttribute("id", "mobile-delete-button");
        mobileEditBtn.setAttribute("id", "mobile-edit-button");
        mobileHideBtn.setAttribute("id", "mobile-hide-button");

        mobileHideBtnCell.appendChild(mobileDeleteBtn);
        mobileHideBtnCell.appendChild(mobileEditBtn);
        mobileHideBtnCell.appendChild(mobileHideBtn);

        editRowCell.className = "edit-button-cell";

        let editButton = document.createElement("button");
        editButton.setAttribute("id", "edit-row-button");
        editRowCell.appendChild(editButton);

        saveRowCell.className = "save-button-cell";

        let saveButton = document.createElement("button");
        saveButton.setAttribute("id", "save-row-button");
        saveRowCell.appendChild(saveButton);

        deleteRowCell.className = "delete-button-cell";

        let deleteButton = document.createElement("button");
        deleteButton.setAttribute("id", "delete-row-button");
        deleteRowCell.appendChild(deleteButton);

        exerciseNameCell.textContent = convertToDisplayFormat(exerciseNameInput.value);
        exerciseNameCell.setAttribute("className", "entered-exercise-name");
        exerciseNameCell.setAttribute("data-cell", "name");


        exerciseSetsCell.textContent = exerciseSetsInput.value;
        exerciseSetsCell.setAttribute("className", "entered-number");
        exerciseSetsCell.setAttribute("data-cell", "sets");

        exerciseRepsCell.textContent = exerciseRepsInput.value;
        exerciseRepsCell.setAttribute("className", "entered-number");
        exerciseRepsCell.setAttribute("data-cell", "reps");

        exerciseWeightCell.textContent = exerciseWeightInput.value;
        exerciseWeightCell.setAttribute("className", "entered-number");
        exerciseWeightCell.setAttribute("data-cell", "weight");

        mobileDeleteBtn.textContent = "Del";
        mobileEditBtn.textContent = "Edit";
        mobileHideBtn.textContent = "-";
        editButton.textContent = "Edit";
        saveButton.textContent = "Save";
        deleteButton.textContent = "X";
        
        let exerciseID = await postExerciseData(exerciseNameInput.value, Number(exerciseSetsInput.value), Number(exerciseRepsInput.value), Number(exerciseWeightInput.value), dateDisplay.value, userID, userAccessToken);
        
        newRow.setAttribute("data-id", exerciseID);
    }

}

async function populateTableFromData(workoutDate, authToken) {
    if(!userData.data.user) {
        return;
    } else {
        const exerciseData = await getExerciseDataByWorkoutID(workoutDate, authToken);

        exerciseData.forEach(exercise => {
            let newRow = exerciseTableBody.insertRow();
            newRow.setAttribute("data-id", exercise.exercise_id);
    
            let mobileHideBtnCell = newRow.insertCell(0);
            let exerciseNameCell = newRow.insertCell(1);
            let exerciseSetsCell = newRow.insertCell(2);
            let exerciseRepsCell = newRow.insertCell(3);
            let exerciseWeightCell = newRow.insertCell(4);
            let editRowCell = newRow.insertCell(5);
            let saveRowCell = newRow.insertCell(6);
            let deleteRowCell = newRow.insertCell(7);

            mobileHideBtnCell.className = "mobile-hide-button-cell";

            let mobileDeleteBtn = document.createElement("button");
            let mobileEditBtn = document.createElement("button");   
            let mobileHideBtn = document.createElement("button");

            mobileDeleteBtn.setAttribute("id", "mobile-delete-button");
            mobileEditBtn.setAttribute("id", "mobile-edit-button");
            mobileHideBtn.setAttribute("id", "mobile-hide-button");

            mobileHideBtnCell.appendChild(mobileDeleteBtn);
            mobileHideBtnCell.appendChild(mobileEditBtn);
            mobileHideBtnCell.appendChild(mobileHideBtn);

            editRowCell.className = "edit-button-cell";

            let editButton = document.createElement("button");
            editButton.setAttribute("id", "edit-row-button");
            editRowCell.appendChild(editButton);

            saveRowCell.className = "save-button-cell";

            let saveButton = document.createElement("button");
            saveButton.setAttribute("id", "save-row-button");
            saveRowCell.appendChild(saveButton);
        
            deleteRowCell.className = "delete-button-cell";

            let deleteButton = document.createElement("button");
            deleteButton.setAttribute("id", "delete-row-button");
            deleteRowCell.appendChild(deleteButton);
        
            exerciseNameCell.textContent = convertToDisplayFormat(exercise.exercise_name);
            exerciseNameCell.setAttribute("className", "entered-exercise-name");
            exerciseNameCell.setAttribute("data-cell", "name");

            exerciseSetsCell.textContent = exercise.sets[0].amount_of_sets;
            exerciseSetsCell.setAttribute("className", "entered-number");
            exerciseSetsCell.setAttribute("data-cell", "sets");

            exerciseRepsCell.textContent = exercise.sets[0].repetitions;
            exerciseRepsCell.setAttribute("className", "entered-number");
            exerciseRepsCell.setAttribute("data-cell", "reps");

            exerciseWeightCell.textContent = exercise.sets[0].weight;
            exerciseWeightCell.setAttribute("className", "entered-number");
            exerciseWeightCell.setAttribute("data-cell", "weight");

            mobileDeleteBtn.textContent = "Del";
            mobileEditBtn.textContent = "Edit";

            editButton.textContent = "Edit";
            saveButton.textContent = "Save";
            deleteButton.textContent = "X";

            for(const cell of cells) {
                
                if(localStorage.getItem(cell.parentNode.getAttribute("data-id")) === "true" 
                                    && (cell !== cell.parentNode.firstElementChild)
                                    && (cell !== cell.parentNode.firstElementChild.nextElementSibling)) {
                    cell.classList.add("hidden");
                    mobileHideBtn.textContent = "+";
                } else {
                    mobileHideBtn.textContent = "-";
                }
            }
        });
    }
}

async function removeExerciseFormFromDOM() {
    let exerciseFormToRemove = document.querySelector(".exercise-form");
    exerciseFormContainer.removeChild(exerciseFormToRemove);
}

async function appendExerciseFormToDOM() {
    if(!userData.data.user) {
        return;    
    } else {
        let existingExerciseForms = document.getElementsByClassName("exercise-form");
        if(existingExerciseForms.length === 0) {
            let exerciseFormToAppend = exerciseFormTemplate.content.cloneNode(true);
            exerciseFormContainer.appendChild(exerciseFormToAppend);
        }
    }
}

async function appendEditExerciseFormToDOM() {
    if(!userData.data.user) {
        return;
    } else {
        let existingExerciseForms = document.getElementsByClassName("exercise-form");
        if(existingExerciseForms.length === 0) {
            let exerciseFormToAppend = editExerciseFormTemplate.content.cloneNode(true);
            exerciseFormContainer.appendChild(exerciseFormToAppend);
        }
    }
}

async function postExerciseData(exerciseName, sets, repetitions, weight, date, userID, authToken) {
    if(!userData.data.user) {
        return;
    } else {
        try {
            const response = await fetch("http://localhost:3000/exercise", {
                method: "POST",
                body: JSON.stringify({
                    exercise_name: exerciseName,
                    user_id: userID
                }),
                headers: getHeaders(authToken),
            });

            if(!response.ok) {
                throw new Error("Could not post exercise");
            }

            const data = await response.json();
            if(!data.exercise_id) {
                throw new Error("Exercise ID is missing");
            }

            if(sets !== null || sets !== undefined) {
                await postExerciseSetData(data.exercise_id, sets, repetitions, weight, authToken);
            } else {
                
            }
            
            let workoutID = await getWorkoutByDate(date, authToken);
            if(workoutID) {
                
                
                await postWorkoutExerciseJoinData(workoutID, data.exercise_id, userID, authToken);
            } else {
                
                workoutID = await postWorkoutData(date, userID, authToken);
                await postWorkoutExerciseJoinData(workoutID, data.exercise_id, userID, authToken);
            }

            return data.exercise_id;
        }
        catch(error) {
            console.error(error);
        }
    }
}

// post to exercise sets table
async function postExerciseSetData(exerciseID, sets, repetitions, weight, authToken) {
    if(!userData.data.user) {
        return; 
    } else{
        if (sets === null || sets === undefined) {
            console.error("Error: sets is null or undefined before posting");
            return;
        }

        try {
            
            const response = await fetch("http://localhost:3000/exercise-set", {
                method: "POST",
                body: JSON.stringify({
                    exercise_id: exerciseID,
                    sets: Number(sets),
                    repetitions: Number(repetitions),
                    weight: Number(weight)
                }),
                headers: getHeaders(authToken),
            });

            if(!response.ok) {
                
                throw new Error("Could not post exercise set data");
            }
        }
        catch(error) {
            console.error(error);
        }
    }
}

async function getWorkoutByDate(date, authToken) {
    if(!userData.data.user) {
        return;
    } else {
        try {
            const response = await fetch(`http://localhost:3000/workout/date=${date}`, {
                method: "GET",
                headers: getHeaders(authToken),
            });

            if(!response.ok) {
                throw new Error("Could not fetch resource");
            }

            const data = await response.json();
            
            if(data.length > 0) {
                return data[0].workout_id;
            }
        }
        catch(error) {
            console.error(error);
        }
    }
}

// post to workout table
async function postWorkoutData(date, userID, authToken) {
    if(!userData.data.user) {
        return;
    } else {
        try {
            const response = await fetch("http://localhost:3000/workout", {
                method: "POST",
                body: JSON.stringify({
                    date: date,
                    user_id: userID
                }),
                headers: getHeaders(authToken),
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
    }
}

// post to workout exercises junction table
async function postWorkoutExerciseJoinData(workoutID, exerciseID, userID, authToken) {
    if(!userData.data.user) {
        return;
    } else {
        try {
            const response = await fetch("http://localhost:3000/workout-exercise", {
                method: "POST",
                body: JSON.stringify({
                    workout_id: workoutID,
                    exercise_id: exerciseID,
                    user_id: userID,
                }),
                headers: getHeaders(authToken),
            });

            if(!response.ok) {
                throw new Error("Could not post workout data");
            }
        }
        catch(error) {
            console.error(error);
        }
    }
}

// function to get data to popoulate table
async function getExerciseDataByWorkoutID(workoutID, authToken) {
    if(!userData.data.user) {
        return;
    } else {
        try {
            const response = await fetch(`http://localhost:3000/workout-exercise/workout-id=${workoutID}`, {
                method: "GET",
                headers: getHeaders(authToken),
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
}

// functions to put to appropriate tables -> edit data in row
async function updateExerciseByID(exerciseID, exerciseName, sets, repetitions, weight, authToken) {
    if(!userData.data.user) {
        return; 
    } else {
        try {
            const response = await fetch(`http://localhost:3000/exercise/id=${exerciseID}`, {
                method: "PUT",
                body: JSON.stringify({
                    exercise_name: exerciseName
                }),
                headers: getHeaders(authToken),
            });

            if(!response.ok) {
                throw new Error(`Could not update exercise with id ${exerciseID}`);
            }

            await updateExerciseSetByExerciseID(exerciseID, sets, repetitions, weight, authToken);
        }
        catch(error) {
            console.error(error);
        }
    }
}

async function updateExerciseSetByExerciseID(exerciseID, sets, repetitions, weight, authToken) {
    if(!userData.data.user) {
        return;
    } else {
        try {
            const response = await fetch(`http://localhost:3000/exercise-set/id=${exerciseID}`, {
                method: "PUT",
                body: JSON.stringify({
                    sets: sets,
                    repetitions: repetitions,
                    weight: weight
                }),
                headers: getHeaders(authToken),
            })

            if(!response.ok) {
                
            }
        }
        catch(error) {
            console.error(error);
        }
    }
}

// functions to delete from appropriate tables -> delete data in row
async function deleteExerciseByID(exerciseID, authToken) {
    if(!userData.data.user) {
        return;
    } else {
        try {
            const response = await fetch(`http://localhost:3000/exercise/id=${exerciseID}`, {
                method: "DELETE",
                headers: getHeaders(authToken),
            });

            if(!response.ok) {
                throw new Error(`Could not delete exercise with id: ${exerciseID}`);
            }

            await deleteExerciseSetDataByID(exerciseID, authToken);
        }
        catch(error) {
            console.error(error);
        }
    }
}

async function deleteExerciseSetDataByID(exerciseID, authToken) {
    if(!userData.data.user) {
        return;
    } else {
        try {
            const response = await fetch(`http://localhost:3000/exercise-set/id=${exerciseID}`, {
                method: "DELETE",
                headers: getHeaders(authToken),
            });

            if(!response.ok) {
                throw new Error(`Could not delete exercise set data with id: ${exerciseID}`);
            }
        }
        catch(error) {
            console.error(error);
        }
    }
}

async function deleteWorkoutByDate(date, authToken) {
    if(!userData.data.user) {
        return;
    } else {
        try {
            const response = await fetch(`http://localhost:3000/workout/date=${date}`, {
                method: "DELETE",
                headers: getHeaders(authToken),
            });

            if(!response.ok) {
                throw new Error(`Could not delete workout on date: ${date}`);
            }
        }
        catch(error) {
            console.error(error);
        }
    }
}

async function postUser(email, username, password) {
    try {
        const response = await fetch(`http://localhost:3000/signup`, {
            method: "POST",
            body: JSON.stringify({
                email: email,
                username: username, 
                password: password
            }),
            headers: getHeaders(),
        });

        if(!response.ok) {
            throw new Error(`Could not post user with email: ${email} and password: ${password}`);
        } else if(response.ok) {
            signupEmailInput.value = "";
            signupUsernameInput.value = "";
            signupPasswordInput.value = "";
            signUpDialog.close();
            alert("User successfully created");
            try {
                await loginUser(email, password)
            } catch(error) {
                console.error(error);
            }
        }
    } catch (error) {
        console.error(error);
    }
}

async function loginUser(email, password) {
    try {
        const response = await fetch(`https://rep-journal-server.vercel.app//login`, {
            method: "POST",
            body: JSON.stringify({
                email: email,
                password: password
            }),
            headers: getHeaders(),
        });

        if(!response.ok) {
            throw new Error(`Could not login`);
        }

        const data = await response.json();
        
        const { user, session } = data;
        await supabase.auth.setSession({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
        });

        loginDialog.close();
        loginUsernameInput.value = "";
        loginPasswordInput.value = "";
        location.reload();
    } catch (error) {
        console.error(error);
    }
}

async function logout() {
    try {
        const { error } = await supabase.auth.signOut();
        if(error) throw error;
        location.reload();
    } catch(error) {
        console.error("Logout error:", error.message);
    }
}

function getHeaders(authToken = null) {
    const headers = {
        "Content-Type": "application/json",
    };

    if(authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
    };

    return headers;
};