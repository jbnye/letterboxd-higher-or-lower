import { redisClient } from "../redis";
import { RequestHandler,Router} from "express";
import { Highscores, Difficulty } from "../helperFunctions";
const router = Router();

export const getLeaderboard: RequestHandler = async (req,res) => {
    const difficulties: Difficulty[] = [`easy`, `medium`, `hard`, `impossible`];

    const result: Record<string, any[]> = {};
    try{
        for(const difficulty of difficulties){
            const top10 = await redisClient.zRangeWithScores(`leaderboard:${difficulty}`, 0, 9, { REV: true });
            const userData = await Promise.all(
                top10.map(async (user)=> {
                    const data = await redisClient.hGetAll(`userData:${user.value.toString()}`);
                    console.log(`Redis data for userData:${user.value}`, data);
                    return {
                        googleSub: user.value,
                        score: user.score,
                        name: data.name || null,
                        email: data.email || null,
                        picture: data.picture || null,
                    };
                })
            )
            result[difficulty] = userData;
        }
        return res.json(result);
    }catch(error){console.error("COULDNT GET top10 or user from cache", error); res.json("COULDNT GET top10 or user from cache")}
}

router.get("/get-leaderboard", getLeaderboard);
export default router;
