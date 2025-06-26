import pool from './db';

(async () => {
    try {

        await pool.query(`
            CREATE TABLE IF NOT EXISTS films (
                id SERIAL PRIMARY KEY,
                slug VARCHAR(128) UNIQUE NOT NULL,
                averageRating NUMERIC(3, 1) NOT NULL,
                watchedNumber INTEGER,
                title VARCHAR(128),
                year INTEGER,
                category varchar(16),
                posterURL TEXT,
                isTop250 BOOLEAN NOT NULL
            )
        `);
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                googleId TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                name TEXT,
                pictureURL TEXT
            )
        `);
        await pool.query(`
            CREATE TABLE IF NOT EXISTS leaderboard (
                id SERIAL PRIMARY KEY,
                googleId TEXT REFERENCES users(googleId),
                username TEXT,
                score INTEGER NOT NULL,
                difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard', 'impossible')),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        `);

        console.log('Table and Type initialized');
    } catch (error) {
        console.error('Error creating table or custom Type', error);
    } finally {
        await pool.end();
    }
})();