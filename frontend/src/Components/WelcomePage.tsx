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
        <div className="bg-letterboxd-background min-h-screen w-full flex flex-col items-center justify-center">
            <h1 className="text-letterboxd-orange text-2xl">Letterboxd Higher or Lower Game</h1>
            <h2 className="text-xl text-letterboxd-orange ">Select a difficulty</h2>
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
            <button onClick={() => onLeaderboard()} className="my-6 px-4 py-2 bg-letterboxd-blue text-white rounded hover:bg-[#1093ef]">
                View Leaderboard
            </button>
            <GoogleSignInButton />
        </div>   
    )
}
