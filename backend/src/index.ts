import dotenv from 'dotenv';
dotenv.config(); 
import express, {RequestHandler, Express, Request, Response} from "express";
import filmRouter from "./API/get-film";
import checkGuessRouter from "./API/check-guess";
import googleAuthRouter from "./API/google-auth";
import authStatusRouter from "./API/auth-status";
import cookieParser from "cookie-parser";
import logoutRouter from "./API/logout";
import highscoreRouter from "./API/get-highscores";
import timeoutRouter from "./API/timeout";
import leaderboardRouter from "./API/get-leaderboard";
import moviesLastUpdatedRouter from "./API/movies-last-updated";
import lostPageScoreRouter from "./API/lost-page-score";
import path from "path";
import cors from "cors";
import {connectRedisAndLoad} from './redis';

// const envFile = process.env.NODE_ENV === 'docker' ? '.env.docker' : '.env.local';
// dotenv.config({
//   path: path.resolve(__dirname, '..', envFile),
//   override: true,
// });

// console.log('Loaded env file:', envFile);
// console.log('DATABASE_URL:', process.env.DATABASE_URL);
// console.log('REDIS_URL:', process.env.REDIS_URL);

// console.log('NODE_ENV:', process.env.NODE_ENV);
// console.log('Loaded env file:', envFile);
// console.log('DATABASE_URL:', process.env.DATABASE_URL);
// console.log('REDIS_URL:', process.env.REDIS_URL);



const port: number = parseInt(process.env.PORT || "3000");

const app: Express = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173", 
  credentials: true, 
}));
app.use(cookieParser());
app.use(express.json());
app.use("/api", filmRouter);
app.use("/api", checkGuessRouter);
app.use("/api", googleAuthRouter);
app.use("/api", authStatusRouter);
app.use("/api", logoutRouter);
app.use("/api", highscoreRouter);
app.use("/api", timeoutRouter);
app.use("/api", leaderboardRouter);
app.use("/api/", moviesLastUpdatedRouter);
app.use("/api/", lostPageScoreRouter);
//app.use('/posters', express.static(path.resolve(__dirname, '..', 'posters')));

(async () =>  (
    await connectRedisAndLoad()
))();


app.get('/', (_req: Request, res: Response) => {
  res.send('Hello World!');
});

app.get("/api/ping", (_req,res)=> {
    res.send("Server is online");
});


// app.listen(port, '0.0.0.0', () => {
//   console.log(`Server running on http://0.0.0.0:${port}`);
// });
app.listen(port,() => {
  console.log(`Server running on port ${port}`);
});

app.get("/mock-lb-test", (_req: Request, res: Response) => {
    const mockHtml = `
    <html>
        <body>
            <ul class="film-list">
                <li data-year="2023">
                    <h2>Inception</h2>
                </li>
                <li data-year="1994">
                    <h2>Pulp Fiction</h2>
                </li>
            </ul>
        </body>
    </html>
    `;
    res.send(mockHtml)
});