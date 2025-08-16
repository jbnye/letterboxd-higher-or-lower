import axios from "axios";
import fs from "fs/promises";
import UserAgent from 'user-agents';
import * as cheerio from "cheerio";
import path from "path";
import { setTimeout } from 'timers/promises';
import { extractSlugsAndRatingsFromFiles, slugsAndRatings } from './letterboxd-parser';
import { filmData, createLetterboxdCsvWriter, symbols } from "./helperFunctions";

const csvDir = path.join(__dirname, "..", "CSV");


export async function scrapePopularityFromCache(slugsAndRatings: slugsAndRatings[]): Promise<Map <string, filmData>> {
    const userAgent = new UserAgent().toString();
    let num = 0;
    const films = new Map<string, filmData>();
    try{
        for(const film of slugsAndRatings){
            const url = `https://letterboxd.com/csi/film/${film.slug}/stats/`
            const response = await axios.get(url, {
                headers: {
                    "User-Agent": userAgent,
                    'Referer': `https://letterboxd.com/film/${film.slug}/`
                }
            });
            if (response.status !== 200) {
                console.warn(`${symbols.warn} Non-200 response for ${film.slug}: ${response.status}`);
                await setTimeout(10000);
                continue;
            }

            const $ = cheerio.load(response.data);
            const tooltips = $('a.tooltip');
            let watchedCount: string | null = null;

            // Look for the one with "Watched by" in the title
            tooltips.each((_, el) => {
                const title = $(el).attr('title') ?? '';
                const match = title.match(/Watched by ([\d,]+)/);
                if (match && match[1]) {
                    watchedCount = match[1].replace(/,/g, '');
                    return false;
                }
            });

            if (!watchedCount) {
                console.log(`${symbols.fail} Could not find watched count`);
                break;
            }
            //EXTRACTING TITLE FROM DIV WITH ARIA-LABEL WITH THE TITLE
            const ariaLabelTitle = $('div.production-statistic-list').attr('aria-label') || "";

            if (!ariaLabelTitle.endsWith(')') || ariaLabelTitle.length < 7) {
                console.warn(`${symbols.fail} Malformed title: "${ariaLabelTitle}"`);
                break;
            }
            const rawTitleAndYear = ariaLabelTitle.slice(15);
            console.log(rawTitleAndYear);
            // Extract the year from the last 6 characters: " (YYYY)"
            const year = ariaLabelTitle.slice(-5, -1);

            // Extract the title by removing " (YYYY)" from the end
            const title = rawTitleAndYear.slice(0, -7).trim();
            const newFilm: filmData = {
                slug: film.slug,
                averageRating: film.averageRating,
                watchedNumber: watchedCount, 
                title: title,
                year: year,
                category: film.category || "",
                posterURL: ""
            };
            films.set(film.slug, newFilm);
            num++;
            console.log(`Added slug: ${film.slug} - ${watchedCount}: number: ${num}`);
        }
        return films;

    } catch (error){
        throw error;
    }
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