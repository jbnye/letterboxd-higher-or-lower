import * as cheerio from "cheerio";
import fs from "fs/promises";
import path from "path";
import {filmData, parseCSVToMap, createLetterboxdCsvWriter} from "./helperFunctions";

const HTML_DIR = "../cache/Top250Pages";
const OLD_CSV_PATH = path.join("..", "CSV", "letterboxd-films.csv");


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

async function parseCSVForTopTwoFiftyData(slugs: string[]): Promise<filmData[]>{
    const results: filmData[] = [];
    const filmMap: Map<string,filmData> = await parseCSVToMap(OLD_CSV_PATH);
    slugs.forEach((slug, index) => {
        const filmDataHelperJustForTypeScript = filmMap.get(slug); 
        if(filmDataHelperJustForTypeScript){
            console.log(`Adding ${slug} to the top 250 movies index #${index}`);
            results.push(filmDataHelperJustForTypeScript);
        }
        else{
            console.log(`WARNING could not find ${slug} in the Map Data`);
        }
    });
    return results;
}



async function TopTwoFiftyCSVWriter(){
    const filePath = path.join(__dirname, "..", "CSV", "Top-TwoFifty-sorted-letterboxd.csv");
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    const csvWriter = createLetterboxdCsvWriter(filePath);
    const slugs: string[] = await parseTopTwoFifty();
    const topTwoFifty: filmData[] = await parseCSVForTopTwoFiftyData(slugs);
    csvWriter.writeRecords(topTwoFifty);


}

TopTwoFiftyCSVWriter();

