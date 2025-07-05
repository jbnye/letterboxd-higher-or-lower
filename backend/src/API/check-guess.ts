import { Client, Pool, PoolClient  } from "pg";
import {redisClient} from  '../redis';
import pool from "../database/db";
import { RequestHandler,Router} from "express";
import { diff } from "util";

const router = Router();


function getDifficulty(difficulty: string): number{
  switch (difficulty.toLowerCase()) {
    case "easy": return 500;
    case "medium": return 1200;
    case "hard": return 2500;
    case "impossible": return 10000;
    default: return 0;
  }

}
 
const checkGuessHandler: RequestHandler = async (req, res) => {
    const baseURL = `${req.protocol}://${req.get('host')}`;
    const { difficulty } = req.params;
    const filmIdsRaw = req.query.filmIds;
    const choice = parseInt(req.query.choice as string, 10);
    let correctChoice;
    
    if (!filmIdsRaw) {
        res.status(400).json({ error: "filmIds query parameter is required" });
        return;
    }
    if(choice !== 0 && choice !== 1 ){
        res.status(400).json({ error: "Invalid choice" });
        return;
    }
    const excludeFilms = filmIdsRaw.toString().split(",").map(id => parseInt(id, 10));
    let limit = getDifficulty(difficulty.toLowerCase());
    if(limit === 0){
        res.status(400).json({error:'Unknown difficulty'})
        return;

    }
    const client = await pool.connect();
    try {
        if(redisClient.isReady){
            const film1RatingRaw = await redisClient.get(`film:${excludeFilms[0]}`);
            const film2RatingRaw = await redisClient.get(`film:${excludeFilms[1]}`);
            if(!film1RatingRaw || !film2RatingRaw){
                throw new Error("Missing film in cache for check");
            }
            const film1Data = JSON.parse(film1RatingRaw);
            const film2Data = JSON.parse(film2RatingRaw);
            film1Data.averagerating > film2Data.averagerating ? correctChoice = 0: correctChoice = 1;


            if(choice === correctChoice){
                const bucketKey = `bucket:${difficulty.toLowerCase()}`;
                const bucketJSON = await redisClient.get(bucketKey);
                if(!bucketJSON){
                    throw new Error(`BucketJSON not undefined`);
                }
                const bucket: string [] = JSON.parse(bucketJSON);
                let success = false;
                const ranSelectedToRemove= Math.round(Math.random() * 1);
                let stayIndex;
                ranSelectedToRemove === 1 ? stayIndex = 0: stayIndex = 1;
                let newFilmData;
                while(!success){
                    const newFilmRaw = await redisClient.get(`film:${bucket[Math.floor(Math.random() * bucket.length)]}`);
                    if(!newFilmRaw) throw new Error(`Error caching get newFilm replacement data`);
                    newFilmData = JSON.parse(newFilmRaw);
                    if(stayIndex === 0){
                        if(newFilmData.averagerating !== film1Data.averagerating){
                            success = true;
                        }
                    }else{
                        if(newFilmData.averagerating !== film2Data.averagerating){
                            success = true;
                        }
                    }
                }
                const newFilm = {
                    id: newFilmData.id,
                    slug: newFilmData.slug,
                    title: newFilmData.title,
                    year: newFilmData.year,
                    posterurl: newFilmData.posterurl,
                    inHouseURL: `${baseURL}/posters/${newFilmData.slug}.jpg`
                }
                res.status(200).json({
                    success: true,
                    correctChoice: correctChoice,
                    replacedFilm: ranSelectedToRemove,
                    filmRatings: {
                        film1: [film1Data.slug, film1Data.averagerating],
                        film2: [film2Data.slug, film2Data.averagerating]
                    },
                    newFilm: newFilm,
                });
                return;

            }
            else{
                res.status(200).json({
                    success: false,
                    correctChoice: correctChoice,
                    filmRatings: {
                        film1: [film1Data.slug, film1Data.averagerating],
                        film2: [film2Data.slug, film2Data.averagerating]
                    }
                })
                return;
            }
            


        }
        else{
            throw new Error("Redis server is not ready");
        }
        
    } catch (error) {
        console.log("Redis error with check-guess", error);
        try{
            const checkGuessQuery = `
                SELECT id, slug, averagerating from films where id IN ($1, $2)
            `;
            const result = await client.query(checkGuessQuery, [excludeFilms[0], excludeFilms[1]]);
            const rows = result.rows;
            if (rows.length !== 2) {
                res.status(400).json({ error: "Could not find the two films to exclude" });
                return;
            }

            //swap if in the wrong order from the filmIdParams
            if (excludeFilms[0] !== rows[0].id) {
            [rows[0], rows[1]] = [rows[1], rows[0]];
            }

            const rating1 = parseFloat(rows[0].averagerating);
            const rating2 = parseFloat(rows[1].averagerating);
            const slug1 = rows[0].slug;
            const slug2 = rows[1].slug;
            if(rating1 > rating2){
                correctChoice = 0;
            }
            else{
                correctChoice = 1;
            }
            if(choice === correctChoice){
                const ranSelectedToRemove: number = Math.round(Math.random() * 1);
                const stayIndex: number = ranSelectedToRemove === 1 ? 0 : 1;
                const newFilm = await getFilmHelper(client, limit, rows[stayIndex].averagerating, excludeFilms, baseURL);

                res.status(200).json({
                    success: true,
                    correctChoice: correctChoice,
                    replacedFilm: ranSelectedToRemove,
                    filmRatings: {
                        film1: [slug1, rating1],
                        film2: [slug2, rating2]
                    },
                    newFilm: newFilm,
                });
                return;
            }
            else {
                res.status(200).json({
                    success: false,
                    correctChoice: correctChoice,
                    filmRatings: {
                        film1: [slug1, rating1],
                        film2: [slug2, rating2]
                    }
                })
                return;
            }
        } catch (error) {
            throw error;
        }
    }

    finally{
        client.release();
    }

}

