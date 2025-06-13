import axios from "axios";
import fs from "fs/promises";
import UserAgent from 'user-agents';
import * as cheerio from "cheerio";
import path from "path";
import { setTimeout } from 'timers/promises';
import { extractSlugsAndRatingsFromFiles, slugsAndRatings } from './letterboxd-parser';
import {createLetterboxdCsvWriter, parseCSVToMap, filmData} from "./helperFunctions";





async function downloadImage(url: string, filePath: string, userAgent: string, slug: string, hasTried = false ){
    try{
        
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Referer': `https://letterboxd.com/film/${slug}/`
            }
        });
        if (response.status !== 200) {
            console.warn(`⚠️ Non-200 response for IMAGE FOR ${slug}: ${response.status}`);
            await setTimeout(10000);
            if(hasTried === false){
            return await downloadImage(url, filePath, userAgent, slug, true);
            }
            throw new Error(`Failed to download after retry: ${slug}`);
        }
        await fs.writeFile(filePath, response.data);
        console.log(`Downloaded: ${filePath}`);

    } catch (error){
        console.log(`Failed to download ${url}:`, error);
        throw error;
    }
}


async function LBPosterScraper(slugsAndRatings: slugsAndRatings[]){
    await fs.mkdir('./CSV', { recursive: true });
    await fs.mkdir('./posters', { recursive: true });
    const CSV_FILE_PATH = path.join(__dirname, "..", "CSV", "popularity-sorted-letterboxd.csv");
    const csvWriter = createLetterboxdCsvWriter('../CSV/filtered-popularity-sorted-letterboxd.csv');
    const filmResults = [];
    const batch = [];
    const batchSize = 50;
    const userAgent = new UserAgent().toString();
    const filmDataMap: Map<string, filmData> = await parseCSVToMap(CSV_FILE_PATH);
    for(const film of slugsAndRatings){

        try{
            const filmDataGet: filmData | undefined = filmDataMap.get(film.slug);
            if(filmDataGet){
                console.log(`🟢 Skipping ${film.slug}, already in CSV.`);
                batch.push(filmDataGet);
                continue;
            }
            const imagePath = path.join('./posters', `${film.slug}.jpg`);
            // try {
            //     await fs.access(imagePath);
            //     console.log(`🟡 Skipping ${film.slug}, poster already exists.`);
            //     continue; 
            // } catch {
            //     // File doesn't exist
            // }
            const url = `https://letterboxd.com/ajax/poster/film/${film.slug}/std/292730/1000x1500/`;
            const response = await axios.get(url, {
                headers: {
                    "User-Agent": userAgent,
                    'Referer': `https://letterboxd.com/film/${film.slug}/`
                }
            })
            if (response.status !== 200) {
                console.warn(`⚠️ Non-200 response for ${film.slug}: ${response.status}`);
                await setTimeout(10000);
                continue;
            }
            const $ = cheerio.load(response.data);
            //console.log(response.data);
            const frameTitle = $('span.frame').attr('title') || "";
            const [title,year] = frameTitle.split(' (');
            const trimedYear = year ? year.replace(')', '') : '';

            const posterUrl = $('img.image:not(.-empty-poster-image)').attr('src') || '';

            if(posterUrl){
                const imagePath = path.join('./posters', `${film.slug}.jpg`);
                await downloadImage(posterUrl, imagePath, userAgent, film.slug);
            }

            const filmDataHelper = {
                slug: film.slug,
                averageRating: film.averageRating,
                title: title.trim(),
                year: trimedYear,
                posterUrl: posterUrl
            }
          
            filmResults.push(filmDataHelper);
            batch.push(filmDataHelper);

            if (batch.length >= batchSize) {
                await csvWriter.writeRecords(batch);
                console.log(`✅ Wrote batch of ${batch.length} to CSV.`);
                batch.length = 0; 
            }

            console.log(`Processed: ${title} (${trimedYear})`);
            const delayTimer: number = Math.floor((Math.random() * 1000) + 0);
            await setTimeout(delayTimer);

        } catch (error){
            console.log(error);
            throw error;
        }
    }
    if (batch.length > 0) {
    await csvWriter.writeRecords(batch);
    }

}

async function main() {
    const dirPath = path.join(__dirname, "..", "cache", "filteredLetterboxdPopularPages")
    const films: slugsAndRatings[] = await extractSlugsAndRatingsFromFiles(dirPath);
    console.log("Parsed Files...");
    await LBPosterScraper(films);
}

main().catch(console.error);

    // const films: slugsAndRatings[] = [
    // { slug: "uhf", averageRating: 3.51 },
    // { slug: "lethal-weapon-4", averageRating: 3.12 },
    // { slug: "harvey", averageRating: 3.98 },
    // { slug: "expend4bles", averageRating: 1.71 },
    // { slug: "all-my-friends-hate-me", averageRating: 3.33 },
    // { slug: "lyle-lyle-crocodile", averageRating: 2.41 },
    // { slug: "opal-2020", averageRating: 4.21 },
    // { slug: "julieta", averageRating: 3.62 },
    // { slug: "zabriskie-point", averageRating: 3.65 },
    // { slug: "puppy-love-2023", averageRating: 2.86 },
    // { slug: "the-last-laugh", averageRating: 4.05 },
    // { slug: "the-hole", averageRating: 4.00 },
    // { slug: "plan-b-2021", averageRating: 3.50 },
    // { slug: "astro-boy", averageRating: 2.84 },
    // { slug: "superman-iii", averageRating: 2.28 },
    // { slug: "the-informant-2009", averageRating: 3.27 },
    // { slug: "coneheads", averageRating: 2.62 },
    // { slug: "system-crasher", averageRating: 3.96 },
    // { slug: "pictures-of-ghosts", averageRating: 3.88 },
    // { slug: "leatherface", averageRating: 2.13 },
    // { slug: "on-swift-horses", averageRating: 3.10 },
    // { slug: "peppermint-candy", averageRating: 3.99 },
    // { slug: "billie-eilish-the-worlds-a-little-blurry", averageRating: 4.08 },
    // { slug: "close-your-eyes-2023", averageRating: 3.98 },
    // { slug: "never-goin-back", averageRating: 3.22 },
    // { slug: "ophelia-2018", averageRating: 3.20 },
    // { slug: "scouts-guide-to-the-zombie-apocalypse", averageRating: 2.98 },
    // { slug: "troll-2022", averageRating: 2.48 },
    // { slug: "the-surfer-2024", averageRating: 3.18 },
    // { slug: "zelig", averageRating: 3.89 },
    // { slug: "mouchette", averageRating: 4.05 },
    // { slug: "bamboozled", averageRating: 3.83 },
    // { slug: "holiday", averageRating: 3.96 },
    // { slug: "adventures-in-babysitting", averageRating: 3.44 },
    // { slug: "mowgli-legend-of-the-jungle", averageRating: 2.73 },
    // { slug: "k-12", averageRating: 3.41 },
    // { slug: "when-life-gives-you-tangerines-2025", averageRating: 4.63 },
    // { slug: "mystery-men", averageRating: 3.08 }
    // ];