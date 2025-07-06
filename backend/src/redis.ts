import {symbols} from './helperFunctions'
import { createClient } from 'redis';
import pool from './database/db';

const redisClient = createClient();

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

async function connectRedisAndLoad() {

    await redisClient.connect();
    await loadFilms();
}

export { redisClient, connectRedisAndLoad };