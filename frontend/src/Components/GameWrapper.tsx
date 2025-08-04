import {useState} from "react";
import Game from "./Game.tsx";
import LostPage from "./LostPage.tsx";
import WelcomePage from "./WelcomePage.tsx";
import { useServerStatus } from '../Context/ServerStatusContext';
import {Spinner} from "../UI/spinner.tsx";
import type { GameStatus, Difficulty} from "../types/types.ts";
import { useAuth } from "@/Context/UserContext.tsx";
import LeaderboardPage from "./LeaderboardPage.tsx";
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

    if(status === 'checking'){
        return (
            <div className="flex flex-col items-center mt-5">
                <Spinner /> 
            </div>
        )
    }
    if(gameStatus === 'Welcome'){
        return (
            <WelcomePage 
                onStartGame={(chosenDifficulty) => {
                    setDifficultyPicked(chosenDifficulty);
                    setGameStatus("Playing");
                }}
                onLeaderboard={() => {setGameStatus("Leaderboard")}}
            />
        )

    } else if(gameStatus === "Lost"){
        return (
            <LostPage 
                onStartGame={(chosenDifficulty) => {
                    setDifficultyPicked(chosenDifficulty);
                    setGameStatus("Playing");
                }}
                finalScore={finalScore}
                difficultyLastPlayed={difficultyPicked}
                prevHighscore={prevHighscore}

            />
        )
    } else if(gameStatus === "Leaderboard"){
        return(
            <LeaderboardPage 
                welcomePage={() =>{
                    setGameStatus("Welcome");
                }}
            />
        )
    }

    return (
        <>
            <Game 
                key={gameKey} 
                difficulty = {difficultyPicked} 
                onLose={(score: number) => {
                    setFinalScore(score);
                    setGameStatus("Lost");
                }} 
            />
        </>
    );

}
