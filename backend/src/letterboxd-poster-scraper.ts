import axios from "axios";
import fs from "fs/promises";
import UserAgent from 'user-agents';
import * as cheerio from "cheerio";
import path from "path";
import { setTimeout } from 'timers/promises';
import { createObjectCsvWriter } from 'csv-writer';
import { extractSlugsAndRatingsFromFiles, slugsAndRatings } from './letterboxd-parser';


const csvWriter = createObjectCsvWriter({
    path: './CSV/letterboxd-films.csv',
    header: [
        { id: 'slug', title: 'Slug' },
        { id: 'averageRating', title: 'Average Rating' },
        { id: 'title', title: 'Title' },
        { id: 'year', title: 'Year' },
        { id: 'posterUrl', title: 'Poster URL' }
    ],
    append: true 
});


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
    const filmResults = [];
    const batch = [];
    const batchSize = 50;
    const userAgent = new UserAgent().toString();
    for(const film of slugsAndRatings){

        try{
            const imagePath = path.join('./posters', `${film.slug}.jpg`);
            try {
                await fs.access(imagePath);
                console.log(`🟡 Skipping ${film.slug}, poster already exists.`);
                continue; // Skip to next film
            } catch {
                // File doesn't exist, continue scraping
            }
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

            const imageUrl = $('img.image:not(.-empty-poster-image)').attr('src') || '';

            if(imageUrl){
                const imagePath = path.join('./posters', `${film.slug}.jpg`);
                await downloadImage(imageUrl, imagePath, userAgent, film.slug);
            }

            const filmData = {
                slug: film.slug,
                averageRating: film.averageRating,
                title: title.trim(),
                year: trimedYear,
                posterUrl: imageUrl
            }
          
            filmResults.push(filmData);
            batch.push(filmData);

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
    const films: slugsAndRatings[] = await extractSlugsAndRatingsFromFiles();
    console.log("Parsed Files...");
    await LBPosterScraper(films);
}

main().catch(console.error);

