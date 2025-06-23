import axios from "axios";
import fs from "fs/promises";
import UserAgent from 'user-agents';
import * as cheerio from "cheerio";
import path from "path";
import { setTimeout } from 'timers/promises';
import { extractSlugsAndRatingsFromFiles, slugsAndRatings } from './letterboxd-parser';
import { filmData, createLetterboxdCsvWriter } from "./helperFunctions";
import { scrapePopularityFromCache } from "./scrapeAllFilmDataFromCache";
import {LBPosterScraper} from "./letterboxd-poster-scraper";


async function SeperateTypesOfSlugs(unfilteredDirPath: string,filteredDirPath: string): Promise<slugsAndRatings[]> {
    const unfilteredFilms: slugsAndRatings[] = await extractSlugsAndRatingsFromFiles(unfilteredDirPath);
    const filteredFilms: slugsAndRatings[] = await extractSlugsAndRatingsFromFiles(filteredDirPath);

    const filteredSlugs = new Set(filteredFilms.map(film => film.slug));

    // Tag all filtered as "movie"
    const catMovies = filteredFilms.map(film => ({
    ...film,
    category: "movie"
    }));

    // Tag all unfiltered-but-not-filtered as "other"
    const catOthers = unfilteredFilms
    .filter(film => !filteredSlugs.has(film.slug))
    .map(film => ({
        ...film,
        category: "other"
    }));

    return [...catMovies, ...catOthers];
}


async function main(){
    const unfilteredDirPath = path.join(__dirname, "..", "cache", "unfilteredLetterboxdPopularPages");
    const filteredDirPath = path.join(__dirname, "..", "cache", "filteredLetterboxdPopularPages");
    const CSV_WRITE_PATH = path.join(__dirname, "..", "CSV", "ALLFILMS.csv");
    const combinedSlugs: slugsAndRatings[] = await SeperateTypesOfSlugs(unfilteredDirPath, filteredDirPath);
    // GET EVERYTHING EXCEPT POSTERURL
    const filmsNoPoster: Map<string, filmData> = await scrapePopularityFromCache(combinedSlugs);
    //GET PSOTERURL
    const filmPosters: Map<string, string> = await LBPosterScraper(combinedSlugs);

    const correctFilms = new Map<string, filmData>();

    for (const [slug, film] of filmsNoPoster.entries()) {
        const posterUrl = filmPosters.get(slug);
        const updatedFilm: filmData = {
            ...film,
            posterUrl: posterUrl ?? ""  // fallback to "" if missing
        };

        if (!posterUrl) {
            console.log(`------------------------NO POSTER FOR FILM: ${slug}----------------------------`);
        }

        correctFilms.set(slug, updatedFilm);
    }
    const csvWriter = createLetterboxdCsvWriter(CSV_WRITE_PATH);
    await csvWriter.writeRecords([...correctFilms.values()]);

}
main();



