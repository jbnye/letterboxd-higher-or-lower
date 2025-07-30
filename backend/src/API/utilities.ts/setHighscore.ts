import {redisClient} from  '../../redis';
import pool from "../../database/db";
import { Highscores, user } from '../../helperFunctions';
type Difficulty = keyof Highscores; 

export default async function setHighScore(user: user, score: number, difficulty: Difficulty): Promise<{ highscores?: Highscores; highscore: boolean, }>{

    const highscores_raw = await redisClient.get(`user:highscores:${user.sub}`);
    let highscores: Highscores | undefined;
    let highscore: boolean = false
    if(highscores_raw){
        try{
            highscores = JSON.parse(highscores_raw);
            if(score > highscores![difficulty]){
                const client = await pool.connect()
                highscores![difficulty] = score;
                await redisClient.set(`user:highscores:${user.sub}`, JSON.stringify(highscores), {EX: 86400})
                try {
                    const result = await client.query(
                        `
                        INSERT INTO leaderboard (googleSub, difficulty, score)
                        VALUES ($1, $2, $3)
                        ON CONFLICT (googleSub, difficulty)
                        DO UPDATE SET score = GREATEST(leaderboard.score, EXCLUDED.score)
                        RETURNING score
                        `,
                        [user.sub, difficulty.toLowerCase(), score]);
                    const updatedScore = result.rows[0]?.score;
                    highscore = updatedScore === score;
                    await redisClient.hSet(`userData:${user.sub}`, {
                        name: user.name,
                        picture: user.picture,
                        email: user.email,
                    });
                    console.log(`${user.sub} highscore: ${highscore}`);
                    console.log(`current score: ${score} - updatedScore? = ${updatedScore}`);

                    await redisClient.zAdd(`leaderboard:${difficulty}`, {
                        score,
                        value: user.sub,
                    });
                    await redisClient.zRemRangeByRank(`leaderboard:${difficulty}`, 10, -1);
                } catch (error) {
                    console.error("ERROR in updateLeaderboard ", error);
                } finally{
                    client.release();
                }
            }
        }catch (error){
            console.log(`user:highscores:${user.sub}`);
        }
    }else{
        console.error(`ERROR CANNOT FIND user:highscores:${user.sub}`);
    }
    return { highscores, highscore };
}