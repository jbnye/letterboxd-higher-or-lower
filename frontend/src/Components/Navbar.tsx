import type { GameStatus } from "@/types/types"

interface NavbarProps {
    setGameStatus: (gameStatus: GameStatus) => void
}


export default function Navbar({setGameStatus}: NavbarProps) {

    return(
        <div className="flex gap-6 justify-center bg-letterboxd-dark-blue text-bold text-white ">
            <div className=" relative group p-2">
                <button onClick={() => setGameStatus("Welcome")}>
                    Home
                </button>
                <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-letterboxd-light-gray transition-all duration-300 group-hover:w-full"></span>
            </div>
            <div className="relative group p-2">
                <button onClick={() => setGameStatus("Leaderboard")}>
                    Leaderboard
                </button>
                <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-letterboxd-light-gray transition-all duration-300 group-hover:w-full"></span>
            </div>
            <div className="relative group p-2" >
                <button onClick={() => setGameStatus("About")}>
                    About
                </button>
                <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-letterboxd-light-gray transition-all duration-300 group-hover:w-full"></span>
            </div>
        </div>
    )
}