import axios from "axios";
import fs from "fs/promises";
import UserAgent from 'user-agents';
import * as cheerio from "cheerio";
import path from "path";
import { setTimeout } from 'timers/promises';
import { extractSlugsAndRatingsFromFiles, slugsAndRatings } from './letterboxd-parser';
import { filmData, createLetterboxdCsvWriter, symbols } from "./helperFunctions";

const csvDir = path.join(__dirname, "..", "CSV");


export async function scrapePopularityFromCache(slugsAndRatings: slugsAndRatings[]): Promise<Map<string, filmData>> {
    const userAgent = new UserAgent().toString();
    const films = new Map<string, filmData>();
    const MAX_ATTEMPTS = 3;
    let num = 0;

    for (const film of slugsAndRatings) {
        let attempt = 1;
        while (attempt <= MAX_ATTEMPTS) {
            try {
                const url = `https://letterboxd.com/csi/film/${film.slug}/stats/`;
                const response = await axios.get(url, {
                    headers: {
                        "User-Agent": userAgent,
                        'Referer': `https://letterboxd.com/film/${film.slug}/`
                    }
                });

                if (response.status !== 200) {
                    console.warn(`Non-200 response for ${film.slug}: ${response.status}`);
                    attempt++;
                    await setTimeout(2000);
                    continue;
                }

                const $ = cheerio.load(response.data);
                const tooltips = $('a.tooltip');
                let watchedCount: string | null = null;

                tooltips.each((_, el) => {
                    const title = $(el).attr('title') ?? '';
                    const match = title.match(/Watched by ([\d,]+)/);
                    if (match && match[1]) {
                        watchedCount = match[1].replace(/,/g, '');
                        return false;
                    }
                });

                if (!watchedCount) {
                    console.log(`Could not find watched count for ${film.slug}`);
                    break;
                }

                const ariaLabelTitle = $('div.production-statistic-list').attr('aria-label') || "";
                if (!ariaLabelTitle.endsWith(')') || ariaLabelTitle.length < 7) {
                    console.warn(`Malformed title for ${film.slug}: "${ariaLabelTitle}"`);
                    break;
                }

                const rawTitleAndYear = ariaLabelTitle.slice(15);
                const year = ariaLabelTitle.slice(-5, -1);
                const title = rawTitleAndYear.slice(0, -7).trim();

                films.set(film.slug, {
                    slug: film.slug,
                    averageRating: film.averageRating,
                    watchedNumber: watchedCount,
                    title,
                    year,
                    category: film.category || "",
                    posterURL: ""
                });

                num++;
                console.log(`Added slug: ${film.slug} - ${watchedCount}: number: ${num}`);
                break; 

            } catch (error) {
                console.warn(`Error fetching ${film.slug}, attempt ${attempt + 1}:`, error);
                attempt++;
                await setTimeout(2000 + Math.random() * 1000);
            }
        }
    }

    return films;
}

if (require.main === module) {
    (async () => {
        // DIR PATH FOR THE CACHE
        const filePath = path.join(__dirname, "..", "cache", "filteredLetterboxdPopularPages");

        //FILE FOR CSV TO WRITE TO
        const csvWriter = createLetterboxdCsvWriter('../CSV/filtered-popularity-sorted-data-no-poster.csv');

        const slugsAndRatings: slugsAndRatings [] =  await extractSlugsAndRatingsFromFiles(filePath);
        const films: Map<string, filmData> = await scrapePopularityFromCache(slugsAndRatings);
        // await csvWriter.writeRecords(films);
    })();

}   