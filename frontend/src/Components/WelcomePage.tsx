import {useState} from "react";
import DifficultyBoxes from "./DifficultyBoxes";
import type { Difficulty } from "../types/types";
import {useAuth} from '../Context/UserContext';
import GoogleSignInButton from "./SignInButton";
import { useGameStatus } from "@/Context/GameStatus";
interface WelcomePageProps {
    onStartGame: (difficulty: Difficulty) => void;
}




export default function WelcomePage({onStartGame}: WelcomePageProps){
    const {authStatus} = useAuth();
    const [difficultyPicked, setDifficultyPicked] = useState<Difficulty>("easy");
    const {setGameStatus} = useGameStatus();
    console.log(authStatus);

    return(
        <div className="h-full w-full flex flex-col items-center px-4">
            <h1 className="text-letterboxd-orange text-2xl md:text-4xl mt-5 md:mt-12 mb-4 text-center">Letterboxd Higher or Lower</h1>
            <h2 className="text-xl text-letterboxd-orange mb-4">Select a difficulty</h2>
            <div className="flex ">
                <DifficultyBoxes
                onDifficultyChoice={(difficulty) => setDifficultyPicked(difficulty)}
                difficultyPicked={difficultyPicked}
                style="w-24 h-24 p-3 md:w-32 md:h-32"
                />
            </div>
            <div className="flex flex-col w-full md:w-auto gap-4 mt-12 md:mt-6">
                <button
                    onClick={() => onStartGame(difficultyPicked)}
                    className="px-6 py-2 h-16 md:h-auto bg-letterboxd-blue text-white rounded hover:bg-[#1093ef]"
                >
                    Play
                </button>
                <button
                    onClick={() => setGameStatus("Leaderboard")}
                    className="px-6 py-2 h-16 md:h-auto bg-letterboxd-blue text-white rounded hover:bg-[#1093ef]"
                >
                    Leaderboard
                </button>
            </div>
            <div className="mt-10">
                <GoogleSignInButton />
            </div>
        </div>   
    )
}
