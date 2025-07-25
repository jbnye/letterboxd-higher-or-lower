import pool from "../database/db";
import { RequestHandler,Router} from "express";
import {redisClient} from '../redis';
import {v4 as uuidv4} from "uuid";

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

const getFilmsHandler: RequestHandler = async (req, res) => {
    const {difficulty} = req.body;
    const {userSub} = req.body;
    const baseURL = `${req.protocol}://${req.get('host')}`;
    const diff = difficulty.toLowerCase();
    const client = await pool.connect();
    let limit: number = getDifficulty(difficulty);
    if(limit === 0){
        res.status(400).json({error:'Unknown difficulty'})
        return;
    }
    try {
        if(redisClient.isReady){
            const bucketKey = `bucket:${difficulty.toLowerCase()}`;
            const bucketJSON = await redisClient.get(bucketKey);
            let success = false;
            if(bucketJSON){
                const bucket: string[] = JSON.parse(bucketJSON);
                const id1 = bucket[Math.floor(Math.random() * bucket.length)];
                let id2;
                let film1RAW = await redisClient.get(`film:${id1}`);
                if (!film1RAW) throw new Error("Film1 missing in cache");
                const film1Data = JSON.parse(film1RAW);

                let film2Data;
                while(!success){
                    id2 = bucket[Math.floor(Math.random() * bucket.length)];
                    let film2RAW = await redisClient.get(`film:${id2}`);
                    if (!film2RAW) throw new Error("Film2 missing in cache");
                    film2Data = JSON.parse(film2RAW);
                    if(film2Data.averagerating !== film1Data.averagerating){
                        success = true;
                    }
                }
            const film1 = {
                id: film1Data.id,
                slug: film1Data.slug,
                title: film1Data.title,
                year: film1Data.year,
                posterurl: film1Data.posterurl,
                inHouseURL: `${baseURL}/posters/${film1Data.slug}.jpg`  
            }
            const film2 = {
                id: film2Data.id,
                slug: film2Data.slug,
                title: film2Data.title,
                year: film2Data.year,
                posterurl: film2Data.posterurl,
                inHouseURL: `${baseURL}/posters/${film2Data.slug}.jpg`  
            }
            const gameId: string = await createGameToRedis(userSub, diff, film1.id, film2.id);
            console.log("Fetched two films from cache: ", film1, film2);
            res.json({ newFilms: [film1, film2], gameId});
            return;
            }
        }
        else{
            throw new Error("Redis server not ready");
        }
    } catch (error){
        console.error("Redis cache error:", error);
        try{
            const getFirstFilmQuery = `
                SELECT id, slug, averagerating, title, year, posterurl
                FROM films ${limit !== 10000 ? "WHERE category = 'movie' ": ""}
                ORDER BY watchedNumber DESC
                OFFSET FLOOR(RANDOM() * $1)
                LIMIT 1
            `;
            const firstFilmResult = await client.query(getFirstFilmQuery, [limit]);
            const film1Row = firstFilmResult.rows[0];
            const excludeRatingFromFirstFilm =  film1Row.averagerating;
            const film1 = {
                id: film1Row.id,
                slug: film1Row.slug,
                // averageRating: film1Row.averagerating1,
                title: film1Row.title,
                year: film1Row.year,
                posterurl: film1Row.posterurl,
                inHouseURL: `${baseURL}/posters/${film1Row.slug}.jpg`
                // isTop250: film1Row.istop2501
            }


            // 1. Get count of valid candidates
            const countQuery = `
            SELECT COUNT(*) FROM (
                SELECT id, averagerating
                FROM films
                WHERE ${limit !== 10000 ? "category = 'movie'" : "TRUE"}
                ORDER BY watchedNumber DESC
                LIMIT $1
            ) AS filtered
            WHERE averagerating <> $2
            `;

            const countResult = await client.query(countQuery, [limit, excludeRatingFromFirstFilm]);
            const countOfRows = parseInt(countResult.rows[0].count);
            if (countOfRows === 0) {
                throw new Error("No valid replacement films found.");
            }

            const ranOffSET = Math.floor(Math.random() * countOfRows);

            const filmQuery = `
            SELECT id, slug, averagerating, title, year, posterurl
            FROM (
                SELECT id, slug, averagerating, title, year, posterurl
                FROM films
                WHERE ${limit !== 10000 ? "category = 'movie'" : "TRUE"}
                ORDER BY watchedNumber DESC
                LIMIT $1
            ) AS sorted
            WHERE averagerating <> $2
            OFFSET $3
            LIMIT 1
            `;

            const secondFilmResult = await client.query(filmQuery, [limit, excludeRatingFromFirstFilm, ranOffSET]);
            const film2Row = secondFilmResult.rows[0];

            const film2 = {
                id: film2Row.id,
                slug: film2Row.slug,
                // averageRating: film2Row.averagerating2,
                title: film2Row.title,
                year: film2Row.year,
                posterurl: film2Row.posterurl,
                inHouseURL: `${baseURL}/posters/${film2Row.slug}.jpg`
                // isTop250: film2Row.istop2502
            };
            const gameId: string = await createGameToRedis(userSub, diff, film1.id, film2.id);
            console.log("Fetched two films: ", film1, film2);
            res.json({ newFilms: [film1, film2], gameId });
        } catch (error){
            console.error(error);
            res.status(500).json({error:'Error getFilmQuery'})
        }
    }
    finally{
        client.release();
    }
};


router.post("/get-films/", getFilmsHandler);
export default router;

const createGameToRedis = async (userSub: string, difficulty: string, filmId1: number, filmId2: number) => {
    const gameId = uuidv4();
    console.log(`MAKING GAMEID IN REDIS: ${gameId}`);
    await redisClient.set(
        `gameId:${gameId}`,
        JSON.stringify({
            sub: userSub,
            difficulty: difficulty,
            score: 0,
            films: [filmId1, filmId2],
            guessDeadline: Date.now() + 10700,
        }),
        {EX: 20}
    );
    return gameId;
}