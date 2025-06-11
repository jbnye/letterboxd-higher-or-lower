import fs from "fs/promises";
import path from "path";
import { createObjectCsvWriter } from "csv-writer";
import { extractSlugsAndRatingsFromFiles } from "./letterboxd-parser";
import {parseCSVToMap, filmData, createLetterboxdCsvWriter} from "./helperFunctions";

const OLD_CSV_PATH = path.join("CSV", "letterboxd-films.csv");
const POPULARITY_SORTED_CSV_PATH = path.join("CSV", "popularity-sorted-letterboxd.csv");




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
    // await fs.mkdir('./CSV/popularity-sorted-letterboxd.csv', { recursive: true });
    const filePath = path.join(__dirname, "..", "CSV", "rating-sorted-letterboxd.csv");
    const csvMap = await parseCSVToMap(filePath);
    const orderedSlugs = (await extractSlugsAndRatingsFromFiles()).map(f => f.slug);
    await sortedByPopularityCSV(orderedSlugs, csvMap);

}

main().catch(console.error);