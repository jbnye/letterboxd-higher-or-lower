import axios from "axios";
import fs from "fs/promises";
import UserAgent from 'user-agents';
import * as cheerio from "cheerio";
import path from "path";
import { setTimeout } from 'timers/promises';

interface slugsAndRatings {
    slug: string,
    averageRating: number
}


async function downloadImage(url: string, filePath: string){
    try{
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        });
        await fs.writeFile(filePath, response.data);
        console.log(`Downloaded: ${filePath}`);

    } catch (error){
        console.log(`Failed to download ${url}:`, error);
        throw error;
    }
}


async function LBPosterScraper(slugsAndRatings: slugsAndRatings[]){
    const results = []
    const userAgent = new UserAgent().toString();
    for(const film of slugsAndRatings){
        try{
            const url = `https://letterboxd.com/ajax/poster/film/${film.slug}/std/292730/1000x1500/`;
            const response = await axios.get(url, {
                headers: {
                    "User-Agent": userAgent
                }
            })
            const $ = cheerio.load(response.data);
            //console.log(response.data);
            const frameTitle = $('spawn.frame').attr('title') || "";
            const [title,year] = frameTitle.split(' (');
            const trimedYear = year ? year.replace(')', '') : '';

            const imageUrl = $('img.image:not(.-empty-poster-image').attr('src') || '';

            if(imageUrl){
                const imagePath = path.join('./posters', `${film.slug}.jpg`);
                await downloadImage(imageUrl, imagePath);
            }

            results.push({
                slug: film.slug,
                title: title.trim(),
                year: trimedYear,
                posterUrl: imageUrl

            });

            console.log(`Processed: ${title} (${trimedYear})`);
            const delayTimer: number = Math.floor((Math.random() * 1000) + 0);
            await setTimeout(delayTimer);

        } catch (error){
            console.log(error);
            throw error;
        }
    }

}
