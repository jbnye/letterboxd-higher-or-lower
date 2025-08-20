import pool from "../database/db";
import { RequestHandler, Router } from "express";
import jwt from "jsonwebtoken";
import { symbols } from "../helperFunctions";

const JWT_SECRET = process.env.JWT_SECRET!;
const ONE_DAY = 24 * 60 * 60; // seconds

const router = Router();


async function fetchGoogleUserInfo(access_token: string) {
  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!res.ok) {
    throw new Error(`Google UserInfo request failed: ${res.status}`);
  }

  return (await res.json()) as {
    sub: string;
    email: string;
    name: string;
    picture: string;
  };
}

const googleAuthHandler: RequestHandler = async (req, res) => {
  const { token: access_token } = req.body; // frontend sends { token: access_token }
  if (!access_token) {
    return res.status(400).json({ error: "Access token missing" });
  }

  try {
    const { sub, email, name, picture } = await fetchGoogleUserInfo(access_token);
    const client = await pool.connect();

    try {
      await client.query(
        `INSERT INTO users (googleSub, email, name, picture, lastlogin)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
         ON CONFLICT (googleSub) DO UPDATE 
         SET lastlogin = CURRENT_TIMESTAMP`,
        [sub, email, name, picture]
      );
    } catch (dbErr) {
      console.error(symbols.fail, "FAILED TO CHECK DB OR INSERT OR UPDATE USER", dbErr);
    } finally {
      client.release();
    }


    const JWTtoken = jwt.sign(
      { sub, email, name, picture },
      JWT_SECRET,
      { expiresIn: ONE_DAY }
    );

    res.cookie("token", JWTtoken, {
      httpOnly: true,
      secure: true,
      maxAge: ONE_DAY * 1000,
      sameSite: "none",
    });

    res.status(200).json({ user: { sub, email, name, picture } });
  } catch (error) {
    console.error("Google auth failed:", error);
    res.status(401).json({ error: "Invalid or expired Google access token" });
  }
};

router.post("/google-auth", googleAuthHandler);
export default router;