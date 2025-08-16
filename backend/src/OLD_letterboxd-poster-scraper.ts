import axios from "axios";
import fs from "fs/promises";
import UserAgent from 'user-agents';
import * as cheerio from "cheerio";
import path from "path";
import { setTimeout } from 'timers/promises';
import { extractSlugsAndRatingsFromFiles, slugsAndRatings } from './letterboxd-parser';
import {createLetterboxdCsvWriter, parseCSVToMap, filmData} from "./helperFunctions";


const csvDir = path.join(__dirname, "..", "CSV");
const postersDir = path.join(__dirname, "..", "posters");



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

    //CHECK TO SEE IF IT IS ALREAYD IN THIS FILE
    const CSV_FILE_PATH = path.join(csvDir, "letterboxd-films.csv");
    //WRITE TO THIS FILE
    const CSV_WRITE_PATH = path.join(csvDir, "filtered-popularity-sorted-letterboxd.csv" )
    const csvWriter = createLetterboxdCsvWriter(CSV_WRITE_PATH);
    const filmResults = [];
    const batch = [];
    const batchSize = 50;
    const userAgent = new UserAgent().toString();
    const filmDataMap: Map<string, filmData> = await parseCSVToMap(CSV_FILE_PATH);
    console.log(filmDataMap);
    for(const film of slugsAndRatings){

        try{
            const filmDataGet: filmData | undefined = filmDataMap.get(film.slug);
            if(filmDataGet){
                console.log(`🟢 Skipping ${film.slug}, already in CSV.`);
                batch.push(filmDataGet);
                continue;
            }
            const imagePath = path.join(postersDir, `${film.slug}.jpg`);
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

            if (!frameTitle.endsWith(')') || frameTitle.length < 7) {
            console.warn(`❌ Malformed title: "${frameTitle}"`);
            break;
            }

            // Extract the year from the last 6 characters: " (YYYY)"
            const year = frameTitle.slice(-5, -1); // e.g., "2014"

            // Extract the title by removing " (YYYY)" from the end
            const title = frameTitle.slice(0, -7).trim(); // Remove space + (YYYY)

            const posterURL = $('img.image:not(.-empty-poster-image)').attr('src') || '';

            if(posterURL){
                const imagePath = path.join(postersDir,  `${film.slug}.jpg`);
                await downloadImage(posterURL, imagePath, userAgent, film.slug);
            }

            const filmDataHelper = {
                slug: film.slug,
                averageRating: film.averageRating,
                title: title.trim(),
                year: year,
                posterURL: posterURL
            }
          
            filmResults.push(filmDataHelper);
            batch.push(filmDataHelper);

            if (batch.length >= batchSize) {
                await csvWriter.writeRecords(batch);
                console.log(`✅ Wrote batch of ${batch.length} to CSV.`);
                batch.length = 0; 
            }

            console.log(`Processed: ${title} (${year})`);
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
    //WHERE TO PARSE FROM CACHE
    const dirPath = path.join(__dirname, "..", "cache", "filteredLetterboxdPopularPages")
    const films: slugsAndRatings[] = await extractSlugsAndRatingsFromFiles(dirPath);
    console.log("Parsed Files...");
    await LBPosterScraper(films);
}

main().catch(console.error);
