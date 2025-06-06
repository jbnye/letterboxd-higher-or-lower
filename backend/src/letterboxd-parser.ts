import * as cheerio from "cheerio";
import fs from "fs/promises";
import path from "path";
import axios from "axios";

const HTML_DIR = "./cache";
const POSTER_DIR = "./posters";


interface slugsAndRatings{
    slug: string,
    averageRating: number
}

async function extractSlugsAndRatingsFromFiles(): Promise<slugsAndRatings[]>{

    const files = await fs.readdir(HTML_DIR);
    const slugsAndRatings: slugsAndRatings[] = [];

    try{
        for(const file of files.filter(f=>f.endsWith("html"))){
            const html = await fs.readFile(path.join(HTML_DIR, file), "utf-8");
            const $ = cheerio.load(html);

            $('li.listitem.poster-container[data-average-rating]').each((i, element) => {
                const averageRating: number = parseFloat($(element).attr("data-average-rating") || '0');
                const slug: string = $(element).find(("div[data-film-slug]")).attr('data-film-slug') || 'empty';
                //console.log(slug,averageRating);
                slugsAndRatings.push({
                    slug: slug,
                    averageRating: averageRating,
                });
            })
        }
    } catch (error){
        console.log(error);
    }
    return slugsAndRatings;
}

extractSlugsAndRatingsFromFiles();