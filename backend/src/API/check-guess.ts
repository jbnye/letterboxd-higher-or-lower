import { Client, Pool, PoolClient  } from "pg";
import {redisClient} from  '../redis';
import pool from "../database/db";
import { RequestHandler,Router} from "express";
import { diff } from "util";
import { symbols, Highscores} from "../helperFunctions";
import setHighScore from "./utilities.ts/setHighscore";
type Difficulty = keyof Highscores; 
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
    const { gameId, choice, difficulty, filmIds, user } = req.body;
    let correctChoice;
    const diff = difficulty.toLowerCase();
    if (!gameId || (choice !== 0 && choice !== 1 && choice!== -1) || !filmIds) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    //.log("Made is past check if statement");
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
                //console.log("Checking cache from a correct choice");
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
                    //inHouseURL: `${baseURL}/posters/${newFilmData.slug}.jpg`
                    inHouseURL: `${process.env.POSTER_BASE_URL}/${newFilmData.slug}.jpg`
                }
                const score: number = await handleGameId(gameId, true, filmIds, newFilm.id, ranSelectedToRemove, user);
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
                let isHighscore: boolean | undefined;
                let highscores: Highscores | undefined;
                const timeout = choice===-1 ? true: false;
                
                if(user){
                    ({highscores, isHighscore} = await setHighScore(user, score, difficulty));
                }
                // console.log(
                //     {success: false,
                //     correctChoice: correctChoice,
                //     filmRatings: {
                //         film1: [film1Data.slug, film1Data.averagerating],
                //         film2: [film2Data.slug, film2Data.averagerating]
                //     },
                //     score: score,
                //     isHighscore: isHighscore,
                //     highscores: highscores,
                //     timeout: timeout
                // })
                res.status(200).json({
                    success: false,
                    correctChoice: correctChoice,
                    filmRatings: {
                        film1: [film1Data.slug, film1Data.averagerating],
                        film2: [film2Data.slug, film2Data.averagerating]
                    },
                    score: score,
                    ...(isHighscore !== undefined && {isHighscore: isHighscore}),
                    ...(highscores !== undefined && {highscores: highscores}),
                    ...(timeout === true && {timeout: true}),
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


const handleGameId = async (gameId: string, correctGuess: boolean, filmIds?: number[], newFilmId?: number, ranSelectedToRemove?: number, user?: any ) => {
    //console.log("checking redis for gameId");
    const dataRaw = await redisClient.get(`gameId:${gameId}`);
    if(!dataRaw){
        console.error(symbols.fail, " GAMEID NOT FOUND IN CACHE");
        return;
    }
    const data = JSON.parse(dataRaw);
    const currentScore = data.score;
    if(correctGuess === true && filmIds){
        let TLL = 600;
        if(user) {
            TLL = 20;
        }
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
        await redisClient.set(`gameId:${gameId}`, JSON.stringify(data), {EX: TLL});
    }
    else{
        return currentScore; 
    }

}

router.post("/check-guess", checkGuessHandler);
export default router;
