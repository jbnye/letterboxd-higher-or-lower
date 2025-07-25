import { Client, Pool, PoolClient  } from "pg";
import {redisClient} from  '../redis';
import pool from "../database/db";
import { RequestHandler,Router} from "express";
import { diff } from "util";
import { symbols, Highscores } from "../helperFunctions";
import setHighScore from "./utilities.ts/setHighscore";
type Difficulty = keyof Highscores; 
const router = Router();

interface user {
    sub: string,
    name: string,
    email: string,
    picture: string
}

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
    const { gameId, choice, difficulty, filmIds, user } = req.body;
    let correctChoice;
    const diff = difficulty.toLowerCase();
    if (!gameId || (choice !== 0 && choice !== 1) || !filmIds) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    console.log("Made is past check if statement");
    const excludeFilms = filmIds;
    let limit = getDifficulty(difficulty.toLowerCase());
    if(limit === 0){
        res.status(400).json({error:'Unknown difficulty'})
        return;

    }
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
                console.log("Checking cache from a correct choice");
                const bucketKey = `bucket:${difficulty.toLowerCase()}`;
                const bucketJSON = await redisClient.get(bucketKey);
                if(!bucketJSON){
                    throw new Error(`BucketJSON not undefined`);
                }
                const bucket: string [] = JSON.parse(bucketJSON);
                let success = false;
                const ranSelectedToRemove = Math.round(Math.random() * 1);
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
                const score: number = await handleGameId(gameId, true, filmIds, newFilm.id, ranSelectedToRemove);
                res.status(200).json({
                    success: true,
                    correctChoice: correctChoice,
                    replacedFilm: ranSelectedToRemove,
                    filmRatings: {
                        film1: [film1Data.slug, film1Data.averagerating],
                        film2: [film2Data.slug, film2Data.averagerating]
                    },
                    newFilm: newFilm,
                    score: score,
                });
                return;

            }
            else{
                const score: number = await handleGameId(gameId, false);
                let highscore: boolean | undefined;
                let highscores: Highscores | undefined;
                
                if(user){
                    ({highscores, highscore} = await setHighScore(user.sub, score, difficulty));
                }
                console.log(
                    {success: false,
                    correctChoice: correctChoice,
                    filmRatings: {
                        film1: [film1Data.slug, film1Data.averagerating],
                        film2: [film2Data.slug, film2Data.averagerating]
                    },
                    score: score,
                    highscore: highscore,
                    highscores: highscores,
                })
                res.status(200).json({
                    success: false,
                    correctChoice: correctChoice,
                    filmRatings: {
                        film1: [film1Data.slug, film1Data.averagerating],
                        film2: [film2Data.slug, film2Data.averagerating]
                    },
                    score: score,
                    ...(highscore !== undefined && {highscore: highscore}),
                    ...(highscores !== undefined && {highscores: highscore}),
                })
                return;
            }
            
        }
        else{
            throw new Error("Redis server is not ready");
        }
        
    } catch (error){
        console.error("Check Guess Handler Error:", error);
        res.status(500).json({ error: "Server error during check guess" });
    }
}


const handleGameId = async (gameId: string, correctGuess: boolean, filmIds?: number[], newFilmId?: number, ranSelectedToRemove?: number) => {
    console.log("checking redis for gameId");
    const dataRaw = await redisClient.get(`gameId:${gameId}`);
    if(!dataRaw){
        console.error(symbols.fail, " GAMEID NOT FOUND IN CACHE");
        return;
    }
    const data = JSON.parse(dataRaw);
    const currentScore = data.score;
    if(correctGuess === true && filmIds){
        const newGuessDeadline = Date.now() + 10700;
        const filmId1 = data.films[0];
        const filmId2 = data.films[1];
        if(filmId1 !== filmIds[0] || filmId2 !== filmIds[1]){
        //MUST RETURN SOME SORT OF ERROR FOR SERVER OR CHEATING
        return ;
        }
        data.score = data.score + 1;
        data.guessDeadline = newGuessDeadline;
        if(ranSelectedToRemove === 0){
            data.films[0] = newFilmId;
        } else{
            data.films[1] = newFilmId;
        }
        await redisClient.set(`gameId:${gameId}`, JSON.stringify(data), {EX: 20});
    }
    else{
        await redisClient.del(`gameId:${gameId}`);
        return currentScore; 
    }

}

router.post("/check-guess", checkGuessHandler);
export default router;




// async function getFilmHelper(client: PoolClient, limit: number, excludedRating: number, excludedFilms: number[], baseURL: string){
    
//     try{
//         //When you're doing a COUNT(*) over a filtered subquery, and you're not going to use any of the data, you can use SELECT 1 to reduce overhead.

//         const countQuery = `
//         SELECT COUNT(*) FROM (
//             SELECT 1
//             FROM (
//             SELECT id, averagerating
//             FROM films
//             WHERE ${limit !== 10000 ? "category = 'movie' " : ""}
//             ORDER BY watchedNumber DESC
//             LIMIT $1
//             ) AS inner_sorted
//             WHERE id NOT IN ($2, $3)
//             AND averagerating <> $4
//         ) AS filtered`;

//         const countResult = await client.query(countQuery, [limit, excludedFilms[0], excludedFilms[1], excludedRating]);
//         const countOfRows =  parseInt(countResult.rows[0].count);
//         if (countOfRows === 0) {
//             throw new Error("No valid replacement films found.");
//         }
//         const ranOFFSET = Math.floor(Math.random() * countOfRows);

//         const getNewFilmQuery = `
//         SELECT id, slug, title, year, posterurl
//         FROM (
//             SELECT id, slug, title, year, posterurl, averagerating
//             FROM films
//             WHERE ${limit !== 10000 ? "category = 'movie' " : ""}
//             ORDER BY watchedNumber DESC
//             LIMIT $1
//         ) AS sorted_films
//         WHERE id NOT IN ($2, $3)
//         AND averagerating <> $4
//         OFFSET $5
//         LIMIT 1`;

//         const result = await client.query(getNewFilmQuery, [limit, excludedFilms[0], excludedFilms[1], excludedRating, ranOFFSET]);
//         const film = result.rows[0];


//         const newFilm = {
//         ...film,
//         inHouseURL: `${baseURL}/posters/${film.slug}.jpg`
//         };
//         return newFilm;
//     } catch (error){
//         throw error;
//     }
// }