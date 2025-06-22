import pool from "../database/db";
import path from "path";
import { RequestHandler,Router, Request, Response } from "express";

const router = Router();


function getDifficulty(difficulty: string): number{
  switch (difficulty.toLowerCase()) {
    case "easy": return 300;
    case "medium": return 600;
    case "hard": return 1000;
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

    const client = await pool.connect();

    let limit = getDifficulty(difficulty.toLowerCase());
    if(limit === 0){
        res.status(400).json({error:'Unknown difficulty'})
        return;
    }

    let getFilmQuery = `SELECT * FROM films WHERE popularityrank <= $1`;
    let values: (number | string)[] = [limit];
    if (excludeFilms && excludeFilms.length > 0) {
        const excludePlaceholders = excludeFilms
            .map((_, i) => `$${i + 2}`).join(',');
        getFilmQuery += ` AND id NOT IN (${excludePlaceholders})`;
        values = [limit, ...excludeFilms];
    }
    getFilmQuery += ` ORDER BY RANDOM() LIMIT 1`;
    try {
        const result = await client.query(getFilmQuery, values);
        if (result.rows.length > 0) {
            const film = result.rows[0]
            const filmData = {
                filmData: film,
                inHouseURL: `${baseURL}/posters/${result.rows[0].slug}.jpg`
            }
            console.log("Sending film: ", filmData);
            res.json({ filmData });
        } else {
            res.status(404).json({error:'No film found'})
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({error:'Error getFilmQuery'})
    }
    finally {
        client.release();
    }
};

const getFilmsHandler: RequestHandler = async (req, res) =>{
    const {difficulty} = req.params;
    const baseURL = `${req.protocol}://${req.get('host')}`;
    const client = await pool.connect();
    let limit: number = getDifficulty(difficulty);
    if(limit === 0){
        res.status(400).json({error:'Unknown difficulty'})
        return;
    }
    const getFilmsQuery = `SELECT * FROM films where popularityrank <= $1 order by random() limit 2`;
    try {
        const result = await client.query(getFilmsQuery, [limit]);
        if (result && result.rows.length > 0) {
            const filmData = result.rows.map((film) => ({
                ...film,
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

