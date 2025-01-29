import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import { DATABASE_URL, DATABASE_SECRET_KEY } from "./config.js";

const supabase = createClient(DATABASE_URL, DATABASE_SECRET_KEY);

export async function getFromDB() {
    let {data, error} = await supabase
    .from("test")
    .select("*");

    if(error) {
        console.error("Error getting table: ", error.message);
        return [];
    }
    return data;
}

export async function insertToDB(string, date) {
    const {data, error} = await supabase
    .from("test")
    .insert([
        {test: string, date},
    ])
    .select();
}