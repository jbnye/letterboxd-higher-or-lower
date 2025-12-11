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


export async function LBPosterScraper(slugsAndRatings: slugsAndRatings[]) {
    const userAgent = new UserAgent().toString();
    const postersMap = new Map<string, string>();

    try {
        for (const film of slugsAndRatings) {
            const postersPath = path.join(postersDir, `${film.slug}.jpg`);
            const jsonURL = `https://letterboxd.com/film/${film.slug}/poster/std/1000/?k=${film.cacheBuster}`;

            let posterURL: string | undefined;
            try {
                const response = await axios.get(jsonURL, {
                    headers: {
                        "User-Agent": userAgent,
                        "Referer": `https://letterboxd.com/film/${film.slug}/`
                    }
                });

                posterURL = response.data?.url;
                if (!posterURL) {
                    console.warn(`⚠️ No poster URL found in JSON for ${film.slug}`);
                    continue;
                }
            } catch (err) {
                console.warn(`⚠️ Failed to fetch poster JSON for ${film.slug}`);
                continue;
            }

            postersMap.set(film.slug, posterURL);

            let existsLocally = false;
            try {
                await fs.access(postersPath);
                existsLocally = true;
            } catch {}

            if (existsLocally) {
                console.log(`✅ Poster already exists locally for ${film.slug}. Skipping download.`);
                continue;
            }

            try {
                await downloadImage(posterURL, postersPath, userAgent, film.slug);
                console.log(`✅ Downloaded poster for ${film.slug}`);
            } catch (err) {
                console.warn(`⚠️ Failed to download poster for ${film.slug}`);
                continue;
            }
        }
    } catch (error) {
        console.error("Scraper error:", error);
        throw error;
    }

    return postersMap;
}
