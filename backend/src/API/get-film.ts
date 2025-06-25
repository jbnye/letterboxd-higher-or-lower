import pool from "../database/db";
import path from "path";
import { RequestHandler,Router, Request, Response } from "express";

const router = Router();


function getDifficulty(difficulty: string): number{
  switch (difficulty.toLowerCase()) {
    case "easy": return 500;
    case "medium": return 1200;
    case "hard": return 2500;
    case "impossible": return 10000;
    default: return 0;
  }

}

const getFilmHandler: RequestHandler = async (req, res) => {
    const baseURL = `${req.protocol}://${req.get('host')}`;
    const { difficulty } = req.params;
    const filmIdsRaw = req.query.filmIds;
    if (!filmIdsRaw) {
        res.status(400).json({ error: "filmIds query parameter is required" });
        return;
    }
    const excludeFilms = filmIdsRaw.toString().split(",").map(id => parseInt(id, 10));
    if (excludeFilms.length !== 2) {
        res.status(400).json({ error: "Exactly two filmIds must be provided" }); 
        return;
    }

    let limit = getDifficulty(difficulty.toLowerCase());
    if(limit === 0){
        res.status(400).json({error:'Unknown difficulty'})
        return;

    }
    const client = await pool.connect();

    try {
        let getFilmQuery = `
            SELECT * FROM (
                SELECT * FROM films
                ${limit === 10000 ? "" : "WHERE category = 'movie'"}
                ORDER BY watchedNumber DESC
                LIMIT $1
            ) AS top_films
            WHERE id NOT IN ($2, $3)
            ORDER BY RANDOM()
            LIMIT 1
        `;

        const result = await client.query(getFilmQuery, [limit, excludeFilms[0], excludeFilms[1]]);

        if (result.rows.length === 0) {
            res.status(404).json({ error: "No film found" });
        }

        const film = result.rows[0];
        const filmData = {
            filmData: film,
            averageRating: parseFloat(film.averageRating),
            inHouseURL: `${baseURL}/posters/${film.slug}.jpg`
        };

        console.log("Sending film:", filmData);
        res.json({ filmData });
    } catch (err) {
        console.error("Error in getFilmHandler:", err);
        res.status(500).json({ error: "Internal server error" });
    } finally {
        client.release();
    }
};

const getFilmsHandler: RequestHandler = async (req, res) => {
    const {difficulty} = req.params;
    const baseURL = `${req.protocol}://${req.get('host')}`;
    const client = await pool.connect();
    let limit: number = getDifficulty(difficulty);
    if(limit === 0){
        res.status(400).json({error:'Unknown difficulty'})
        return;
    }
    try {
        let getFilmsQuery: string = `
            SELECT * FROM (
                SELECT * FROM films
                ${limit === 10000 ? "" : `WHERE category = 'movie'`}
                ORDER BY watchedNumber DESC LIMIT $1
            ) As top_films
            ORDER BY RANDOM() 
            LIMIT 2`;

        const result = await client.query(getFilmsQuery, [limit]);
        if (result && result.rows.length > 0) {
            const filmData = result.rows.map((film) => ({
                ...film,
                averageRating: parseFloat(film.averageRating),
                inHouseURL: `${baseURL}/posters/${film.slug}.jpg`
            }));
            console.log("Sending films: ", filmData);
            res.json({ filmData });
        } else {
            res.status(404).json({error:'No films found'})
        }
    } catch (error){
        console.error(error);
        res.status(500).json({error:'Error getFilmQuery'})
    }
    finally {
        client.release();
    }
};


router.get("/get-film/:difficulty", getFilmHandler);
router.get("/get-films/:difficulty", getFilmsHandler);
export default router;

