import {useState} from "react";
import DifficultyBoxes from "./DifficultyBoxes";
import type { Difficulty } from "../types/types";

interface WelcomePageProps {
    onStartGame: (difficulty: Difficulty) => void;
}


export default function WelcomePage({onStartGame}: WelcomePageProps){
    const [difficultyPicked, setDifficultyPicked] = useState<Difficulty>("Easy");

    return(
        <div>
            <h1 className="justify-self-center">Letterboxd Higher or Lower Game</h1>
            <DifficultyBoxes 
            onDifficultyChoice={(difficulty) => {
                setDifficultyPicked(difficulty);
            }} 
            difficultyPicked={difficultyPicked}
            />

            <button onClick={() => onStartGame(difficultyPicked)}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Play
            </button>
        </div>

    )
}
