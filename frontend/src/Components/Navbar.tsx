import type { GameStatus } from "@/types/types"

interface NavbarProps {
    setGameStatus: (gameStatus: GameStatus) => void
}


export default function Navbar({setGameStatus}: NavbarProps) {

    return(
        <div className="flex gap-6 justify-center bg-letterboxd-dark-blue text-bold text-white">
            <div className="hover:bg-letterboxd-light-gray p-2">
                <button onClick={() => setGameStatus("Welcome")}>
                    Home
                </button>
            </div>
            <div className="hover:bg-letterboxd-light-gray p-2">
                <button onClick={() => setGameStatus("Leaderboard")}>
                    Leaderboard
                </button>
            </div>
            <div className="hover:bg-letterboxd-light-gray p-2" >
                <button onClick={() => setGameStatus("About")}>
                    About
                </button>
            </div>
        </div>
    )
}