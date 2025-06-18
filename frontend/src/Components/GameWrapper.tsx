import {useState} from "react";
import Game from "./Game.tsx";
import LostPage from "./LostPage.tsx";
import WelcomePage from "./WelcomePage.tsx";
import { useServerStatus } from '../Context/ServerStatusContext';
import {Spinner} from "../UI/spinner.tsx";
// to do import PlayAgainButton from "./PlayAgain.tsx";


type GameStatus = "Welcome" | "Playing" | "Lost";


export default function GameWrapper(){
    const {status} = useServerStatus();
    const [gameStatus, setGameStatus] = useState<GameStatus>('Welcome')
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
            <WelcomePage />
        )

    } else if(gameStatus === "Lost"){
        return (
            <LostPage />
        )
    }

    return ( <></>
    //<Game key={gameKey} onLose={() => setGameStatus("Lost")} />
    );
}
