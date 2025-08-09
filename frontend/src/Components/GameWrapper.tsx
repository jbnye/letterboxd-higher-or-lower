import {useState} from "react";
import Game from "./Game.tsx";
import LostPage from "./LostPage.tsx";
import WelcomePage from "./WelcomePage.tsx";
import { useServerStatus } from '../Context/ServerStatusContext';
import {Spinner} from "../UI/spinner.tsx";
import type { GameStatus, Difficulty} from "../types/types.ts";
import { useAuth } from "@/Context/UserContext.tsx";
import LeaderboardPage from "./LeaderboardPage.tsx";
import AboutPage from "./AboutPage.tsx";
import Navbar from "./Navbar.tsx";
import Footer from "./Footer.tsx";
import ErrorPage from "./ErrorPage.tsx";
import { useGameStatus } from "@/Context/GameStatus.tsx";
// to do import PlayAgainButton from "./PlayAgain.tsx";




export default function GameWrapper(){
    const {status} = useServerStatus();
    const [finalScore, setFinalScore] = useState<number>(0);
    const [difficultyPicked, setDifficultyPicked] = useState<Difficulty>("easy");
    const [gameKey, setGameKey] = useState(0);
    const {userHighscores} = useAuth();
    const {gameStatus, setGameStatus} = useGameStatus();
    const prevHighscore: number | undefined = userHighscores ? userHighscores[difficultyPicked] : undefined;
    console.log("gameStatus", gameStatus);

    const startNewGame = () => {
        setGameKey(prev=>prev + 1);
        setGameStatus('Playing');
    }

    return (
        <div className="bg-gradient-to-b flex flex-col from-letterboxd-background to-letterboxd-dark-background-blue min-h-screen w-full">
            {gameStatus !== "Playing" && <Navbar />}

            <main className="flex-grow ">
                {status === "checking" && (
                <div className="flex flex-col items-center mt-5">
                    <Spinner />
                </div>
                )}
                {gameStatus === "Welcome" && (
                    <WelcomePage
                        onStartGame={(chosenDifficulty) => {
                        setDifficultyPicked(chosenDifficulty);
                        setGameStatus("Playing");
                        }}
                    />
                )}
                {gameStatus === "Lost" && (
                    <LostPage
                        onStartGame={(chosenDifficulty) => {
                        setDifficultyPicked(chosenDifficulty);
                        setGameStatus("Playing");
                        }}
                        finalScore={finalScore}
                        difficultyLastPlayed={difficultyPicked}
                        prevHighscore={prevHighscore}
                    />
                )}
                {gameStatus === "Leaderboard" && (
                    <LeaderboardPage />
                )}
                {gameStatus === "Playing" && (
                    <Game
                    key={gameKey}
                    difficulty={difficultyPicked}
                    onLose={(score: number) => {
                    setFinalScore(score);
                    setGameStatus("Lost");
                    }}
                />
                )}
                {gameStatus === "About" && (
                    <AboutPage />
                )}
                {gameStatus === "Error" && (
                    <ErrorPage />
                )}
            </main>
            {gameStatus !== "Playing" && <Footer/>}
        </div>
    );
}
