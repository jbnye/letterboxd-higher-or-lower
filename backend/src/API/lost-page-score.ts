import { redisClient} from "../redis";
import { RequestHandler,Router} from "express";
import setHighScore from "./utilities.ts/setHighscore";
const router = Router();


const findGame: RequestHandler = async (req, res) => {
    console.log("LOSTPAGESCORE API HAS BEEN LOADED");
    const {gameId, user} = req.body;
    if(!user)return res.status(404).json({error: "no user"})
    const gameCacheRaw = await redisClient.get(`gameId:${gameId}`);
    if(!gameCacheRaw){
        return res.status(404).json("gameId not found in cache");
    }
    const gameCache = JSON.parse(gameCacheRaw);
    if(gameCache.sub)return res.status(403).json("gameId already has a user associated");
    const { highscores, isHighscore, previousHighscore}  =  await setHighScore(user, gameCache.score, gameCache.difficulty);
    console.log(`Highscore updated after login with user: ${user.sub} gameid: ${gameId} and highscore = ${isHighscore}`);
    await redisClient.del(`gameId:${gameId}`);
    // await redisClient.set(
    //     `gameId:${gameId}`,
    //     JSON.stringify({
    //         sub: userSub,
    //         difficulty: gameCache.difficulty,
    //         score: gameCache.score,
    //         films: gameCache.films,
    //         guessDeadline: gameCache.guessDeadline,
    //     }),
    //     {EX: 600}
    // );
    return res.status(200).json({highscores, isHighscore, previousHighscore });    

}
router.post("/lost-page-score", findGame);
export default router;
