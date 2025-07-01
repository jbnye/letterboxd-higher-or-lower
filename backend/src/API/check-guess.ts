import { Client, Pool, PoolClient  } from "pg";
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
 
const checkGuessHandler: RequestHandler = async (req, res) => {
    const baseURL = `${req.protocol}://${req.get('host')}`;
    const { difficulty } = req.params;
    const filmIdsRaw = req.query.filmIds;
    const choice = parseInt(req.query.choice as string, 10);
    let correctChoice;
    
    if (!filmIdsRaw) {
        res.status(400).json({ error: "filmIds query parameter is required" });
        return;
    }
    if(choice !== 0 && choice !== 1 ){
        res.status(400).json({ error: "Invalid choice" });
        return;
    }
    const excludeFilms = filmIdsRaw.toString().split(",").map(id => parseInt(id, 10));
    let limit = getDifficulty(difficulty.toLowerCase());
    if(limit === 0){
        res.status(400).json({error:'Unknown difficulty'})
        return;

    }
    const client = await pool.connect();
    try{
        const checkGuessQuery = `
            SELECT id, slug, averagerating from films where id IN ($1, $2)
        `;
        const result = await client.query(checkGuessQuery, [excludeFilms[0], excludeFilms[1]]);
        const rows = result.rows;
        if (rows.length !== 2) {
            res.status(400).json({ error: "Could not find the two films to exclude" });
            return;
        }

        //swap if in the wrong order from the filmIdParams
        if (excludeFilms[0] !== rows[0].id) {
        [rows[0], rows[1]] = [rows[1], rows[0]];
        }

        const rating1 = parseFloat(rows[0].averagerating);
        const rating2 = parseFloat(rows[1].averagerating);
        const slug1 = rows[0].slug;
        const slug2 = rows[1].slug;
        if(rating1 > rating2){
            correctChoice = 0;
        }
        else{
            correctChoice = 1;
        }
        if(choice === correctChoice){
            const ranSelectedToRemove: number = Math.round(Math.random() * 1);
            const stayIndex: number = ranSelectedToRemove === 1 ? 0 : 1;
            const newFilm = await getFilmHelper(client, limit, rows[stayIndex].averagerating, excludeFilms, baseURL);

            res.status(200).json({
                success: true,
                correctChoice: correctChoice,
                replacedFilm: ranSelectedToRemove,
                filmRatings: {
                    film1: [slug1, rating1],
                    film2: [slug2, rating2]
                },
                newFilm: newFilm,
            });
        }
        else {
            res.status(200).json({
                success: false,
                correctChoice: correctChoice,
                filmRatings: {
                    film1: [slug1, rating1],
                    film2: [slug2, rating2]
                }
            })
        }
    } catch (error) {
        throw error;
    }
    finally{
        client.release();
    }

}

async function getFilmHelper(client: PoolClient, limit: number, excludedRating: number, excludedFilms: number[], baseURL: string){
    
    try{
        const getFilmQuery = `
            SELECT id, slug, title, year, posterurl FROM (
                SELECT * FROM films
                ${limit === 10000 ? "" : "WHERE category = 'movie'"}
                ORDER BY watchednumber DESC
                LIMIT $1
            ) AS film_list
             WHERE id NOT IN ($2, $3)
             AND ABS(averagerating - $4) > 0.01
             ORDER BY RANDOM()
             LIMIT 1
        `;
        const result = await client.query(getFilmQuery, [limit, excludedFilms[0], excludedFilms[1], excludedRating]);
        const film = result.rows[0];
        const newFilm = {
        ...film,
        inHouseURL: `${baseURL}/posters/${film.slug}.jpg`
        };
        return newFilm;
    } catch (error){
        throw error;
    }
}


router.get("/check-guess/:difficulty", checkGuessHandler);
export default router;
