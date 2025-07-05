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
            console.warn(`⚠️ Non-200 response for ${slug}: ${response.status}`);
            if (!hasTried) {
                console.log(`🔁 Retrying download for ${slug}...`);
                await setTimeout(10000);
                return await downloadImage(url, filePath, userAgent, slug, true);
            }
            throw new Error(`❌ Failed to download after retry: ${slug}`);
        }
        await fs.writeFile(filePath, response.data);
        console.log(`Downloaded: ${filePath}`);

    } catch (error){
        console.log(`Failed to download ${url}:`, error);
        throw error;
    }
}


export async function LBPosterScraper(slugsAndRatings: slugsAndRatings[]){

    const userAgent = new UserAgent().toString();
    const postersMap = new Map<string, string>();
    try {
        for(const film of slugsAndRatings){
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
                break;
            }

            const $ = cheerio.load(response.data);
            const posterUrl = $('img.image:not(.-empty-poster-image)').attr('src') || '';
            const postersPath = path.join(__dirname, "..", "posters", `${film.slug}.jpg`);
            try {
                await fs.access(postersPath); // Checks if file exists
                console.log(`✅ Poster already exists for ${film.slug}, skipping download.`);
            } catch {
                    await downloadImage(posterUrl, postersPath, userAgent, film.slug);
            }
            postersMap.set(film.slug, posterUrl);
            //const delayTimer: number = Math.floor((Math.random() * 1000) + 0);
            //await setTimeout(delayTimer);
        }
    } catch (error) {
        throw error;
    }
    return postersMap;
}
