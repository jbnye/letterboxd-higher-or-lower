import {useState} from "react";
import DifficultyBoxes from "./DifficultyBoxes";
import type { Difficulty} from "../types/types";
import GoogleSignInButton from "./SignInButton";

interface LostageProps {
    onStartGame: (difficulty: Difficulty) => void,
    finalScore: number,
    prevHighscore: number | undefined,
    difficultyLastPlayed: Difficulty,
    
}

export default function LostPage({onStartGame, finalScore, prevHighscore, difficultyLastPlayed, }: LostageProps){
    const [difficultyPicked, setDifficultyPicked] = useState<Difficulty>(difficultyLastPlayed);
    let isHighScore: "true" | "false" | "tied" | null = null;
    let title: string;
    let subtitle: string;
    if(prevHighscore !== undefined){
        if(prevHighscore > finalScore) {
            isHighScore = "false";
            title = "Nice try!";
            subtitle = `Final Score: ${finalScore}, your current highscore for ${difficultyLastPlayed} is ${prevHighscore}`;
        } else if (prevHighscore === finalScore) {
            isHighScore = "tied";
            title = "Nice try!";
            subtitle = `Final Score: ${finalScore} (Tied high score)`;
        } else {
            isHighScore = "true";
            title = `WOW! You have a new high score for ${difficultyLastPlayed}! (previous was ${prevHighscore})`;
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
            <GoogleSignInButton />
        </div>
    );
}
