import fs from "fs/promises";
import path from "path";
import { createObjectCsvWriter } from "csv-writer";
import { extractSlugsAndRatingsFromFiles } from "./letterboxd-parser";
import {filmData, createLetterboxdCsvWriter} from "./helperFunctions";


const OLD_CSV_PATH = path.join("CSV", "letterboxd-films.csv");
const Rating_SORTED_CSV_PATH = path.join("CSV", "popularity-sorted-letterboxd.csv");
'./CSV/rating-sorted-letterboxd.csv'

async function sortByRating(){
    const csvWriter = createLetterboxdCsvWriter('./CSV/rating-sorted-letterboxd.csv');
    const data = await fs.readFile(OLD_CSV_PATH, "utf-8");
    const rows = data.trim().split("\n").slice(0);

    const films: filmData[] = rows.map((row) => {
        const [slug, rating, title, year, imageUrl] = row.split(",");
        return{
            slug,
            averageRating: parseFloat(rating),
            title,
            year,
            imageUrl,
        }
    })
    const sortedByRatingFilms: filmData[] = mergeSortByRating(films);
    await csvWriter.writeRecords(sortedByRatingFilms);
}

function mergeSortByRating(films: filmData[]): filmData[]{
    if(films.length<=1)return films;
    const mid = Math.floor(films.length / 2);
    const left = films.slice(0, mid);
    const right = films.slice(mid);
    const sortedLeft = mergeSortByRating(left);
    const sortedRight = mergeSortByRating(right);
    return helperMergeSortByRating(sortedLeft, sortedRight);
}

function helperMergeSortByRating(left: filmData[], right: filmData[]): filmData[] {
    const result: filmData[] = [];
    let i = 0;
    let j = 0;
    while (i < left.length && j < right.length) {
        if(left[i].averageRating < right[j].averageRating){
            result.push(left[i++]);
        }
        else{
            result.push(right[j++]);
        }
    }
    while (i < left.length) result.push(left[i++]);
    while (j < right.length) result.push(right[j++]);
    return result;
}


sortByRating();