import {Pool} from "pg";
import dotenv from 'dotenv';
import path from "path";
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

const pool = new Pool ({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: process.env.DB_PASSWORD,
    database: 'LetterboxdGame'
});

pool.connect()
    .then(client => {
        console.log('connected to Postgres');
        client.release();
    })
    .catch(err => {
        console.error('Failed to connect to Postgres', err);
    });

export default pool;