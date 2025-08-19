import {redisClient} from  '../../redis';
import pool from "../../database/db";
import { Highscores, user } from '../../helperFunctions';
import { loadLeaderboard } from '../../redis';
type Difficulty = keyof Highscores; 

export default async function setHighScore(user: user, score: number, difficulty: Difficulty):
 Promise<{ highscores?: Highscores; isHighscore: boolean, previousHighscore?: number,  }>{

    const highscores_raw = await redisClient.get(`user:highscores:${user.sub}`);
    let highscores: Highscores | undefined;
    let isHighscore: boolean = false
    let previousHighscore: number | undefined;
    if(highscores_raw){
        try{
            highscores = JSON.parse(highscores_raw);
            previousHighscore = highscores![difficulty]; 
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
                    isHighscore = updatedScore === score;
                    console.log(`${user.sub} highscore: ${isHighscore}`);
                    console.log(`current score: ${score} - updatedScore? = ${updatedScore}`);

                    const top10raw = await redisClient.get(`leaderboard:${difficulty}`);
                    if(top10raw){
                        const top10 = JSON.parse(top10raw);
                        if (!top10 || top10.length < 10 || (top10.length === 10 && top10[9].score < updatedScore)) {
                            console.log("NEED TO UPDATE ELADERBOARD");
                            await loadLeaderboard();
                        }
                    }
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
    return { highscores, isHighscore, previousHighscore };
}