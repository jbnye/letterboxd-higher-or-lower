import pool from "../database/db";
import { RequestHandler,Router} from "express";
import { OAuth2Client } from "google-auth-library";
import {redisClient} from '../redis';

const router = Router();
const CLIENT_ID = process.env.Client_ID;
const client = new OAuth2Client(CLIENT_ID);
const googleAuthHandler: RequestHandler = async (req,res) => {
    const {token} = req.body;
    if (!token) return res.status(400).json({ error: "Token missing" });

    try{
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload) return res.status(401).json({"error": "Invalid Token"});

        const {sub, email, name, picture} = payload;

        //todo database

        const user = {sub, email, name, picture};
        console.log(user);
        //todo create cookie

        res.status(200).json({user})

    }catch (error){
        console.error("Token verification failed:", error);
        res.status(401).json({ error: "Invalid or expired token" });
    }
}

router.post("/google-auth", googleAuthHandler);
export default router;