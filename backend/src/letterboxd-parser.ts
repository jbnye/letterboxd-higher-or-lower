import * as cheerio from "cheerio";
import fs from "fs/promises";
import path from "path";

// const HTML_DIR = "./cache/letterboxdPopularPages";


export interface slugsAndRatings{
    slug: string,
    averageRating: number,
    category?: string
}

export async function extractSlugsAndRatingsFromFiles(dirPath:string): Promise<slugsAndRatings[]>{
    const slugsAndRatings: slugsAndRatings[] = [];

    try{
        for(let i = 1; i<= 139; i++){
            const fileName = `page${i}.html`;
            const fullPath = path.join(dirPath, fileName);
            const html = await fs.readFile(fullPath, "utf-8");
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
            console.log("parsed: ",fileName);
        }
    } catch (error){
        console.log(error);
    }
    return slugsAndRatings;
}

