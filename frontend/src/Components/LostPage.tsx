import {useState} from "react";
import DifficultyBoxes from "./DifficultyBoxes";
import type { Difficulty } from "../types/types";

interface LostageProps {
    onStartGame: (difficulty: Difficulty) => void,
    finalScore: number
}

export default function LostPage({onStartGame, finalScore}: LostageProps){
    const [difficultyPicked, setDifficultyPicked] = useState<Difficulty>("Easy");
    return(
        <div className="bg-letterboxd-background min-h-screen w-full flex flex-col items-center justify-center">
            <h1 className=" text-2xl text-letterboxd-orange justify-self-center">{`Final Score: ${finalScore}`}</h1>
            <DifficultyBoxes 
            onDifficultyChoice={(difficulty) => {
                setDifficultyPicked(difficulty);
            }} 
            difficultyPicked={difficultyPicked}
            />

            <button onClick={() => onStartGame(difficultyPicked)}
            className="mt-6 px-4 py-2 bg-letterboxd-blue text-white rounded hover:bg-[#1093ef]">
                Play Again
            </button>
        </div>
    )
}