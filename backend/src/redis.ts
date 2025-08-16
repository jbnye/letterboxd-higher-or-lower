import {symbols} from './helperFunctions'
import { createClient } from 'redis';
import pool from './database/db';
import type {Difficulty} from "./helperFunctions";
console.log("REDIS URL ENV", process.env.REDIS_URL)
const redisClient = createClient({
    url: process.env.REDIS_URL,
});

redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

async function loadFilms(){
    const allFilmsQuery = `SELECT * FROM films ORDER BY watchednumber DESC`;
    const db_client = await pool.connect();
    const topAll: number[] = [];
    const topMovies: number[] = [];
    try {
       const result = await db_client.query(allFilmsQuery);
       console.log(`Caching ${result.rows.length} films in Redis`);
       const multi = redisClient.multi();
        for(const film of result.rows){
            const key = `film:${film.id}`;
            film.averagerating = Number(film.averagerating);
            multi.set(key, JSON.stringify(film));
            topAll.push(film.id);
            if(film.category === 'movie'){
                topMovies.push(film.id);
            }
        }
        await multi.exec();
        await redisClient.set('bucket:easy', JSON.stringify(topMovies.slice(0, 500)));
        await redisClient.set('bucket:medium', JSON.stringify(topMovies.slice(0, 1200)));
        await redisClient.set('bucket:hard', JSON.stringify(topMovies.slice(0, 2500)));
        await redisClient.set('bucket:impossible', JSON.stringify(topAll.slice(0, 10000)));

       console.log(` ${symbols.success} Films cached in Redis!`);
    } catch (error) {
        console.log(`${symbols.fail} Failed to cache into Redis`);
        throw error;
    }
    finally{
        db_client.release();
    }
}

async function loadLeaderboard() {
    const client = await pool.connect();
    try{
        const leaderboardQuery = `
        SELECT * FROM
        (
            SELECT 
                l.googleSub, 
                l.difficulty, 
                l.score, 
                u.name, 
                u.picture, 
                u.email,
                ROW_NUMBER() OVER (
                    PARTITION BY l.difficulty 
                    ORDER BY l.score DESC, l.createdat ASC
                ) as rank
            FROM leaderboard l
            JOIN users u ON l.googleSub = u.googleSub 
            WHERE l.score > 0
        ) AS ranked
        WHERE rank <= 10;`;
        const leaderboardResults = await client.query(leaderboardQuery);
        //console.log(leaderboardResults.rows);
        const rows = leaderboardResults.rows;

        const groupedByDifficulty: Record<Difficulty, typeof rows> = {
            easy: [],
            medium: [],
            hard: [],
            impossible: [],
        };

        for (const row of rows) {
            groupedByDifficulty[row.difficulty as Difficulty].push(row);
            await redisClient.hSet(`userData:${row.googlesub}`,{
                name: row.name,
                picture: row.picture,
                email: row.email,
            });
            // console.log("Writing user data key:", `userData:${row.googlesub}`);
            // console.log(await redisClient.hGetAll(`userData:${row.googlesub}`));
            //await redisClient.expire(`userData:${row.googleSub}`, 60 * 60 * 24);
        }

        for(const difficulty of Object.keys(groupedByDifficulty) as Difficulty[]){
            const rows = groupedByDifficulty[difficulty];
            const entries = rows
            .filter(row => row.googlesub != null && row.score != null)
            .map(row => ({
                score: row.score,
                value: row.googlesub.toString(),
            }));
            
            await redisClient.del(`leaderboard:${difficulty}`);
            if (entries.length > 0) {
                await redisClient.zAdd(`leaderboard:${difficulty}`, entries);
            }
        }

    } catch (error){
        console.error("Failed to load leaderboard:", error);
    }
    finally{
        client.release();
    }
}

async function connectRedisAndLoad() {

    await redisClient.connect();
    await loadFilms();
    await loadLeaderboard();
}

export { redisClient, connectRedisAndLoad };