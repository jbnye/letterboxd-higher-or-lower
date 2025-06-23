import { createObjectCsvWriter } from 'csv-writer';
import { parse } from 'csv-parse/sync';
import * as fs from "fs/promises";
//import path from 'path';

export interface filmData {
    slug: string,
    averageRating: number,
    watchedNumber: number, 
    title: string,
    year: string,
    category: string
    posterUrl: string

}
export const symbols = {
    success: "✅",
    fail: "❌",
    warn: "⚠️",
    file: "📁",
    retry: "🔁",
    time: "🕐"
};

// CSV Writer 
export function createLetterboxdCsvWriter(outputPath: string, append: boolean = false) {
    return createObjectCsvWriter({
        path: outputPath,
        header: [
            { id: 'slug', title: 'Slug'},
            { id: 'averageRating', title: 'Average Rating'},
            { id: 'watchedNumber', title: 'Watched Number'},
            { id: 'title', title: 'Title'} ,
            { id: 'year', title: 'Year'},
            { id: 'category', title: 'Category'},
            { id: 'posterUrl', title: 'Poster URL'}
        ],
        append
    });
}

export async function parseCSVToMap(filePath: string): Promise<Map<string, filmData>> {
    const fileContent = await fs.readFile(filePath, "utf-8");

    const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
    });

    const map = new Map<string, filmData>();

    for (const row of records) {
        const slug = row["Slug"]?.trim();
        const averageRating = parseFloat(row["Average Rating"]);

        if (!slug || isNaN(averageRating)) {
            console.warn(`${symbols.fail} Skipping invalid row: ${JSON.stringify(row)}`);
            continue;
        }

        map.set(slug, {
            slug,
            averageRating,
            watchedNumber: row["Watched Number"],
            title: row["Title"],
            year: row["Year"],
            category: row["Category"],
            posterUrl: row["Poster URL"]
        });
    }

    return map;

    // const allLines = await fs.readFile(filePath, "utf-8");
    // const rows = allLines.trim().split("\n");
    // const map = new Map<string, filmData>();

    // for(const row of rows.slice(0)){
    //     const [slugRaw, stringAverageRating, title, year, posterUrl] = row.split(",");
    //     const slug = slugRaw.replace(/^"|"$/g, "").trim();
    //     const averageRating: number = parseFloat(stringAverageRating);
    //     map.set(slug, {slug, averageRating, title, year, posterUrl});
    // }
    //return map;
}
