import {redisClient} from  '../../redis';
import pool from "../../database/db";
import { Highscores } from '../../helperFunctions';
type Difficulty = keyof Highscores; 


export default async function setHighScore(userSub: string, score: number, difficulty: Difficulty): Promise<{ highscores?: Highscores; highscore: boolean, }>{

    const highscores_raw = await redisClient.get(`user:highscores:${userSub}`);
    let highscores: Highscores | undefined;
    let highscore: boolean = false
    if(highscores_raw){
        try{
            highscores = JSON.parse(highscores_raw);
            if(score > highscores![difficulty]){
                const client = await pool.connect()
                highscores![difficulty] = score;
                await redisClient.set(`user:highscores:${userSub}`, JSON.stringify(highscores), {EX: 86400})
                try {
                    const result = await client.query(
                        `
                        INSERT INTO leaderboard (googleSub, difficulty, score)
                        VALUES ($1, $2, $3)
                        ON CONFLICT (googleSub, difficulty)
                        DO UPDATE SET score = GREATEST(leaderboard.score, EXCLUDED.score)
                        RETURNING score
                        `,
                        [userSub, difficulty.toLowerCase(), score]);
                    const updatedScore = result.rows[0]?.score;
                    highscore = updatedScore === score;
                    console.log(`${userSub} highscore: ${highscore}`);
                    console.log(`current score: ${score} - updatedScore? = ${updatedScore}`);
                } catch (error) {
                    console.error("ERROR in updateLeaderboard ", error);
                } finally{
                    client.release();
                }
            }
        }catch (error){
            console.log(`user:highscores:${userSub}`);
        }
    }else{
        console.error(`ERROR CANNOT FIND user:highscores:${userSub}`);
    }
    return { highscores, highscore };
}