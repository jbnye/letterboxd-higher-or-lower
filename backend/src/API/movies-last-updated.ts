import { RequestHandler,Router} from "express";
import fs from "fs";
import path from "path";
const router = Router();


const getDateLastUpdated: RequestHandler = (req, res) => {
    const filePath = path.resolve(__dirname, "data", "lastUpdated.json");
    try {
        const data = fs.readFileSync(filePath, "utf8");
        const { dateLastUpdated } = JSON.parse(data);
        res.json({ dateLastUpdated });
    } catch (err) {
        console.error("Error reading last updated file", err);
        res.status(500).json({ error: "Could not fetch last updated timestamp" });
    }
}



router.get("/movies-last-updated", getDateLastUpdated);
export default router;
