import {useState} from "react";
import Game from "./Game.tsx";
import LostPage from "./LostPage.tsx";
import WelcomePage from "./WelcomePage.tsx";
import { useServerStatus } from '../Context/ServerStatusContext';
import {Spinner} from "../UI/spinner.tsx";
import type { GameStatus, Difficulty} from "../types/types.ts";
// to do import PlayAgainButton from "./PlayAgain.tsx";




export default function GameWrapper(){
    const {status} = useServerStatus();
    const [gameStatus, setGameStatus] = useState<GameStatus>('Welcome');
    const [difficultyPicked, setDifficultyPicked] = useState<Difficulty>("Easy");
    const [gameKey, setGameKey] = useState(0);
    console.log(gameStatus);

    const startNewGame = () => {
        setGameKey(prev=>prev + 1);
        setGameStatus('Playing');
    }

    if(status === 'checking'){
        return (
            <div className="flex flex-col items-center mt-5">
                <Spinner /> 
            </div>
        )
    }
    if(gameStatus === 'Welcome'){
        return (
            <WelcomePage 
            onStartGame={(chosenDifficulty) => {
                setDifficultyPicked(chosenDifficulty);
                setGameStatus("Playing");
            }}
            />
        )

    } else if(gameStatus === "Lost"){
        return (
            <LostPage />
        )
    }

    return (
        <>
            <Game key={gameKey} difficulty = {difficultyPicked} onLose={() => setGameStatus("Lost")} />
        </>
    );

}
