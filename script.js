import { convertToDatabaseFormat, convertToDisplayFormat, toTitleCase } from "./utils/formatUtils.js";
import { supabase } from "./lib/frontendSupabaseClient.js";

const dateDisplay = document.querySelector("#date-display");
const addExerciseLink = document.querySelector("#add-exercise-link");
const addExerciseSetsLink = document.querySelector("#add-sets-link");
const exerciseFormContainer = document.querySelector(".exercise-form-container");
if(document.querySelector("#weight-input") !== null) {
    const weightInput = document.querySelector("#weight-input");
}
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

const collapseOrExpandBtn = document.querySelector(".collapse-expand-button");
collapseOrExpandBtn.classList.add("hidden");

const signupEmailInput = signUpDialog.querySelector("#signup-email-input");
const signupUsernameInput = signUpDialog.querySelector("#signup-username-input");
const signupPasswordInput = signUpDialog.querySelector("#signup-password-input");

const loginUsernameInput = loginDialog.querySelector(".username-input");
const loginPasswordInput = loginDialog.querySelector(".password-input");

const passwordRequirementsContainer = signUpDialog.querySelector(".password-requirements");
const passwordLengthReq = signUpDialog.querySelector("#length")
const passwordLowercaseReq = signUpDialog.querySelector("#lowercase")
const passwordUppercaseReq = signUpDialog.querySelector("#uppercase")
const passwordDigitReq = signUpDialog.querySelector("#digit")
const passwordSymbolReq = signUpDialog.querySelector("#symbol")
passwordRequirementsContainer.classList.add("hidden");
passwordLengthReq.classList.add("invalid-req");
passwordLowercaseReq.classList.add("invalid-req");
passwordUppercaseReq.classList.add("invalid-req");
passwordDigitReq.classList.add("invalid-req");
passwordSymbolReq.classList.add("invalid-req");

const invalidEmailText = document.querySelector("#invalid-email-text");
const invalidUsernameText = document.querySelector("#invalid-username-text");
const invalidPasswordText = document.querySelector("#invalid-password-text");
invalidEmailText.classList.add("hidden");
invalidUsernameText.classList.add("hidden");
invalidPasswordText.classList.add("hidden");

const diaryHeaderContainer = document.querySelector(".diary-header-container");
const loginErrorNotif = document.createElement("div");
loginErrorNotif.setAttribute("class", "log-in-notification");
console.log("class:", loginErrorNotif.getAttribute("class"));
diaryHeaderContainer.appendChild(loginErrorNotif);

const closeLoginErrorNotifBtn = document.createElement("img");
closeLoginErrorNotifBtn.setAttribute("src", "./images/close-icon.png");
closeLoginErrorNotifBtn.setAttribute("id", "login-notif-img");

const loginErrorNotifText = document.createElement("p");
loginErrorNotifText.textContent = "Must be logged in to perform this action.";
loginErrorNotifText.setAttribute("id", "login-notif-text");

loginErrorNotif.appendChild(closeLoginErrorNotifBtn);
loginErrorNotif.appendChild(loginErrorNotifText);

document.querySelector("#login-notif-img");

loginErrorNotif.classList.add("hidden");

let hiddenItemCount = JSON.parse(localStorage.getItem("hiddenItemCount")) || [];
let tableHiddenValues = [];

console.log("hidden items:", hiddenItemCount);

let isMobile = window.innerWidth < 601;

let date = new Date().toLocaleDateString();
let dateSplitOnSlash = date.split("/");
let currentDate;
let isEditing = false;
let rowToEdit;
let rowID;
let userSession;
let userAccessToken;
let userID;

supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN") {
        signUpBtn.classList.add("hidden");
        loginBtn.textContent = "Log Out";
    } else if(event === "SIGNED_OUT") {
        signUpBtn.classList.remove("hidden");
        localStorage.clear();
        console.log("logged out");
        loginBtn.textContent = "Log In";
    } 
});

let userData = await supabase.auth.getUser();
if(userData.data.user) {
    userSession = await supabase.auth.getSession();
    userAccessToken = userSession.data.session.access_token;
    userID = userSession.data.session.user.id;
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
    console.log("awaiting workout on date...");
    await checkWorkoutOnDate(dateDisplay.value, userAccessToken);
}

let renderedRows = exerciseTableBody.children;
for(let row of renderedRows) {
    if(row.cells[2].classList.contains("hidden")) {
        console.log(row);
        console.log(row.getAttribute("data-id"));
        tableHiddenValues.push(row.getAttribute("data-id"));
    }
}

if(tableHiddenValues.length !== renderedRows.length) {
    collapseOrExpandBtn.textContent = "Collapse All";
} else {
    collapseOrExpandBtn.textContent = "Expand All";
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
    console.log("arrived.");
    console.log("date:", date);
    console.log("auth token:", authToken);
    if(userData.data.user) {
        console.log("user:", userData.data.user);
        console.log("there seems to be a user in check workout.");
        const workoutOnDate = await getWorkoutByDate(date, authToken);
        console.log(workoutOnDate);
        if(workoutOnDate !== null && workoutOnDate !== undefined) {
            console.log("here");
            await populateTableFromData(workoutOnDate, authToken);
        } else {
            console.log("workout on date seems to be null or undefined.");
            console.log(workoutOnDate);
        }
    }
}

