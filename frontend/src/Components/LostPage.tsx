import {useState, useEffect, useRef} from "react";
import DifficultyBoxes from "./DifficultyBoxes";
import type { Difficulty, Highscores} from "../types/types";
import GoogleSignInButton from "./SignInButton";
import { useAuth } from "@/Context/UserContext";
import { useGameStatus } from "@/Context/GameStatus";
import { Spinner } from "@/UI/spinner";






interface LostageProps {
    onStartGame: (difficulty: Difficulty) => void,
    finalScore: number,
    prevHighscore: number | undefined,
    difficultyLastPlayed: Difficulty,
    gameId: string,
    
}

interface LostPageScore {
    highscores: Highscores,
    isHighscore: boolean,
    previousHighscore: number,
}

export default function LostPage({onStartGame, finalScore, prevHighscore, difficultyLastPlayed, gameId}: LostageProps){
    const {user, setUserHighscores, userHasBeenChecked} = useAuth();
    const {setGameStatus} = useGameStatus();
    const prevUserRef = useRef(user);
    const [difficultyPicked, setDifficultyPicked] = useState<Difficulty>(difficultyLastPlayed);
    const [prevHighscoreFromBackend, setPrevHighscoreFromBackend] = useState<number>();
    const effectivePrevHighscore = prevHighscoreFromBackend !== undefined
        ? prevHighscoreFromBackend
        : prevHighscore;

    //console.log(gameId);

    useEffect(() => {
        // Only run if previously there was no user, and now there is a user
        if (!prevUserRef.current && user) {
            const lostPageScore = async () => {
                const controller = new AbortController();
                const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
                const response = await fetch(`${API_BASE}/api/lost-page-score`, {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({ user: user, gameId: gameId }),
                    credentials: "include",
                    signal: controller.signal
                });
                if(response.ok){
                    const data: LostPageScore = await response.json();
                    if(data.isHighscore === true){
                        setUserHighscores(data.highscores);
                        setPrevHighscoreFromBackend(data?.previousHighscore);
                    }
                }
            }
            lostPageScore();
        }
        prevUserRef.current = user;
    }, [user]);

    let title: string = "";
    const textFinalScore = `Final Score: ${finalScore}`
    let subtitle: string;
    if(effectivePrevHighscore !== undefined){
        if(effectivePrevHighscore > finalScore) {
            //isHighScore = "false";
            title = "Nice try!";
            subtitle = `Current highscore for ${difficultyLastPlayed} is ${effectivePrevHighscore}.`;
        } else if (effectivePrevHighscore === finalScore) {
            //isHighScore = "tied";
            title = "So Close!";
            subtitle = `Tied high score.`;
        } else {
            //isHighScore = "true";
            title = `Great Job!`;
            subtitle = `You have a new high score for ${difficultyLastPlayed}! (Previous was ${effectivePrevHighscore}).`;
        }
    } else {
        subtitle = `Make sure to log in to save scores.`;
    }
    
    return (
        <div className="w-full flex flex-col items-center justify-center px-4">
            <div className="flex flex-col  gap-2 md:gap-6 text-letterboxd-orange mt-3 md:mt-12 mb-2 text-center">
                <h1 className=" text-2xl md:text-4xl">{textFinalScore}</h1>
                {effectivePrevHighscore !== undefined && <span className=" text-xl md:text-2xl">{title}</span>}
                <p>{subtitle}</p>
            </div>
            <>
                <h2 className="text-xl text-letterboxd-orange mb-0">Select a difficulty</h2>
                <div className="flex ">
                    <DifficultyBoxes
                        onDifficultyChoice={(difficulty) => setDifficultyPicked(difficulty)}
                        difficultyPicked={difficultyPicked}
                        style="w-17 h-17 p-3 sm:w-28 sm:h-28 l:w-32 l:h-32"
                    />
                </div>
                    <div className="flex flex-col w-[80%] sm:w-[15%] sm:min-w-[200px] gap-4 mt-6 sm:mt-8">
                    <button
                        onClick={() => onStartGame(difficultyPicked)}
                        className="p-2 h-12 font-bold md:h-auto text-2xl  bg-letterboxd-blue text-white rounded hover:bg-[#1093ef]"
                    >
                        Play Again
                    </button>
                    <button
                        onClick={() => setGameStatus("Leaderboard")}
                        className="p-2 h-12 font-bold md:h-auto text-2xl  bg-letterboxd-blue text-white rounded hover:bg-[#1093ef]"
                    >
                        Leaderboard
                    </button>
                        <div className="mt-2">
                            {userHasBeenChecked === false ? <Spinner /> : (<GoogleSignInButton />)}
                        </div>
                </div>

            </>
        </div>
    );
}
