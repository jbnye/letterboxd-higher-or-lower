import { parse } from 'csv-parse/sync';
import * as fs from 'fs/promises';
import path from 'path';

interface CsvRow {
  Slug: string;
  "Average Rating": string;  // still string because CSV fields are parsed as strings
  "Watched Number": string;
  Title: string;
  Year: string;
  Category: string;
  "Poster URL": string;
}
export async function validateCSV(filePath: string): Promise<string[]> {
    const content = await fs.readFile(filePath, 'utf-8');

    const records: CsvRow[] = parse(content, {
        columns: true,
        skip_empty_lines: true,
        trim: true
    });

    let passed = 0;
    let failed = 0;
    const badSlugs: string[] = [];

    for (const [index, row] of records.entries()) {
        const errors: string[] = [];

        const slug = row["Slug"];
        const rating = parseFloat(row["Average Rating"]);
        const watchedCount = Number(row["Watched Number"]);
        const title = row["Title"];
        const year = row["Year"];
        const category = row["Category"];
        const posterUrl = row["Poster URL"];

        // Slug check found 3 films that have their slug set to their film id actually in letterboxd
        if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
            errors.push(`Invalid slug: "${slug}"`);
        }

        // Rating check
        if (isNaN(rating) || rating < 0 || rating > 5) {
            errors.push(`Invalid rating: "${row["Average Rating"]}"`);
        }

        // Wacthed Count check
        if (isNaN(watchedCount) || watchedCount <= 0) {
            errors.push(`Invalid watched count: "${row["Watched Number"]}"`);
        }

        // Title check
        if (!title || typeof title !== "string" || title.trim() === "") {
            errors.push(`Invalid title: "${title}"`);
        }

        // Year check
        if (!/^\d{4}$/.test(year)) {
            errors.push(`Invalid year: "${year}"`);
        }

        //Category check
        if(category !== "movie" && category!== "other"){
            errors.push(`Invalid category: ${category}`);
        }

        // Poster URL check
        if (!posterUrl || !posterUrl.includes(".jpg")) {
            errors.push(`Invalid poster URL: "${posterUrl}"`);
        }

        if (errors.length > 0) {
            failed++;
            badSlugs.push(slug);
            console.log(`❌ Row ${index + 2} failed:\n  ` + errors.join("\n  "));
        } else {
            passed++;
        }
    }

    console.log(`\n✅ ${passed} rows passed`);
    console.log(`❌ ${failed} rows failed`);

    // Write bad slugs to file
    const outPath = path.join(__dirname, "..", "..", "CSV", "failed-slugs.txt");
    await fs.writeFile(outPath, badSlugs.join("\n"));
    console.log(`\n📁 Wrote ${badSlugs.length} failed slugs to: ${outPath}`);

    return badSlugs;
}


if (require.main === module) {
    const filePath = path.join(__dirname, "..", "..", "CSV", "ALLFILMS.csv");
    validateCSV(filePath);
}