document.addEventListener("click", (event) => {
    console.log(event.target);
    // console.log(event.target.parentNode.parentNode.children);
    // console.log(event.target.parentNode.children);
    // console.log(event.target.parentNode.children[2]);
    // console.log(event.target.parentNode.children[2].classList);
    if(event.target.id === "exercise-search" || event.target.getAttribute("className") === "entered-exercise-name") {
        event.target.addEventListener("keydown", (event) => {
            let exerciseNamePattern = /^[a-zA-Z\s]$/;
            if(!exerciseNamePattern.test(event.key) && event.key !== "Backspace" && event.key !== "Tab") {
                event.preventDefault();
            } 
        });
    } else if(event.target.id === "sets-input" 
        || event.target.id === "reps-input" 
        || event.target.getAttribute("className") === "entered-number") {
        event.target.addEventListener("keydown", (event) => {
            let numberInputPattern = /[0-9]/;
            if(!numberInputPattern.test(event.key) && event.key !== "Backspace") {
                event.preventDefault();
            }
        });    
    }  else if(event.target.id === "add-entered-data") {
        let exerciseNameInput = document.querySelector("#exercise-search");
        let exerciseSetsInput = document.querySelector("#sets-input");
        let exerciseRepsInput = document.querySelector("#reps-input");
        let exerciseWeightInput = document.querySelector("#weight-input");

        if((exerciseNameInput.value != "") && (exerciseSetsInput.value != "") && 
            (exerciseRepsInput.value != "") && (exerciseWeightInput.value != "")) {
                createExerciseRow();
                console.log("hidden item length: ", hiddenItemCount.length);
                collapseOrExpandBtn.textContent = "Collapse All";
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

        if(exerciseTableBody.children.length === 0) {
            deleteWorkoutByDate(dateDisplay.value, userAccessToken);
            collapseOrExpandBtn.classList.add("hidden");
            localStorage.removeItem("hiddenItemCount");
            hiddenItemCount = [];
            console.log("removing local storage count.");
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

        if(event.target.getAttribute("src") === "images/arrow_dropup.png") {

            hiddenItemCount.push(event.target.parentNode.parentNode);
            localStorage.setItem("hiddenItemCount", JSON.stringify(hiddenItemCount));
            event.target.setAttribute("src", "images/arrow_dropdown.png");

        } else if(event.target.getAttribute("src") === "images/arrow_dropdown.png") {

            console.log("before:", hiddenItemCount);
            console.log(event.target.parentNode.parentNode);
            hiddenItemCount = hiddenItemCount.filter((item) => item !== event.target.parentNode.parentNode);
            console.log("after:", hiddenItemCount);
            localStorage.setItem("hiddenItemCount", JSON.stringify(hiddenItemCount));
            collapseOrExpandBtn.textContent = "Collapse All";
            event.target.setAttribute("src", "images/arrow_dropup.png");

        }

        event.target.parentNode.lastElementChild.classList.toggle("hidden");

        for(let i = 1; i < mobileRowContent.length; i++) {
            if(mobileRowContent[i].getAttribute("data-cell") !== "name") {
                mobileRowContent[i].classList.toggle("hidden");
            }
        
            localStorage.setItem(targetRowDataID, mobileRowContent[i].classList.contains("hidden"));
        }

        let totalRows = exerciseTableBody.getElementsByTagName("tr");
        console.log("total rows:", totalRows)
        console.log("length:", totalRows.length);
        console.log("hidden length:", hiddenItemCount.length);

        if(hiddenItemCount.length === totalRows.length) {
            console.log("Collapsed here 2.");
            collapseOrExpandBtn.textContent = "Expand All";
        } else {
            collapseOrExpandBtn.textContent = "Collapse All";
        }

    } else if(event.target.id === "mobile-edit-button") {
        
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

        console.log("target:", event.target.parentNode.children[1]);

        if(event.target.parentNode.children[1].getAttribute("src") === "images/arrow_dropdown.png") {
            event.target.parentNode.children[1].src = "images/arrow_dropup.png";
            event.target.parentNode.children[2].classList.remove("hidden");
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

            signupPasswordInput.classList.remove("invalid");
            signupPasswordInput.classList.remove("valid");

            passwordLengthReq.classList.add("invalid-req");
            passwordLengthReq.classList.remove("valid-req");

            passwordLowercaseReq.classList.add("invalid-req");
            passwordLowercaseReq.classList.remove("valid-req");

            passwordUppercaseReq.classList.add("invalid-req");
            passwordUppercaseReq.classList.remove("valid-req");

            passwordDigitReq.classList.add("invalid-req");
            passwordDigitReq.classList.remove("valid-req");
            
            passwordSymbolReq.classList.add("invalid-req");
            passwordSymbolReq.classList.remove("valid-req");

            passwordRequirementsContainer.classList.add("hidden");

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

let decimalPressed = false;
let weightDecimalLength = 0;
exerciseFormContainer.addEventListener("keydown", (event) => {
    if(event.target.id === "weight-input") {
        let input = event.target.value;
        console.log(input);
        
        if(weightDecimalLength === 2 && event.key !== "Backspace") {
            event.preventDefault();
        }

        if(event.key === ".") {
            console.log("decimal pressed");

            if(!decimalPressed) {
                decimalPressed = true;
                console.log("decimal status:", decimalPressed);
            } else if(decimalPressed) {
                console.log("decimal status:", decimalPressed);
                event.preventDefault();
            }
        }

        if(input === "") {
            decimalPressed = false;
            weightDecimalLength = 0;
            if(event.key === ".") {
                event.preventDefault();
            }
        }
    }
});

exerciseFormContainer.addEventListener("change", (event) => {
    if(event.target.id === "weight-input") {
        let input = event.target.value;
        console.log("changed:", input);
        decimalPressed = false;
        weightDecimalLength = 0;
    }
});

exerciseFormContainer.addEventListener("keyup", (event) => { 
    if(event.target.id === "weight-input") {
        let input = event.target.value;
        let inputParts = input.split(".");
        console.log("keyup:", input);
        console.log("keyup:", inputParts);
        if(inputParts.length > 1) {
            console.log("keyup:", inputParts[1]);
            console.log("keyup:", inputParts[1].length);
        }

        if(inputParts.length > 1) {
            weightDecimalLength = inputParts[1].length;    
        }
        

        if(weightDecimalLength === 2 && event.key !== "Backspace") {
            event.preventDefault();
        }
        
    }
})

closeLoginErrorNotifBtn.addEventListener("click", () => {
    loginErrorNotif.classList.add("hidden");
});

addExerciseLink.addEventListener("click", () => {
    if(!userData.data.user) {
        appendLoginErrorNotificationToDOM();
        return;
    } else {
        appendExerciseFormToDOM();
        document.querySelector("#exercise-search").value = "";
        document.querySelector("#sets-input").value = "1";
        document.querySelector("#reps-input").value = "";
        document.querySelector("#weight-input").value = ""; 
    }
});

addExerciseSetsLink.addEventListener("click", (event) => {
    if(exerciseTable.rows.length <= 1) {
        appendLoginErrorNotificationToDOM();
        return;
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
        localStorage.clear();
    }
});

signUpBtn.addEventListener("click", (event) => {
    if(loginBtn.textContent === "Log In") {
        signUpDialog.showModal();
    } else if(loginBtn.textContent === "Log Out") {
        event.preventDefault();
    }
});

const checkEmailExists = createDebouncedInputChecker(emailExists, signupEmailInput);
const checkUsernameExists = createDebouncedInputChecker(usernameExists, signupUsernameInput);

signupEmailInput.addEventListener("keyup", (event) => {
    const email = event.target.value.trim();

    if(email === "" || email.length === 0) {
        checkEmailExists.cancel();
    }

    if(email === "" || email.length === 0) {
        event.target.classList.remove("remove-outline");
        event.target.classList.remove("valid");
        event.target.classList.remove("invalid");
        invalidEmailText.classList.add("hidden");
    } else if(!email.includes("@")) {
        event.target.classList.add("remove-outline");
        event.target.classList.remove("valid");
        event.target.classList.add("invalid");
        invalidEmailText.classList.remove("hidden");
    } else if(email.includes("@")) {
        checkEmailExists(email);
    }
});

signupEmailInput.addEventListener("blur", (event) => {
    event.target.classList.remove("invalid");
    event.target.classList.remove("valid");
    invalidEmailText.classList.add("hidden");
});

signupEmailInput.addEventListener("focus", (event) => {
    passwordRequirementsContainer.classList.add("hidden");
    const email = event.target.value.trim();
    if(email === "" || email.length === 0) {
        event.target.classList.remove("remove-outline");
        event.target.classList.remove("valid");
        event.target.classList.remove("invalid");
        invalidEmailText.classList.add("hidden");
    } else if(!email.includes("@")) {
        event.target.classList.add("remove-outline");
        event.target.classList.remove("valid");
        event.target.classList.add("invalid");
        invalidEmailText.classList.remove("hidden");
    } else if(email.includes("@")) {
        event.target.classList.remove("invalid");
        event.target.classList.add("valid");
        invalidEmailText.classList.add("hidden");
        checkEmailExists(email);
    }
});

signupUsernameInput.addEventListener("keyup", (event) => {
    const username = event.target.value.trim();
    const symbols = /[^a-zA-Z0-9\s]/g;
    
    if(username === "" || username.length === 0) {
        event.target.classList.remove("invalid");
        event.target.classList.remove("valid");
        event.target.classList.remove("remove-outline");
    } else if(username.match(symbols)) {
        event.target.classList.add("remove-outline");
        event.target.classList.remove("valid");
        event.target.classList.add("invalid");
        invalidUsernameText.classList.remove("hidden");
    } else {
        checkUsernameExists(username);
    }
});

signupUsernameInput.addEventListener("focus", (event) => {
    passwordRequirementsContainer.classList.add("hidden");
    const username = event.target.value.trim();
    if(username === "" || username.length === 0) {
        event.target.classList.remove("remove-outline");
    } else {
        checkUsernameExists(username);
    }
});

signupUsernameInput.addEventListener("blur", (event) => {
    event.target.classList.remove("invalid");
    event.target.classList.remove("valid");
    event.target.classList.add("remove-outline");
    invalidUsernameText.classList.add("hidden");
});

signupPasswordInput.addEventListener("focus", () => {
    passwordRequirementsContainer.classList.remove("hidden");
    signupPasswordInput.addEventListener("keyup", () => {
        const password = signupPasswordInput.value;

        if(password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).+$/) && password.length >= 8) {
            signupPasswordInput.classList.remove("invalid");
            signupPasswordInput.classList.add("valid");
            invalidPasswordText.classList.add("hidden");
        } else if(password.length === 0) {
            signupPasswordInput.classList.remove("remove-outline");
            signupPasswordInput.classList.remove("invalid");
            signupPasswordInput.classList.remove("valid")
            invalidPasswordText.classList.add("hidden");
        } else {
            signupPasswordInput.classList.add("remove-outline");
            signupPasswordInput.classList.remove("valid");
            signupPasswordInput.classList.add("invalid");
            invalidPasswordText.classList.remove("hidden");
        }
    });
});

signupPasswordInput.addEventListener("keyup", () => {
    const password = signupPasswordInput.value.trim();

    const lowercaseLetters = /[a-z]/g;
    const uppercaseLetters = /[A-Z]/g;
    const digits = /[0-9]/g;
    const symbols = /[^a-zA-Z0-9\s]/g;

    if(password.length >= 8) {
        passwordLengthReq.classList.remove("invalid-req");
        passwordLengthReq.classList.add("valid-req");
    } else {
        passwordLengthReq.classList.remove("valid-req");
        passwordLengthReq.classList.add("invalid-req");
    }

    if(password.match(digits)) {
        passwordDigitReq.classList.remove("invalid-req")
        passwordDigitReq.classList.add("valid-req")
    } else {
        passwordDigitReq.classList.remove("valid-req")
        passwordDigitReq.classList.add("invalid-req")
    }

    if(password.match(lowercaseLetters)) {
        passwordLowercaseReq.classList.remove("invalid-req")
        passwordLowercaseReq.classList.add("valid-req")
    } else {
        passwordLowercaseReq.classList.remove("valid-req")
        passwordLowercaseReq.classList.add("invalid-req")
    }
    
    if(password.match(uppercaseLetters)) {
        passwordUppercaseReq.classList.remove("invalid-req")
        passwordUppercaseReq.classList.add("valid-req")
    } else {
        passwordUppercaseReq.classList.remove("valid-req")
        passwordUppercaseReq.classList.add("invalid-req")
    }

    if(password.match(symbols)) {
        passwordSymbolReq.classList.remove("invalid-req")
        passwordSymbolReq.classList.add("valid-req")
    } else {
        passwordSymbolReq.classList.remove("valid-req")
        passwordSymbolReq.classList.add("invalid-req")
    }
});

signupPasswordInput.addEventListener("blur", (event) => {
    passwordRequirementsContainer.classList.add("hidden");
    invalidPasswordText.classList.add("hidden");
    event.target.classList.remove("invalid");
    event.target.classList.remove("valid");
    event.target.classList.add("remove-outline");
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

    signupPasswordInput.classList.remove("invalid");
    signupPasswordInput.classList.remove("valid");

    passwordLengthReq.classList.add("invalid-req");
    passwordLengthReq.classList.remove("valid-req");

    passwordLowercaseReq.classList.add("invalid-req");
    passwordLowercaseReq.classList.remove("valid-req");

    passwordUppercaseReq.classList.add("invalid-req");
    passwordUppercaseReq.classList.remove("valid-req");

    passwordDigitReq.classList.add("invalid-req");
    passwordDigitReq.classList.remove("valid-req");
    
    passwordSymbolReq.classList.add("invalid-req");
    passwordSymbolReq.classList.remove("valid-req");

    passwordRequirementsContainer.classList.add("hidden");
    invalidEmailText.classList.add("hidden");
    invalidUsernameText.classList.add("hidden");
    invalidPasswordText.classList.add("hidden");
    
    signUpDialog.close();
});

signUpDialog.addEventListener("keydown", (event) => {
    if(event.key === "SPACE" || event.key === " ") {
        event.preventDefault();
    }
});

loginDialog.addEventListener("keydown", (event) => {
    if(event.key === "SPACE" || event.key === " ") {
        event.preventDefault();
    }
});

submitLoginBtn.addEventListener("click", tryLogin);
submitSignUpBtn.addEventListener("click", trySignUp);

collapseOrExpandBtn.addEventListener("click", (event) => {

    let totalRows = exerciseTableBody.children;
    
    if(hiddenItemCount.length !== totalRows.length) {
        console.log("here 1");
        for(let row of totalRows) {
            console.log("hidden row");
            if(!row.cells[2].classList.contains("hidden")) {
                hiddenItemCount.push(row);
            }
            row.cells[2].classList.add("hidden");
            row.cells[3].classList.add("hidden");
            row.cells[4].classList.add("hidden");
            row.cells[5].classList.add("hidden");
            row.cells[6].classList.add("hidden");
            row.cells[7].classList.add("hidden");
            row.cells[0].firstElementChild.nextElementSibling.setAttribute("src", "images/arrow_dropdown.png");
            row.cells[0].lastElementChild.classList.add("hidden");

            console.log(row.cells[0].firstElementChild.nextElementSibling);
            
            localStorage.setItem("hiddenItemCount", JSON.stringify(hiddenItemCount));
            localStorage.setItem(row.getAttribute("data-id"), row.cells[2].classList.contains("hidden"));

            console.log(row.cells[0].lastElementChild);
            console.log("row id:", row.getAttribute("data-id"));
        }

        collapseOrExpandBtn.textContent = "Expand All";
    } else if(hiddenItemCount.length === totalRows.length) {
        console.log("here");
        for(let row of totalRows) {
            console.log("not hidden row");
            row.cells[2].classList.remove("hidden");
            row.cells[3].classList.remove("hidden");
            row.cells[4].classList.remove("hidden");
            row.cells[5].classList.remove("hidden");
            row.cells[6].classList.remove("hidden");
            row.cells[7].classList.remove("hidden");
            row.cells[0].firstElementChild.nextElementSibling.setAttribute("src", "images/arrow_dropup.png");
            row.cells[0].lastElementChild.classList.remove("hidden");

            hiddenItemCount = [];
            localStorage.setItem("hiddenItemCount", JSON.stringify(hiddenItemCount));
            localStorage.setItem(row.getAttribute("data-id"), row.cells[2].classList.contains("hidden"));


            console.log(row.cells[0].lastElementChild);
            console.log("row id:", row.getAttribute("data-id"));
        }

        collapseOrExpandBtn.textContent = "Collapse All";
    }
}); 

async function createExerciseRow() {
    if(!userData.data.user) {
        console.error("User not authenticated");
        alert("user not detected");
        return;
    } else {

        let isMobile = window.innerWidth < 601;
        let columnOffset = 0;

        let exerciseNameInput = document.querySelector("#exercise-search");
        let exerciseSetsInput = document.querySelector("#sets-input");
        let exerciseRepsInput = document.querySelector("#reps-input");
        let exerciseWeightInput = document.querySelector("#weight-input");

        let newRow = exerciseTableBody.insertRow();

        let exerciseID = await postExerciseData(exerciseNameInput.value, Number(exerciseSetsInput.value), Number(exerciseRepsInput.value), Number(exerciseWeightInput.value), dateDisplay.value, userID, userAccessToken);
        
        newRow.setAttribute("data-id", exerciseID);
        localStorage.setItem(exerciseID, "false");
        collapseOrExpandBtn.classList.remove("hidden");


        if(isMobile) {
            let mobileHideBtnCell = newRow.insertCell(0);

            columnOffset = 1;

            mobileHideBtnCell.setAttribute("className", "mobile-hide-button-cell");

            let mobileDeleteBtn = document.createElement("img");
            let mobileEditBtn = document.createElement("img");   
            let mobileHideBtn = document.createElement("img");

            mobileDeleteBtn.src = "images/delete_icon.png";
            mobileEditBtn.src = "images/edit.png";
            mobileHideBtn.src = "images/arrow_dropup.png";

            mobileDeleteBtn.setAttribute("id", "mobile-delete-button");
            mobileEditBtn.setAttribute("id", "mobile-edit-button");
            mobileHideBtn.setAttribute("id", "mobile-hide-button");

            mobileHideBtnCell.appendChild(mobileEditBtn);
            mobileHideBtnCell.appendChild(mobileHideBtn);
            mobileHideBtnCell.appendChild(mobileDeleteBtn);
        }

        let exerciseNameCell = newRow.insertCell(0 + columnOffset);
        let exerciseSetsCell = newRow.insertCell(1 + columnOffset);
        let exerciseRepsCell = newRow.insertCell(2 + columnOffset);
        let exerciseWeightCell = newRow.insertCell(3 + columnOffset );
        let editRowCell = newRow.insertCell(4 + columnOffset);
        let saveRowCell = newRow.insertCell(5 + columnOffset);
        let deleteRowCell = newRow.insertCell(6 + columnOffset);

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

        editButton.textContent = "Edit";
        saveButton.textContent = "Save";
        deleteButton.textContent = "X";
    }
}

async function populateTableFromData(workoutDate, authToken) {
    if(!userData.data.user) {
        alert("user not detected");
        console.log("no user?");
        return;
    } else {
        const exerciseData = await getExerciseDataByWorkoutID(workoutDate, authToken);
        if(exerciseData.length > 0) {
            collapseOrExpandBtn.classList.remove("hidden");
        }

        exerciseData.forEach(entry => {
            let exerciseName = entry.exercise.exercise_name;
            let numberOfSets;
            let numberOfReps;
            let weightNumber;

            console.log("here");
            
            console.log(entry.exercise.exercise_set);

            entry.exercise.exercise_set.forEach(({ sets, repetitions, weight }) => {
                numberOfSets = sets;
                numberOfReps = repetitions;
                weightNumber = weight;
            });

            let newRow = exerciseTableBody.insertRow();
            newRow.setAttribute("data-id", entry.exercise_id);
            
            let columnOffset = 0;


            if(isMobile) {
                let mobileHideBtnCell = newRow.insertCell(0);

                columnOffset = 1;

                mobileHideBtnCell.setAttribute("className", "mobile-hide-button-cell");

                let mobileDeleteBtn = document.createElement("img");
                let mobileEditBtn = document.createElement("img");   
                let mobileHideBtn = document.createElement("img");

                mobileDeleteBtn.src = "images/delete_icon.png";
                mobileEditBtn.src = "images/edit.png";
                mobileHideBtn.src = "images/arrow_dropup.png";

                mobileDeleteBtn.setAttribute("id", "mobile-delete-button");
                mobileEditBtn.setAttribute("id", "mobile-edit-button");
                mobileHideBtn.setAttribute("id", "mobile-hide-button");

                mobileHideBtnCell.appendChild(mobileEditBtn);
                mobileHideBtnCell.appendChild(mobileHideBtn);
                mobileHideBtnCell.appendChild(mobileDeleteBtn);
            }

            let exerciseNameCell = newRow.insertCell(0 + columnOffset);
            let exerciseSetsCell = newRow.insertCell(1 + columnOffset);
            let exerciseRepsCell = newRow.insertCell(2 + columnOffset);
            let exerciseWeightCell = newRow.insertCell(3 + columnOffset );
            let editRowCell = newRow.insertCell(4 + columnOffset);
            let saveRowCell = newRow.insertCell(5 + columnOffset);
            let deleteRowCell = newRow.insertCell(6 + columnOffset);

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
        
            exerciseNameCell.textContent = convertToDisplayFormat(exerciseName);
            exerciseNameCell.setAttribute("className", "entered-exercise-name");
            exerciseNameCell.setAttribute("data-cell", "name");

            exerciseSetsCell.textContent = numberOfSets;
            exerciseSetsCell.setAttribute("className", "entered-number");
            exerciseSetsCell.setAttribute("data-cell", "sets");

            exerciseRepsCell.textContent = numberOfReps;
            exerciseRepsCell.setAttribute("className", "entered-number");
            exerciseRepsCell.setAttribute("data-cell", "reps");

            exerciseWeightCell.textContent = weightNumber;
            exerciseWeightCell.setAttribute("className", "entered-number");
            exerciseWeightCell.setAttribute("data-cell", "weight");

            editButton.textContent = "Edit";
            saveButton.textContent = "Save";
            deleteButton.textContent = "X";
        });

        for(const cell of cells) {
            let cellChildren = cell.children;
        
            if(localStorage.getItem(cell.parentNode.getAttribute("data-id")) === "true" 
                                && (cell !== cell.parentNode.firstElementChild.nextElementSibling)) {
                if(cell !== cell.parentNode.firstElementChild) {
                    cell.classList.add("hidden");
                } else if(cell === cell.parentNode.firstElementChild) {
                    for(let cellChild of cellChildren) {
                        if(cellChild.getAttribute("id") === "mobile-hide-button") {
                            cellChild.setAttribute("src", "images/arrow_dropdown.png");
                        } else if(cellChild.getAttribute("id") === "mobile-delete-button") {
                            cellChild.classList.add("hidden");
                        }
                    }
                }
            } else {
                for(let cellChild of cellChildren) {
                    if(cellChild.getAttribute("id") === "mobile-hide-button") {
                        cellChild.setAttribute("src", "images/arrow_dropup.png");
                    } else if(cellChild.getAttribute("id") === "mobile-delete-button") {
                        cellChild.classList.remove("hidden");
                    }
                }
            }
        }

        if(!isMobile) {
            for(const cell of cells) {
                cell.classList.remove("hidden");
            }
        }
    }
}

async function removeExerciseFormFromDOM() {
    let exerciseFormToRemove = document.querySelector(".exercise-form");
    exerciseFormContainer.removeChild(exerciseFormToRemove);
}

async function appendExerciseFormToDOM() {
    if(!userData.data.user) {
        appendLoginErrorNotificationToDOM();
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
        appendLoginErrorNotificationToDOM();
        return;
    } else {
        let existingExerciseForms = document.getElementsByClassName("exercise-form");
        if(existingExerciseForms.length === 0) {
            let exerciseFormToAppend = editExerciseFormTemplate.content.cloneNode(true);
            exerciseFormContainer.appendChild(exerciseFormToAppend);
        }
    }
};

function appendLoginErrorNotificationToDOM() {
    loginErrorNotif.classList.remove("hidden");
};

async function postExerciseData(exerciseName, sets, repetitions, weight, date, userID, authToken) {
    if(!userData.data.user) {
        return;
    } else {
        console.log("user:", userData.data.user);
        console.log("auth:", authToken);
        try {
            const response = await fetch("https://rep-journal.vercel.app/exercise", {
                method: "POST",
                body: JSON.stringify({
                    exercise_name: exerciseName,
                    user_id: userID
                }),
                headers: getHeaders(authToken),
            });

            console.log(getHeaders(authToken));

            if(!response.ok) {
                console.log(response);
                throw new Error("Could not post exercise");
            }

            const data = await response.json();
            if(!data.exercise_id) {
                throw new Error("Exercise ID is missing");
            }

            if(sets !== null || sets !== undefined) {
                await postExerciseSetData(data.exercise_id, sets, repetitions, weight, userID, authToken);
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
};

// post to exercise sets table
async function postExerciseSetData(exerciseID, sets, repetitions, weight, userID, authToken) {
    if(!userData.data.user) {
        return; 
    } else{
        if (sets === null || sets === undefined) {
            console.error("Error: sets is null or undefined before posting");
            return;
        }

        try {
            
            const response = await fetch("https://rep-journal.vercel.app/exercise-set", {
                method: "POST",
                body: JSON.stringify({
                    exercise_id: exerciseID,
                    sets: Number(sets),
                    repetitions: Number(repetitions),
                    weight: Number(weight),
                    user_id: userID,
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
};

async function getWorkoutByDate(date, authToken) {
    if(!userData.data.user) {
        console.log("invalid user.");
        return;
    } else {

        console.log("trying get workout by date...");
        console.log("auth token from workout by id:", authToken);
        try {
            const response = await fetch(`https://rep-journal.vercel.app/workout/date=${date}`, {
                method: "GET",
                headers: getHeaders(authToken),
            });

            if(!response.ok) {
                throw new Error("Could not fetch resource");
            }

            const data = await response.json();
            console.log(data);

            if(data.length > 0) {
                console.log(data[0].workout_id);
                return data[0].workout_id;
            }
        }
        catch(error) {
            console.error(error);
        }
    }
};

// post to workout table
async function postWorkoutData(date, userID, authToken) {
    if(!userData.data.user) {
        return;
    } else {
        try {
            const response = await fetch("https://rep-journal.vercel.app/workout", {
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
};

// post to workout exercises junction table
async function postWorkoutExerciseJoinData(workoutID, exerciseID, userID, authToken) {
    if(!userData.data.user) {
        return;
    } else {
        try {
            const response = await fetch("https://rep-journal.vercel.app/workout-exercise", {
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
};

// function to get data to popoulate table
async function getExerciseDataByWorkoutID(workoutID, authToken) {
    console.log("workout id from function:", workoutID);
    if(!userData.data.user) {
        console.log("there is no user!");
        return;
    } else {
        try {
            const response = await fetch(`https://rep-journal.vercel.app/workout-exercise/workout-id=${workoutID}`, {
                method: "GET",
                headers: getHeaders(authToken),
            });

            if(!response.ok) {
                throw new Error("Could not fetch exercise data by workout ID");
            }

            const data = await response.json();
            console.log("exercises:", data);
            
            return data;
        }
        catch(error) {
            console.error(error);
        }
    }
};

// functions to put to appropriate tables -> edit data in row
async function updateExerciseByID(exerciseID, exerciseName, sets, repetitions, weight, authToken) {
    if(!userData.data.user) {
        return; 
    } else {
        try {
            const response = await fetch(`https://rep-journal.vercel.app/exercise/id=${exerciseID}`, {
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
};

async function updateExerciseSetByExerciseID(exerciseID, sets, repetitions, weight, authToken) {
    if(!userData.data.user) {
        return;
    } else {
        try {
            const response = await fetch(`https://rep-journal.vercel.app/exercise-set/id=${exerciseID}`, {
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
};

// functions to delete from appropriate tables -> delete data in row
async function deleteExerciseByID(exerciseID, authToken) {
    if(!userData.data.user) {
        return;
    } else {
        try {
            const response = await fetch(`https://rep-journal.vercel.app/exercise/id=${exerciseID}`, {
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
};

async function deleteExerciseSetDataByID(exerciseID, authToken) {
    if(!userData.data.user) {
        return;
    } else {
        try {
            const response = await fetch(`https://rep-journal.vercel.app/exercise-set/id=${exerciseID}`, {
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
};

async function deleteWorkoutByDate(date, authToken) {
    if(!userData.data.user) {
        return;
    } else {
        try {
            const response = await fetch(`https://rep-journal.vercel.app/workout/date=${date}`, {
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
};

async function postUser(email, username, password) {

    console.log(email);
    console.log(username);
    console.log(password);
    try {
        const response = await fetch(`https://rep-journal.vercel.app/signup`, {
            method: "POST",
            body: JSON.stringify({
                email: email,
                username: username, 
                password: password
            }),
            headers: getHeaders(),
        });

        if(!response.ok) {
            console.log(response);
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
};

async function loginUser(email, password) {

    try {
        const response = await fetch(`https://rep-journal.vercel.app/login`, {
            method: "POST",
            body: JSON.stringify({
                email: email,
                password: password,
            }),
            headers: getHeaders(),
        });

        if(!response.ok) {
            throw new Error(`Could not login`);
        }


        const data = await response.json();
        console.log(data);
        console.log(data.session.access_token);
        console.log(data.session.refresh_token);

        await supabase.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
        });

        loginDialog.close();
        location.reload();
    } catch (error) {
        console.error(error);
    }
};

async function logout() {
    try {
        console.log("Logging Out.");
        const { error } = await supabase.auth.signOut();
        if(error) throw error;
        location.reload();
    } catch(error) {
        console.error("Logout error:", error.message);
    }
};

async function tryLogin() {
    try {
        await loginUser(loginUsernameInput.value, loginPasswordInput.value);
    } catch(error) {
        console.error(error);
    }
};

async function trySignUp() {

    const email = signupEmailInput.value.trim();
    const username = signupUsernameInput.value.trim();
    const password = signupPasswordInput.value.trim();
    let usernameCount;
    let emailCount;

    try {
        const response = await fetch(`https://rep-journal.vercel.app/user/username=${username}`, {
            method: "GET",
            headers: getHeaders(),
        });

        if(!response.ok) {
            throw new Error("Could not fetch username");
        }

        usernameCount = await response.json();
        usernameCount = usernameCount.count;
        console.log("username count: ", usernameCount);

    } catch(error) {
        console.error(error);
    }

    try {
        const response = await fetch(`https://rep-journal.vercel.app/user/email=${email}`, {
            method: "GET",
            headers: getHeaders(),
        });

        if(!response.ok) {
            throw new Error("Could not fetch email");
        }

        emailCount = await response.json();
        emailCount = emailCount.count;
        console.log("email count: ", emailCount);

    } catch(error) {
        console.error(error);
    }

    if((usernameCount === 0) && (emailCount === 0)) {
        console.log("trying post user");
        console.log(email);
        console.log(username);
        console.log(password);
        try {
            await postUser(email, username, password);
        } catch(error) {
            console.error(error);
        }
    } else {
        alert("Username or email error");
    }
};

async function emailExists(email) {
    let emailCount;

    try {
        const response = await fetch(`https://rep-journal.vercel.app/user/email=${email.trim()}`, {
            method: "GET",
            headers: getHeaders(),
        });

        if(!response.ok) {
            throw new Error("Could not fetch email");
        }

        emailCount = await response.json();
        emailCount = emailCount.count;

    } catch(error) {
        console.error(error);
    }

    return emailCount === 1;
};

async function usernameExists(username) {
    let usernameCount;
    try {
        const response = await fetch(`https://rep-journal.vercel.app/user/username=${username.trim()}`, {
            method: "GET",
            headers: getHeaders(),
        });

        if(!response.ok) {
            throw new Error("Could not fetch email");
        }

        usernameCount = await response.json();
        usernameCount = usernameCount.count;

    } catch(error) {
        console.error(error);
    }

    return usernameCount === 1;
}

function createDebouncedInputChecker(checkAvailability, target, delay = 50) {
    return debounce(async (input) => {

        const currentValue = target.value.trim();
        console.log("current value:", currentValue);

        if(currentValue === "" || currentValue.length === 0) {
            return;
        }

        if(input !== "" && input !== null && input !== undefined && input.length !== 0) {
            const exists = await checkAvailability(input);
            if(exists) {
                target.classList.add("remove-outline");
                target.classList.remove("valid");
                target.classList.add("invalid");
                console.log(target);
                if(target.id === "signup-email-input") {
                    invalidEmailText.classList.remove("hidden");
                } else if(target.id === "signup-username-input") {
                    invalidUsernameText.classList.remove("hidden");
                }
            } else {
                target.classList.add("remove-outline");
                target.classList.remove("invalid");
                target.classList.add("valid");
                if(target.id === "signup-email-input") {
                    invalidEmailText.classList.add("hidden");
                } else if(target.id === "signup-username-input") {
                    invalidUsernameText.classList.add("hidden");
                }
                console.log(target);
            }
        } else {
            if(target.id === "signup-email-input") {
                invalidEmailText.classList.remove("hidden");
            } else if(target.id === "signup-username-input") {
                invalidUsernameText.classList.remove("hidden");
            }
            target.classList.add("invalid");
            target.classList.remove("valid");
            target.classList.add("remove-outline");
            console.log(target);
        }
    }, delay);
}; 

function getHeaders(authToken = null) {
    const headers = {
        "Content-Type": "application/json",
    };

    if(authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
    };

    return headers;
};

const pageAccessedByReload = (
    (window.performance.navigation && window.performance.navigation.type === 1) ||
      window.performance
        .getEntriesByType('navigation')
        .map((nav) => nav.type)
        .includes('reload')
);

window.addEventListener("resize", () => {
    location.reload();
})

function debounce(callback, wait) {
    let timeoutId = null;

    return(...args) => {
        window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => {
            callback(...args);
        }, wait);
    };
};