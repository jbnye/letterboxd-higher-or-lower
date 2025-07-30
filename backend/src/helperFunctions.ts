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
export interface user {
    sub: string,
    name: string,
    email: string,
    picture: string
}
export interface Highscores {
    easy: number,
    medium: number,
    hard: number,
    impossible: number,
}
export const symbols = {
    success: "✅",
    fail: "❌",
    warn: "⚠️",
    file: "📁",
    retry: "🔁",
    time: "🕐"
};
export type Difficulty = "easy" | "medium" |"hard" | "impossible";
 
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
    }) as filmData[];;

    const map = new Map<string, filmData>();

    for (const row of records) {
        const slug = row.slug?.trim();
        const averageRating = parseFloat((Math.round(row.averageRating * 10) / 10).toFixed(1));

        if (!slug || isNaN(averageRating)) {
            console.warn(`${symbols.fail} Skipping invalid row: ${JSON.stringify(row)}`);
            continue;
        }

        map.set(slug, {
            slug,
            averageRating,
            watchedNumber: row.watchedNumber,
            title: row.title,
            year: row.year,
            category: row.category,
            posterUrl: row.posterUrl
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
