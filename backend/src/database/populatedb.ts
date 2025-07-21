import pool from "./db";
import path from "path";
import {parseCSVToMap, filmData} from "../helperFunctions";

async function PopulateFilmsDatabaseFromCSV(){
    const filePath = path.join(__dirname, "..", "..", "CSV", "ALLFILMS.csv");
    const client = await pool.connect();
    const filmMap: Map<string, filmData> = await parseCSVToMap(filePath);
    const films: filmData[] = [];
    filmMap.forEach((film,slug)=>{
        films.push(film);
    });
    try{
            const insertFilmQuery: string = 
            `INSERT INTO films (slug, averageRating, watchedNumber, title, year, category, posterURL, isTop250)
                VALUES ($1,$2,$3,$4,$5,$6,$7, $8)
            `;
        for (const film of films.slice(1)) {
            const parsedYear = parseInt(film.year);
            const releaseYear = Number.isNaN(parsedYear) ? null : parsedYear;
            await client.query(insertFilmQuery,[
                film.slug, 
                parseFloat((Math.round(film.averageRating * 10) / 10).toFixed(1)),
                film.watchedNumber,
                film.title,
                releaseYear,
                film.category,
                film.posterUrl,
                false]);
            console.log("Adding film: ", film.slug);
        };


    } catch (error){
        console.error('Error populating database!', error);
        await client.query('ROLLBACK');
        throw error;
    }
    finally {
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
//PopulateTop250List();  