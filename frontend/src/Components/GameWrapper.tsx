import {useState} from "react";
import Game from "./Game.tsx";
import LostPage from "./LostPage.tsx";
import WelcomePage from "./WelcomePage.tsx";
import type { Difficulty} from "../types/types.ts";
//import { useAuth } from "@/Context/UserContext.tsx";
import LeaderboardPage from "./LeaderboardPage.tsx";
import AboutPage from "./AboutPage.tsx";
import Navbar from "./Navbar.tsx";
import Footer from "./Footer.tsx";
import ErrorPage from "./ErrorPage.tsx";
import { useGameStatus } from "@/Context/GameStatus.tsx";


export default function GameWrapper(){
    const [finalScore, setFinalScore] = useState<number>(0);
    const [difficultyPicked, setDifficultyPicked] = useState<Difficulty>("easy");
    const [prevHighscoreSnapshot, setPrevHighscoreSnapshot] =useState<number | undefined>();
    const [gameKey, setGameKey] = useState(0);
    //const {userHighscores} = useAuth();
    const [gameId, setGameId] = useState<string>("");
    const {gameStatus, setGameStatus} = useGameStatus();
    //const prevHighscore: number | undefined = userHighscores ? userHighscores[difficultyPicked] : undefined;
    //console.log("gameStatus", gameStatus);
    const validStatuses = ["Playing", "Error", "Lost", "Leaderboard", "Welcome", "About"];
    if (!validStatuses.includes(gameStatus)) {
        setGameStatus("Error");
    }
    const startNewGame = (chosenDifficulty: Difficulty) => {
    setDifficultyPicked(chosenDifficulty);
    setGameStatus("Playing");
    setGameKey(prev => prev + 1); 
    }

    return (
        <div className="flex flex-col bg-gradient-to-b from-letterboxd-lighter-gray to-letterboxd-light-gray
        dark:bg-gradient-to-b dark:from-letterboxd-background dark:to-letterboxd-dark-background-blue 
        min-h-dvh  w-full">
            {gameStatus !== "Playing" && <Navbar />}

            <main className="flex-grow ">
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
                        onStartGame={startNewGame}
                        finalScore={finalScore}
                        difficultyLastPlayed={difficultyPicked}
                        prevHighscore={prevHighscoreSnapshot}
                        gameId={gameId}
                    />
                )}
                {gameStatus === "Leaderboard" && (
                    <LeaderboardPage />
                )}
                {gameStatus === "Playing" && (
                <Game
                    key={gameKey}
                    difficulty={difficultyPicked}
                    onLose={(score: number, gameId: string,prevHighscoreSnapshot: number | undefined) => {
                        setGameStatus("Lost");
                        setFinalScore(score);
                        setGameId(gameId);
                        setPrevHighscoreSnapshot(prevHighscoreSnapshot);
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
