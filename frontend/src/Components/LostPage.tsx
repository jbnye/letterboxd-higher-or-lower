import {useState} from "react";
import DifficultyBoxes from "./DifficultyBoxes";
import type { Difficulty} from "../types/types";
import { useAuth } from "../Context/UserContext";

interface LostageProps {
    onStartGame: (difficulty: Difficulty) => void,
    finalScore: number,
    difficultyLastPlayed: Difficulty,
}

export default function LostPage({onStartGame, finalScore, difficultyLastPlayed}: LostageProps){
    const [difficultyPicked, setDifficultyPicked] = useState<Difficulty>("easy");
    const {userHighscores} = useAuth();
    const currentDifficultyHighscore = userHighscores ? userHighscores[difficultyLastPlayed] : null;
    let isHighScore: "true" | "false" | "tied" | null = null;
    let title: string;
    let subtitle: string;
    if(currentDifficultyHighscore !== null){
        if(currentDifficultyHighscore > finalScore) {
            isHighScore = "false";
            title = "Nice try!";
            subtitle = `Final Score: ${finalScore}`;
        } else if (currentDifficultyHighscore === finalScore) {
            isHighScore = "tied";
            title = "Nice try!";
            subtitle = `Final Score: ${finalScore} (Tied high score)`;
        } else {
            isHighScore = "true";
            title = "WOW! You have a new high score!";
            subtitle = `New High Score: ${finalScore}`;
        }
    } else {
        title = `Final Score: ${finalScore}`;
        subtitle = `Make sure to log in to save scores.`;
    }

    return (
        <div className="bg-letterboxd-background min-h-screen w-full flex flex-col items-center justify-center">
            <div className="text-2xl text-letterboxd-orange justify-self-center text-center">
                <div>{title}</div>
                <div>{subtitle}</div>
            </div>

            <DifficultyBoxes
                onDifficultyChoice={(difficulty) => setDifficultyPicked(difficulty)}
                difficultyPicked={difficultyPicked}
            />

            <button
                onClick={() => onStartGame(difficultyPicked)}
                className="mt-6 px-4 py-2 bg-letterboxd-blue text-white rounded hover:bg-[#1093ef]"
            >
                Play Again
            </button>
        </div>
    );
}
