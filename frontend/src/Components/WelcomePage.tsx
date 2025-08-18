import {useState} from "react";
import DifficultyBoxes from "./DifficultyBoxes";
import type { Difficulty } from "../types/types";
import {useAuth} from '../Context/UserContext';
import GoogleSignInButton from "./SignInButton";
import {Spinner} from "../UI/spinner.tsx";
import { useServerStatus } from "@/Context/ServerStatusContext";
interface WelcomePageProps {
    onStartGame: (difficulty: Difficulty) => void;
}




export default function WelcomePage({ onStartGame }: WelcomePageProps) {
    const { userHasBeenChecked } = useAuth();
    const { status, serverHasBeenChecked } = useServerStatus();
    const [difficultyPicked, setDifficultyPicked] = useState<Difficulty>("easy");

    if (status === "checking") {
        return (
            <div className="flex items-center justify-center h-screen">
                <Spinner />
            </div>
        );
    }

    const isServerOffline = status === "offline" && serverHasBeenChecked;

    return (
        <div className="h-full w-full flex flex-col items-center px-4">
            <h1 className=" text-letterboxd-orange text-2xl md:text-4xl mt-5 md:mt-4 mb-4 text-center">
                Letterboxd Higher or Lower
            </h1>

            {isServerOffline ? (
                <p className="text-xl text-black dark:text-red-500 text-center">
                    Sorry, the server is currently offline. Please try again later.
                </p>
            ) : (
                <>
                    <h2 className="text-xl text-letterboxd-orange mb-4">Select a difficulty</h2>
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
                            Play
                        </button>
                        <div className="mt-2">
                            {userHasBeenChecked === false ? <Spinner /> : (<GoogleSignInButton />)}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}