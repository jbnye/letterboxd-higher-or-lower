import fs from "fs/promises";
import path from "path";
import { createObjectCsvWriter } from "csv-writer";
import { extractSlugsAndRatingsFromFiles } from "./letterboxd-parser";
import {parseCSVToMap, filmData} from "./helperFunctions";

const OLD_CSV_PATH = path.join("CSV", "letterboxd-films.csv");
const POPULARITY_SORTED_CSV_PATH = path.join("CSV", "popularity-sorted-letterboxd.csv");




async function sortedByPopularityCSV(orderedSlugs: string[], csvMap: Map<string, filmData>) {

    const csvWriter = createObjectCsvWriter({
        path: POPULARITY_SORTED_CSV_PATH,
        header: [
            {id: "slug", title: "Slug"},
            {id: "averageRating", title: "Average Rating"},
            {id: "title", title: "Title"},
            {id: "year", title: "Year"},
            {id: "posterUrl", title: "Poster URL"}
        ]
    });
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
    const filePath = path.join(__dirname, "CSV", "rating-sorted-letterboxd.csv");
    const csvMap = await parseCSVToMap(filePath);
    const orderedSlugs = (await extractSlugsAndRatingsFromFiles()).map(f => f.slug);
    await sortedByPopularityCSV(orderedSlugs, csvMap);

}

main().catch(console.error);