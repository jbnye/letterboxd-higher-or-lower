import pool from "../database/db";
import path from "path";
import { RequestHandler,Router, Request, Response } from "express";

const router = Router();


function getDifficulty(difficulty: string): number{
    if (difficulty === "easy") return 300;
    else if (difficulty === "medium") return 600;
    else if (difficulty === "hard") return 1000;
    else if (difficulty === "impossible") return 10000;
    else return 0;

}

const getFilmHandler: RequestHandler = async (req, res) => {
    const { difficulty } = req.params;
    const filmIdsRaw = req.query.filmIds;
    if (!filmIdsRaw) {
        return res.status(400).json({ error: "filmIds query parameter is required" });
    }
    const excludeFilms = filmIdsRaw.toString().split(",").map(id => parseInt(id, 10));
    if (excludeFilms.length !== 2) {
        return res.status(400).json({ error: "Exactly two filmIds must be provided" });
    }

    const client = await pool.connect();

    let limit = getDifficulty(difficulty);
    if(limit === 0){
        res.status(400).json({error:'Unknown difficulty'})
        return;
    }

    let getFilmQuery = `SELECT * FROM films WHERE popularity <= $1`;
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
        res.json(result.rows.length > 0 ? result.rows[0] : {});
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

    const client = await pool.connect();
    let limit: number = getDifficulty(difficulty);
    if(limit === 0){
        res.status(400).json({error:'Unknown difficulty'})
        return;
    }
    const getFilmsQuery = `SELECT * FROM films where popularity <= $1 order by random() limit 2`;
    try{
        const result = await client.query(getFilmsQuery, [limit]);
        res.json(result.rows);
    } catch (error){
        console.error(error);
        res.status(500).json({error:'Error getFilmQuery'})
    }
    finally {
        client.release();
    }
};


router.get("/get-film/:difficulty", getFilmHandler);
router.get("get-films/:difficulty", getFilmsHandler);
export default router;

