import pool from './db';

(async () => {
    try {

        await pool.query(`
            CREATE TABLE IF NOT EXISTS films (
                id SERIAL PRIMARY KEY,
                slug VARCHAR(64) UNIQUE NOT NULL,
                averageRating NUMERIC(3, 2) NOT NULL,
                title VARCHAR(64),
                posterURL TEXT,
                isTop250 BOOLEAN NOT NULL,
                popularityRank INTEGER UNIQUE NOT NULL
            )
        `);
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                googleSub TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                name TEXT,
                picture TEXT,
                createdate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                lastlogin TIMESTAMP
            )
        `);
        await pool.query(`
            CREATE TABLE IF NOT EXISTS leaderboard (
                googleSub TEXT REFERENCES users(googleSub),
                difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard', 'impossible')),
                score INTEGER NOT NULL,
                createdat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                PRIMARY KEY (googleSub, difficulty)
            );
        `);

        console.log('Table and Type initialized');
    } catch (error) {
        console.error('Error creating table or custom Type', error);
    } finally {
        await pool.end();
    }
})();