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
        <div>
            <h1 className="justify-self-center">{`Final Score: ${finalScore}`}</h1>
            <DifficultyBoxes 
            onDifficultyChoice={(difficulty) => {
                setDifficultyPicked(difficulty);
            }} 
            difficultyPicked={difficultyPicked}
            />

            <button onClick={() => onStartGame(difficultyPicked)}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Play Again
            </button>
        </div>
    )
}