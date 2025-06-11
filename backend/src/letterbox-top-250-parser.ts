import * as cheerio from "cheerio";
import fs from "fs/promises";
import path from "path";

const HTML_DIR = "./cache/Top250Pages";
const OLD_CSV_PATH = path.join("CSV", "letterboxd-films.csv");
import {filmData} from "./helperFunctions";


async function parseCSVToMap(): Promise<Map<string, filmData>> {

    const allLines = await fs.readFile(OLD_CSV_PATH, "utf-8");
    const rows = allLines.trim().split("\n");
    const map = new Map<string, filmData>();

    for(const row of rows.slice(0)){
        const [slugRaw, averageRating, title, year, imageUrl] = row.split(",");
        const slug = slugRaw.replace(/^"|"$/g, "").trim();
        map.set(slug, {slug, averageRating, title, year, imageUrl});
    }
    return map;

}


async function parseTopTwoFifty(){
    const files = await fs.readdir(HTML_DIR);
    const slugs: string[] = [];
    try{
        for(const file of files.filter(f=>f.endsWith("html")).sort()){
            const html = await fs.readFile(path.join(HTML_DIR, file), "utf-8");
            const $ = cheerio.load(html);

            $('li.poster-container > div[data-film-slug]').each((i, element) => {
                const slug: string = $(element).attr('data-film-slug') || "";
                slugs.push(slug);
            });
        }
    } catch (error){
        console.log(error);
        throw error;
    }
    return slugs;
}

