import path from "path";
import { extractSlugsAndRatingsFromFiles } from "./letterboxd-parser";
import {filmData, createLetterboxdCsvWriter, parseCSVToMap} from "./helperFunctions";


const OLD_CSV_PATH = path.join(__dirname, "..", "CSV", "letterboxd-films.csv");
const Rating_SORTED_CSV_PATH = path.join(__dirname, "..", "CSV", "popularity-sorted-letterboxd.csv");

async function sortByRating(){
    const csvWriter = createLetterboxdCsvWriter(Rating_SORTED_CSV_PATH);
    const filmMap: Map<string, filmData> = await parseCSVToMap(OLD_CSV_PATH);
    const filmDataArray: filmData[] = Array.from(filmMap.values());
    const sortedByRatingFilms: filmData[] = mergeSortByRating(filmDataArray);
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