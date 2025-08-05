import {useState} from "react";
import Game from "./Game.tsx";
import LostPage from "./LostPage.tsx";
import WelcomePage from "./WelcomePage.tsx";
import { useServerStatus } from '../Context/ServerStatusContext';
import {Spinner} from "../UI/spinner.tsx";
import type { GameStatus, Difficulty} from "../types/types.ts";
import { useAuth } from "@/Context/UserContext.tsx";
import LeaderboardPage from "./LeaderboardPage.tsx";
import Navbar from "./Navbar.tsx";
// to do import PlayAgainButton from "./PlayAgain.tsx";




export default function GameWrapper(){
    const {status} = useServerStatus();
    const [finalScore, setFinalScore] = useState<number>(0);
    const [gameStatus, setGameStatus] = useState<GameStatus>('Welcome');
    const [difficultyPicked, setDifficultyPicked] = useState<Difficulty>("easy");
    const [gameKey, setGameKey] = useState(0);
    const {userHighscores} = useAuth();
    const prevHighscore: number | undefined = userHighscores ? userHighscores[difficultyPicked] : undefined;
    console.log("gameStatus", gameStatus);

    const startNewGame = () => {
        setGameKey(prev=>prev + 1);
        setGameStatus('Playing');
    }

    return (
        <div className="bg-gradient-to-b from-letterboxd-background to-letterboxd-dark-background-blue min-h-screen w-full">
            {gameStatus !== "Playing" && <Navbar setGameStatus={setGameStatus} />}

            {status === "checking" ? (
            <div className="flex flex-col items-center mt-5">
                <Spinner />
            </div>
            ) : gameStatus === "Welcome" ? (
            <WelcomePage
                onStartGame={(chosenDifficulty) => {
                setDifficultyPicked(chosenDifficulty);
                setGameStatus("Playing");
                }}
                onLeaderboard={() => setGameStatus("Leaderboard")}
            />
            ) : gameStatus === "Lost" ? (
            <LostPage
                onStartGame={(chosenDifficulty) => {
                setDifficultyPicked(chosenDifficulty);
                setGameStatus("Playing");
                }}
                finalScore={finalScore}
                difficultyLastPlayed={difficultyPicked}
                prevHighscore={prevHighscore}
            />
            ) : gameStatus === "Leaderboard" ? (
            <LeaderboardPage
                welcomePage={() => setGameStatus("Welcome")}
            />
            ) : (
            <Game
                key={gameKey}
                difficulty={difficultyPicked}
                onLose={(score: number) => {
                setFinalScore(score);
                setGameStatus("Lost");
                }}
            />
            )}
        </div>
    );
}
