import express, {RequestHandler, Express, Request, Response} from "express";
import cors from "cors";
import dotenv from 'dotenv';
dotenv.config();

const port: number = parseInt(process.env.PORT || "3000");

const app: Express = express();
app.use(cors());
app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
  res.send('Hello World!');
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});