import pool from "../database/db";
import { RequestHandler,Router} from "express";

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
        const getFirstFilmQuery = `
            SELECT id, slug, averagerating, title, year, posterurl
            FROM films ${limit !== 10000 ? "WHERE category = 'movie'": ""}
            ORDER BY watchedNumber DESC
            OFFSET FLOOR(RANDOM() * $1)
            LIMIT 1
        `;
        const firstFilmResult = await client.query(getFirstFilmQuery, [limit]);
        const film1Row = firstFilmResult.rows[0];
        const excludeRatingFromFirstFilm =  firstFilmResult.rows[0].averagerating;
        const film1 = {
            id: film1Row.id1,
            slug: film1Row.slug1,
            // averageRating: film1Row.averagerating1,
            title: film1Row.title1,
            year: film1Row.year1,
            posterurl: film1Row.posterurl1,
            inHouseURL: `${baseURL}/posters/${film1Row.slug1}.jpg`
            // isTop250: film1Row.istop2501
        }

        const getSecondFilmQuery = `
            SELECT id, slug, averagerating, title, year, posterurl
            FROM films ${limit !== 10000 ? "WHERE category = 'movie AND '": "WHERE "}
            averagerating <> $1
            ORDER BY watchedNumber DESC
            OFFSET FLOOR(RANDOM() * $2)
            LIMIT 1
        `;
        const secondFilmResult = await client.query(getSecondFilmQuery, [excludeRatingFromFirstFilm,limit]);
        const film2Row = secondFilmResult.rows[0];

        const film2 = {
            id: film2Row.id,
            slug: film2Row.slug,
            // averageRating: film2Row.averagerating2,
            title: film2Row.title,
            year: film2Row.year,
            posterurl: film2Row.posterurl,
            inHouseURL: `${baseURL}/posters/${film2Row.slug}.jpg`
            // isTop250: film2Row.istop2502
        };

        console.log("Fetched two films: ", film1, film2);
        res.json({ newFilms: [film1, film2] });
    } catch (error){
        console.error(error);
        res.status(500).json({error:'Error getFilmQuery'})
    }
    finally {
        client.release();
    }
};


router.get("/get-films/:difficulty", getFilmsHandler);
export default router;

