import { parse } from 'csv-parse/sync';
import * as fs from 'fs/promises';
import path from 'path';
import {parseCSVToMap, filmData, symbols} from "../helperFunctions";

export async function TestPostersForAllFilms( CSVFile: string): boolean{
    const PosterDirPath = path.join(__dirname, "..", "..", "posters");
    const SlugMap: Map<string, filmData> = await parseCSVToMap(CSVFile);
    let AllPassed: boolean = true;
    for(const slug of SlugMap.keys()){
        const posterFile = path.join(PosterDirPath, `${slug}.jpg`);
        try {
            await fs.access(posterFile);
        } catch (err) {
            console.log(`${symbols.fail} Poster not found for ${slug}`);
            AllPassed = false;
        }
    }
    return AllPassed;

}

if (require.main === module) {
    const CSVPath = path.join(__dirname, "..", "..", "CSV", "ALLFILMS.csv");
    const AllPassed: boolean = TestPostersForAllFilms(CSVPath);
    if(AllPassed){
        console.log("All psoter tests passed");
    } else{
        console.log("Failed poster test");
    }
}