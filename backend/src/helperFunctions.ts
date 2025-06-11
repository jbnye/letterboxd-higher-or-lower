import { createObjectCsvWriter } from 'csv-writer';
import * as fs from "fs/promises";
import path from 'path';

export interface filmData {
    slug: string,
    averageRating: number,
    title: string,
    year: string,
    posterUrl: string
}

// CSV Writer 
export function createLetterboxdCsvWriter(outputPath: string, append: boolean = false) {
    return createObjectCsvWriter({
        path: outputPath,
        header: [
            { id: 'slug', title: 'Slug' },
            { id: 'averageRating', title: 'Average Rating' },
            { id: 'title', title: 'Title' },
            { id: 'year', title: 'Year' },
            { id: 'posterUrl', title: 'Poster URL' }
        ],
        append
    });
}

export async function parseCSVToMap(filePath: string): Promise<Map<string, filmData>> {

    const allLines = await fs.readFile(filePath, "utf-8");
    const rows = allLines.trim().split("\n");
    const map = new Map<string, filmData>();

    for(const row of rows.slice(0)){
        const [slugRaw, stringAverageRating, title, year, posterUrl] = row.split(",");
        const slug = slugRaw.replace(/^"|"$/g, "").trim();
        const averageRating: number = parseFloat(stringAverageRating);
        map.set(slug, {slug, averageRating, title, year, posterUrl});
    }
    return map;

}