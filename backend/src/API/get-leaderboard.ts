import { redisClient } from "../redis";
import { RequestHandler,Router} from "express";
import { Difficulty } from "../helperFunctions";
const router = Router();

export const getLeaderboard: RequestHandler = async (req,res) => {
    const difficulties: Difficulty[] = [`easy`, `medium`, `hard`, `impossible`];

    const result: Record<string, any[]> = {};
    try {
        for (const difficulty of difficulties) {
            const top10raw = await redisClient.get(`leaderboard:${difficulty}`);
            let top10 = [];
            if (top10raw) {
                const top10data = JSON.parse(top10raw);
                top10 = top10data.map((entry: any) => ({
                    score: entry.score,
                    name: entry.name,
                    picture: entry.picture,
                }));
            }
            result[difficulty] = top10;
        }
        return res.json(result);
    } catch (error) {
        console.error("COULD NOT GET top10 from cache", error);
        return res.status(500).json({ error: "Could not get leaderboard" });
    }
};

router.get("/get-leaderboard", getLeaderboard);
export default router;
