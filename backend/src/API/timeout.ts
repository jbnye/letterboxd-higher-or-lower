import pool from "../database/db";
import { redisClient } from "../redis";
import { RequestHandler,Router} from "express";
import { Highscores } from "../helperFunctions";
import setHighScore from "./utilities.ts/setHighscore";
const router = Router();



export const timeout: RequestHandler = async (req,res) => {
    const {gameId} = req.body;
    const gameIdRaw = await redisClient.get(`gameId:${gameId}`);
    if(!gameIdRaw){
        return res.status(400).json("gameId not found");
    }
    const gameData = JSON.parse(gameIdRaw);
    if(!gameData.sub){
        return res.status(400).json(`NO USER IN GAMEID`);
    }
    const {sub, score, difficulty} = gameData
    const {isHighscore} = await setHighScore(sub, score, difficulty);
    return res.json({isHighscore});


}
router.get("/timeout", timeout);
export default router;