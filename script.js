import { getFromDB, insertToDB } from "./db.js";

const dateDisplay = document.querySelector("#date-display");
const addExerciseLink = document.querySelector(".add-exercise");
const strengthContainer = document.querySelector(".strength-container");

const exerciseFormTemplate = document.querySelector("#exercise-form-template")
const exerciseForm = exerciseFormTemplate.content.cloneNode(true);

let currentDate = new Date().toJSON().slice(0, 10);

document.addEventListener("click", (event) => {
    if(event.target.id === "add-entered-data") {
        console.log("HERE");
    }
})

addExerciseLink.addEventListener("click", () => {
    strengthContainer.appendChild(exerciseForm);
});


dateDisplay.value = currentDate;