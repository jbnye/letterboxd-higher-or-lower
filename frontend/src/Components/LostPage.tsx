import {useState} from "react";
import DifficultyBoxes from "./DifficultyBoxes";
import type { Difficulty} from "../types/types";
import GoogleSignInButton from "./SignInButton";
import { useGameStatus } from "@/Context/GameStatus";

interface LostageProps {
    onStartGame: (difficulty: Difficulty) => void,
    finalScore: number,
    prevHighscore: number | undefined,
    difficultyLastPlayed: Difficulty,
    
}

export default function LostPage({onStartGame, finalScore, prevHighscore, difficultyLastPlayed, }: LostageProps){
    const [difficultyPicked, setDifficultyPicked] = useState<Difficulty>(difficultyLastPlayed);
    const {setGameStatus} = useGameStatus(); 
    let isHighScore: "true" | "false" | "tied" | null = null;
    let title: string;
    const textFinalScore = `Final Score: ${finalScore}`
    let subtitle: string;
    if(prevHighscore !== undefined){
        if(prevHighscore > finalScore) {
            isHighScore = "false";
            title = "Nice try!";
            subtitle = `Current highscore for ${difficultyLastPlayed} is ${prevHighscore}.`;
        } else if (prevHighscore === finalScore) {
            isHighScore = "tied";
            title = "So Close!";
            subtitle = `Tied high score.`;
        } else {
            isHighScore = "true";
            title = `Great Job!`;
            subtitle = `You have a new high score for ${difficultyLastPlayed}! (Previous was ${prevHighscore}).`;
        }
    } else {
        title = `Final Score: ${finalScore}`;
        subtitle = `Make sure to log in to save scores.`;
    }
    
    return (
        <div className="w-full flex flex-col items-center justify-center px-4">
            <div className="flex flex-col gap-6 text-letterboxd-orange  mt-12 mb-2 text-center">
                <div className="text-4xl">{textFinalScore}</div>
                <h1 className="text-2xl">{title}</h1>
                <p>{subtitle}</p>
            </div>

            <DifficultyBoxes
                onDifficultyChoice={(difficulty) => setDifficultyPicked(difficulty)}
                difficultyPicked={difficultyPicked}
                style="w-32 h-32"
            />

            <div className="flex flex-col gap-4 mt-6">
                <button
                    onClick={() => onStartGame(difficultyPicked)}
                    className="px-6 py-2 bg-letterboxd-blue text-white rounded hover:bg-[#1093ef]"
                >
                    Play
                </button>
                <button
                    onClick={() => setGameStatus("Leaderboard")}
                    className="px-6 py-2 bg-letterboxd-blue text-white rounded hover:bg-[#1093ef]"
                >
                    Leaderboard
                </button>
            </div>
            <div className="mt-10">
                <GoogleSignInButton />
            </div>
        </div>
    );
}
