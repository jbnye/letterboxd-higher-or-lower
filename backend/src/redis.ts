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

export async function loadLeaderboard() {
    const client = await pool.connect();

    try {
        const leaderboardQuery = `
        SELECT * FROM
        (
            SELECT l.googleSub, l.difficulty, l.score, u.name, u.picture, u.email,
                ROW_NUMBER() OVER (
                    PARTITION BY l.difficulty 
                    ORDER BY l.score DESC, l.createdat ASC
                ) as rank
            FROM leaderboard l
            JOIN users u ON l.googleSub = u.googleSub 
            WHERE l.score > 0
        ) AS ranked
        WHERE rank <= 10;`;

        const { rows } = await client.query(leaderboardQuery);

        const leaderboardMap: Record<Difficulty, any[]> = {
            easy: [],
            medium: [],
            hard: [],
            impossible: [],
        };

        const groupedByDifficulty: Record<Difficulty, typeof rows> = {
            easy: [],
            medium: [],
            hard: [],
            impossible: [],
        };

        for (const row of rows) {
            const diff = row.difficulty.toLowerCase() as Difficulty; // normalize
            if (groupedByDifficulty[diff]) {
                groupedByDifficulty[diff].push(row);
            }
        }

        for (const difficulty of Object.keys(groupedByDifficulty) as Difficulty[]) {
            const leaderboardArray = groupedByDifficulty[difficulty].map(row => ({
                score: row.score,
                //googleSub: row.googlesub
                name: row.name,
                picture: row.picture,
                //email: row.email,
            }));

            await redisClient.set(
                `leaderboard:${difficulty}`,
                JSON.stringify(leaderboardArray),
            );
        }
         console.log("Leaderboard cached in Redis!");
    } finally {
        client.release();
    }
}

async function connectRedisAndLoad() {

    await redisClient.connect();
    await loadFilms();
    await loadLeaderboard();
}

export { redisClient, connectRedisAndLoad };