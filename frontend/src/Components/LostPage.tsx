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
    //let isHighScore: "true" | "false" | "tied" | null = null;
    let title: string = "";
    const textFinalScore = `Final Score: ${finalScore}`
    let subtitle: string;
    if(prevHighscore !== undefined){
        if(prevHighscore > finalScore) {
            //isHighScore = "false";
            title = "Nice try!";
            subtitle = `Current highscore for ${difficultyLastPlayed} is ${prevHighscore}.`;
        } else if (prevHighscore === finalScore) {
            //isHighScore = "tied";
            title = "So Close!";
            subtitle = `Tied high score.`;
        } else {
            //isHighScore = "true";
            title = `Great Job!`;
            subtitle = `You have a new high score for ${difficultyLastPlayed}! (Previous was ${prevHighscore}).`;
        }
    } else {
        subtitle = `Make sure to log in to save scores.`;
    }
    
    return (
        <div className="w-full flex flex-col items-center justify-center px-4">
            <div className="flex flex-col  gap-2 md:gap-6 text-letterboxd-orange mt-3 md:mt-12 mb-2 text-center">
                <h1 className=" text-2xl md:text-4xl">{textFinalScore}</h1>
                {prevHighscore !== undefined && <span className=" text-xl md:text-2xl">{title}</span>}
                <p>{subtitle}</p>
            </div>
            <div className="flex ">
                <DifficultyBoxes
                onDifficultyChoice={(difficulty) => setDifficultyPicked(difficulty)}
                difficultyPicked={difficultyPicked}
                style="w-24 h-24 p-3 md:w-28 md:h-28 l:w-32 l:h-32"
                />
            </div>
                <div className="flex flex-col w-full md:w-auto gap-4 mt-12 md:mt-6">
                    <button
                        onClick={() => onStartGame(difficultyPicked)}
                        className="px-12 py-4 h-16 font-bold md:h-auto bg-letterboxd-blue text-white rounded hover:bg-[#1093ef]"
                    >
                        Play
                    </button>
                    <button
                        onClick={() => setGameStatus("Leaderboard")}
                        className="px-12 py-4 h-16 md:h-auto font-bold bg-letterboxd-blue text-white rounded hover:bg-[#1093ef]"
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
