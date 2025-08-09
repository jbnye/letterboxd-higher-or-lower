import {createContext, useContext, useState, useMemo} from "react";
import type { GameStatus } from "@/types/types";

interface GameStatusContextProps{
    gameStatus: GameStatus;
    setGameStatus: (status: GameStatus) => void;
}
const GameStatusContext = createContext<GameStatusContextProps | undefined> (undefined);

export function GameStatusProvider({children}: ({children: React.ReactNode})) {
    const [gameStatus, setGameStatus] = useState<GameStatus>("Welcome");
    const value = useMemo(() => ({ gameStatus, setGameStatus }), [gameStatus]);
    return (
        <GameStatusContext.Provider value={value}>
            {children}
        </GameStatusContext.Provider>
    );
}

export function useGameStatus() {
    const context = useContext(GameStatusContext);
    if(!context) throw new Error("UseGameStatus Error, No Context");
    return context;
}