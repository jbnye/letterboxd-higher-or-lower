import pool from "./db";
import path from "path";
import fs from "fs";
import {parseCSVToMap, filmData} from "../helperFunctions";

async function PopulateFilmsDatabaseFromCSV() {
    const filePath = path.join(__dirname, "..", "..", "CSV", "ALLFILMS.csv");
    const client = await pool.connect();

    const filmMap = await parseCSVToMap(filePath);
    const films = Array.from(filmMap.values()); 

    const insertQuery = `
        INSERT INTO films (
            slug,
            averagerating,
            watchednumber,
            title,
            year,
            category,
            posterurl
        ) VALUES ($1,$2,$3,$4,$5,$6,$7)
        ON CONFLICT (slug)
        DO UPDATE SET
            averagerating = EXCLUDED.averagerating,
            watchednumber = EXCLUDED.watchednumber,
            title = EXCLUDED.title,
            year = EXCLUDED.year,
            category = EXCLUDED.category,
            posterurl = EXCLUDED.posterurl;
    `;

    try {
        await client.query("BEGIN");

        for (const film of films) {
            if (!film.slug) {
                console.warn("Skipping film missing slug:", film);
                continue;
            }

            const releaseYear = Number.isInteger(parseInt(film.year))
                ? parseInt(film.year)
                : null;

            const avgRaw = parseFloat(film.averageRating);
            const averageRating = parseFloat(
                (Math.round(avgRaw * 10) / 10).toFixed(1)
            );

            await client.query(insertQuery, [
                film.slug,
                averageRating,
                film.watchedNumber,
                film.title,
                releaseYear,
                film.category,
                film.posterURL,
            ]);

            console.log("Inserted:", film.slug);
        }

        await client.query("COMMIT");
        console.log("All films inserted successfully.");
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("Error inserting films:", err);
        throw err;
    } finally {
        client.release();
    }
}

async function PopulateTop250List(){
    const filePath = path.join("..", "..", "CSV", "Top-TwoFifty-sorted-letterboxd.csv");
    const client = await pool.connect();
    const filmMap: Map<string, filmData> = await parseCSVToMap(filePath);
    const films: filmData[] = [];
    filmMap.forEach((film,slug)=>{
        films.push(film);
    });

    try{
        for(const film of films.slice(1)){
        const query = `UPDATE films SET isTop250 = $1 where slug = $2`;
        await client.query(query, [true, film.slug])
        console.log("Updated film to be in top 250: ", film.slug);
        }

    } catch (error){
        console.error('Error editing Top 250', error);
        await client.query('ROLLBACK');
        throw error;
    }
    finally{
        client.release();
    }
}


PopulateFilmsDatabaseFromCSV(); 
const timestamp = new Date().toISOString();
fs.writeFileSync(path.join(__dirname, "..", "data", "lastUpdated.json"), JSON.stringify({ dateLastUpdated: timestamp }, null, 2));
//PopulateTop250List(); 