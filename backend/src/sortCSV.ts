import fs from "fs/promises";
import path from "path";
import { createObjectCsvWriter } from "csv-writer";
import { extractSlugsAndRatingsFromFiles } from "./letterboxd-parser";
import {parseCSVToMap, filmData, createLetterboxdCsvWriter} from "./helperFunctions";

// WRITE TO THIS CSV
const POPULARITY_SORTED_CSV_PATH = path.join(__dirname, "..", "CSV", "filtered-popularity-sorted-letterboxd.csv");
// SEARCH THIS FILE FOR INFO FOR THE NEW CSV
const filePath = path.join(__dirname, "..", "CSV", "filtered-popularity-letterboxd.csv");
//PARSE THIS CACHED HTML FOLDER
const dirPath = path.join(__dirname, "..", "cache", "filteredLetterboxdPopularPages");



async function sortedByPopularityCSV(orderedSlugs: string[], csvMap: Map<string, filmData>) {

    const csvWriter = createLetterboxdCsvWriter(POPULARITY_SORTED_CSV_PATH);
    const sortedRows: filmData[] = [];

    for(const slug of orderedSlugs){
        const row = csvMap.get(slug);
        if(row){
            sortedRows.push(row);
        }
        else{
            console.warn(`⚠️ Skipping missing slug: ${slug}`);
        }
    }

    await csvWriter.writeRecords(sortedRows);
    console.log(`✅ Wrote ${sortedRows.length} records to ${POPULARITY_SORTED_CSV_PATH}`);

}

async function main(){

    const csvMap = await parseCSVToMap(filePath);
    const orderedSlugs = (await extractSlugsAndRatingsFromFiles(dirPath)).map(f => f.slug);
    await sortedByPopularityCSV(orderedSlugs, csvMap);

}

main().catch(console.error);