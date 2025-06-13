import * as cheerio from "cheerio";
import fs from "fs/promises";
import path from "path";

// const HTML_DIR = "./cache/letterboxdPopularPages";


export interface slugsAndRatings{
    slug: string,
    averageRating: number
}

export async function extractSlugsAndRatingsFromFiles(dirPath:string): Promise<slugsAndRatings[]>{

    const files = await fs.readdir(dirPath);
    console.log(`Found ${files.length} files in ${dirPath}`);
    const slugsAndRatings: slugsAndRatings[] = [];

    try{
        for(const file of files.filter(f=>f.endsWith("html")).sort()){
            const html = await fs.readFile(path.join(dirPath, file), "utf-8");
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

