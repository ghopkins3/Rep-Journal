import { getFromDB, insertToDB } from "./db.js";

const dateDisplay = document.querySelector("#date-display");

let currentDate = new Date().toJSON().slice(0, 10);

dateDisplay.value = currentDate;

