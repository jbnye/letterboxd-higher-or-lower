import { useGameStatus } from "@/Context/GameStatus"
import type { GameStatus } from "@/types/types"
import DarkModeSwitch from "./DarkModeSwitch";
import { useThemeContext } from "@/Context/ThemeStatus";

type ButtonConfig = {
    label: string;
    status: GameStatus;
};

export default function Navbar() {
    const {setGameStatus} = useGameStatus();
    const {breakpoint} = useThemeContext();
    const buttons: ButtonConfig[] = [
    { label: "Home", status: "Welcome" },
    { label: "Leaderboard", status: "Leaderboard" },
    { label: "About", status: "About" }
    ];
    return (
    <div className={`flex gap-6 p-1 justify-center md:justify-end xl:mr-3 text-bold text-slate-gray dark:text-white`}>
        {buttons.map(({ label, status }) => (
        <button
            key={label}
            onClick={() => setGameStatus(status as GameStatus)}
            className="relative group p-2 hover:cursor-pointer"
        >
            {label}
            <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-slate-gray dark:bg-letterboxd-light-gray transition-all duration-300 group-hover:w-full" />
        </button>
        ))}
        {breakpoint === "desktop" && <DarkModeSwitch />}
    </div>
    );
}