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

// const getFilmHandler: RequestHandler = async (req, res) => {
//     const baseURL = `${req.protocol}://${req.get('host')}`;
//     const { difficulty } = req.params;
//     const filmIdsRaw = req.query.filmIds;
//     const excludedRating = req.query.excludedRating;
//     if (!filmIdsRaw) {
//         res.status(400).json({ error: "filmIds query parameter is required" });
//         return;
//     }
//     const excludeFilms = filmIdsRaw.toString().split(",").map(id => parseInt(id, 10));
//     if (excludeFilms.length !== 2) {
//         res.status(400).json({ error: "Exactly two filmIds must be provided" }); 
//         return;
//     }

//     let limit = getDifficulty(difficulty.toLowerCase());
//     if(limit === 0){
//         res.status(400).json({error:'Unknown difficulty'})
//         return;

//     }
//     const client = await pool.connect();

//     try {
//         let getFilmQuery = `
//             SELECT id, slug, title, year, posterurl  FROM (
//                 SELECT * FROM films
//                 ${limit === 10000 ? "" : "WHERE category = 'movie'"}
//                 ORDER BY watchedNumber DESC
//                 LIMIT $1
//             ) AS top_films
//             WHERE id NOT IN ($2, $3)
//             AND averagerating <> $4
//             ORDER BY RANDOM()
//             LIMIT 1
//         `;

//         const result = await client.query(getFilmQuery, [limit, excludeFilms[0], excludeFilms[1], excludedRating]);

//         if (result.rows.length === 0) {
//             res.status(404).json({ error: "No film found" });
//         }

//         const newFilm = {
//         ...result.rows[0],
//         inHouseURL: `${baseURL}/posters/${result.rows[0].slug}.jpg`
//         };

//         console.log("Sending film:", newFilm);
//         res.json({ newFilm });
//     } catch (err) {
//         console.error("Error in getFilmHandler:", err);
//         res.status(500).json({ error: "Internal server error" });
//     } finally {
//         client.release();
//     }
// };

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
            SELECT   
            f1.id AS id1,
            f1.slug AS slug1,
            f1.watchednumber AS watchednumber1,
            f1.title as title1,
            f1.year as year1,
            f1.posterurl as posterurl1,
            f2.id AS id2,
            f2.slug AS slug2,
            f2.watchednumber AS watchednumber2,
            f2.title as title2,
            f2.year as year2,
            f2.posterurl as posterurl2
            FROM (
                SELECT * FROM films
                ${limit === 10000 ? "" : "WHERE category = 'movie'"}
                ORDER BY watchedNumber DESC
                LIMIT $1
            ) f1
             JOIN (
                SELECT * FROM films
                ${limit === 10000 ? "" : "WHERE category = 'movie'"}
                ORDER BY watchedNumber DESC
                LIMIT $1
            ) f2
            ON f1.averagerating <> f2.averagerating
            AND f1.id <> f2.id
            ORDER BY RANDOM()
            LIMIT 1
        `;

        const result = await client.query(getFilmsQuery, [limit]);
        const row = result.rows[0];
        if (result && result.rows.length > 0) {
            const film1 = {
                id: row.id1,
                slug: row.slug1,
                // averageRating: row.averagerating1,
                title: row.title1,
                year: row.year1,
                posterurl: row.posterurl1,
                inHouseURL: `${baseURL}/posters/${row.slug1}.jpg`
                // isTop250: row.istop2501
            };

            const film2 = {
                id: row.id2,
                slug: row.slug2,
                // averageRating: row.averagerating2,
                title: row.title2,
                year: row.year2,
                posterurl: row.posterurl2,
                inHouseURL: `${baseURL}/posters/${row.slug2}.jpg`
                // isTop250: row.istop2502
            };

            res.json({ newFilms: [film1, film2] });
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


// router.get("/get-film/:difficulty", getFilmHandler);
router.get("/get-films/:difficulty", getFilmsHandler);
export default router;