async function getFilmHelper(client: PoolClient, limit: number, excludedRating: number, excludedFilms: number[], baseURL: string){
    
    try{
        //When you're doing a COUNT(*) over a filtered subquery, and you're not going to use any of the data, you can use SELECT 1 to reduce overhead.

        const countQuery = `
        SELECT COUNT(*) FROM (
            SELECT 1
            FROM (
            SELECT id, averagerating
            FROM films
            WHERE ${limit !== 10000 ? "category = 'movie' " : ""}
            ORDER BY watchedNumber DESC
            LIMIT $1
            ) AS inner_sorted
            WHERE id NOT IN ($2, $3)
            AND averagerating <> $4
        ) AS filtered`;

        const countResult = await client.query(countQuery, [limit, excludedFilms[0], excludedFilms[1], excludedRating]);
        const countOfRows =  parseInt(countResult.rows[0].count);
        if (countOfRows === 0) {
            throw new Error("No valid replacement films found.");
        }
        const ranOFFSET = Math.floor(Math.random() * countOfRows);

        const getNewFilmQuery = `
        SELECT id, slug, title, year, posterurl
        FROM (
            SELECT id, slug, title, year, posterurl, averagerating
            FROM films
            WHERE ${limit !== 10000 ? "category = 'movie' " : ""}
            ORDER BY watchedNumber DESC
            LIMIT $1
        ) AS sorted_films
        WHERE id NOT IN ($2, $3)
        AND averagerating <> $4
        OFFSET $5
        LIMIT 1`;

        const result = await client.query(getNewFilmQuery, [limit, excludedFilms[0], excludedFilms[1], excludedRating, ranOFFSET]);
        const film = result.rows[0];


        const newFilm = {
        ...film,
        inHouseURL: `${baseURL}/posters/${film.slug}.jpg`
        };
        return newFilm;
    } catch (error){
        throw error;
    }
}


router.get("/check-guess/:difficulty", checkGuessHandler);
export default router;
