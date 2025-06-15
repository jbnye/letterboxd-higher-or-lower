import {Pool} from "pg";
import dotenv from 'dotenv';
dotenv.config();

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