import {useState} from "react";
import DifficultyBoxes from "./DifficultyBoxes";
import type { Difficulty } from "../types/types";

interface WelcomePageProps {
    onStartGame: (difficulty: Difficulty) => void;
}


export default function WelcomePage({onStartGame}: WelcomePageProps){
    const [difficultyPicked, setDifficultyPicked] = useState<Difficulty>("Easy");

    return(
        <div className="bg-letterboxd-background min-h-screen w-full flex flex-col items-center justify-center">
            <h1 className="text-letterboxd-orange text-2xl">Letterboxd Higher or Lower Game</h1>
            <DifficultyBoxes 
            onDifficultyChoice={(difficulty) => {
                setDifficultyPicked(difficulty);
            }} 
            difficultyPicked={difficultyPicked}
            />

            <button onClick={() => onStartGame(difficultyPicked)}
            className="mt-6 px-4 py-2 bg-letterboxd-blue text-white rounded hover:bg-[#1093ef]">
                Play
            </button>
        </div>   
    )
}
