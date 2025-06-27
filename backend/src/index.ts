import express, {RequestHandler, Express, Request, Response} from "express";
import filmRouter from "./API/get-film";
import checkGuessRouter from "./API/check-guess";
import path from "path";
import cors from "cors";
import dotenv from 'dotenv';
dotenv.config();

const port: number = parseInt(process.env.PORT || "3000");

const app: Express = express();
app.use(cors());
app.use(express.json());
app.use("/api", filmRouter);
app.use("/api", checkGuessRouter);
app.use('/posters', express.static(path.resolve(__dirname, '..', 'posters')));



app.get('/', (_req: Request, res: Response) => {
  res.send('Hello World!');
});

app.get("/ping", (_req,res)=> {
    res.send("Server is online");
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
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