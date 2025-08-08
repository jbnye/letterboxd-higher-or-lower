import {useState} from "react";
import DifficultyBoxes from "./DifficultyBoxes";
import type { Difficulty } from "../types/types";
import {useAuth} from '../Context/UserContext';
import GoogleSignInButton from "./SignInButton";
import LeaderboardPage from "./LeaderboardPage";
interface WelcomePageProps {
    onStartGame: (difficulty: Difficulty) => void;
    onLeaderboard: () => void;
}




export default function WelcomePage({onStartGame, onLeaderboard}: WelcomePageProps){
    const {authStatus} = useAuth();
    const [difficultyPicked, setDifficultyPicked] = useState<Difficulty>("easy");
    console.log(authStatus);

    return(
        <div className="h-full w-full flex flex-col items-center px-4">
            <h1 className="text-letterboxd-orange text-4xl mt-12 mb-4 text-center">Letterboxd Higher or Lower Game</h1>
            <h2 className="text-xl text-letterboxd-orange mb-4">Select a difficulty</h2>
            <div className="flex ">
                <DifficultyBoxes
                onDifficultyChoice={(difficulty) => setDifficultyPicked(difficulty)}
                difficultyPicked={difficultyPicked}
                style="w-32 h-32"
                />
            </div>
            <div className="flex flex-col gap-4 mt-6">
                <button
                    onClick={() => onStartGame(difficultyPicked)}
                    className="px-6 py-2 bg-letterboxd-blue text-white rounded hover:bg-[#1093ef]"
                >
                    Play
                </button>
                <button
                    onClick={onLeaderboard}
                    className="px-6 py-2 bg-letterboxd-blue text-white rounded hover:bg-[#1093ef]"
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
