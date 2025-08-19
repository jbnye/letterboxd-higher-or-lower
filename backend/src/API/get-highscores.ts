import pool from "../database/db";
import { redisClient } from "../redis";
import { RequestHandler,Router} from "express";
import { Highscores } from "../helperFunctions";
const router = Router();


export const getHighscores: RequestHandler = async (req,res) => {
    //console.log("ENTERING GET HIGHSCORES NOW");
    const userSub = req.query.userSub as string;
    if (!userSub) {
        //console.log("no userSub");
        return res.status(400).json({ error: "Missing userSub in query" });
    }
    try{
        const highscore_results_RAW = await redisClient.get(`user:highscores:${userSub}`);
        if (highscore_results_RAW) {
            console.log("user already in cache sending cached highscores for user", highscore_results_RAW);
            const highscore_results = JSON.parse(highscore_results_RAW);
            return res.json({ highscores: highscore_results }); 
        }

    }catch (error){
        console.log("Error checking highscore in cache,", error);
    }
    const client = await pool.connect();
    try{

        const highscore_results = await client.query(
            `
            SELECT difficulty, score FROM leaderboard where googleSub = $1;
            `,[userSub,]);
        const rows = highscore_results.rows;

        const highscores: Highscores = {
            easy: 0,
            medium: 0,
            hard: 0,
            impossible: 0,
        };

        if (rows.length > 0) {
            for (const row of rows) {
                const { difficulty, score } = row;
                if (difficulty in highscores) {
                    highscores[difficulty as keyof Highscores] = score;
                }
            }
        }
        //console.log(`setting user highscores in redis->user:highscores:${userSub}`);
        await redisClient.set(`user:highscores:${userSub}`, JSON.stringify(highscores), { EX: 86400} )
        return res.json({highscores});
    } catch (error){
        console.error("Failed to retrieve highscores form user with DB", error);
        return res.status(500).json({ error: "Internal server error" });
    } finally{ client.release();}
    
}


router.get("/get-highscores", getHighscores);
export default router;