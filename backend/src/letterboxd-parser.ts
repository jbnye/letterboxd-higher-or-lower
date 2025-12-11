import * as cheerio from "cheerio";
import fs from "fs/promises";
import path from "path";

// const HTML_DIR = "./cache/letterboxdPopularPages";


export interface slugsAndRatings{
    slug: string,
    averageRating: string,
    category?: string,
    cacheBuster: string,
}

export async function extractSlugsAndRatingsFromFiles(dirPath:string): Promise<slugsAndRatings[]>{
    const slugsAndRatings: slugsAndRatings[] = [];

    try{
        for(let i = 1; i<= 139; i++){
            const fileName = `page${i}.html`;
            const fullPath = path.join(dirPath, fileName);
            const html = await fs.readFile(fullPath, "utf-8");
            const $ = cheerio.load(html);

            $('li.posteritem[data-average-rating]').each((_, element) => {
                const averageRating: string = $(element).attr("data-average-rating") || '0';
                const slug: string = $(element).find("div[data-item-slug]").attr('data-item-slug') || 'empty';
                const cacheBuster = JSON.parse($(element).find("div[data-resolvable-poster-path]").attr("data-resolvable-poster-path")!).cacheBustingKey;
                //console.log(slug, averageRating);
                slugsAndRatings.push({
                    slug: slug,
                    averageRating: averageRating,
                    cacheBuster: cacheBuster,
                });
            });

            console.log("parsed: ", fileName);
        }
    } catch (error){
        console.log(error);
    }
    return slugsAndRatings;
}

