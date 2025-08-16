import { RequestHandler,Router} from "express";
import lastUpdated from "../data/lastUpdated.json";
const router = Router();


const getDateLastUpdated: RequestHandler = (req, res) => {
    try {
        return res.status(200).json({ dateLastUpdated: lastUpdated.dateLastUpdated });
    }
     catch (err) {
        console.error("Error reading last updated file", err);
        res.status(500).json({ error: "Could not fetch last updated timestamp" });
    }
}



router.get("/movies-last-updated", getDateLastUpdated);
export default router;
