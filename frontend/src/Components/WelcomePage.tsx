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
                            style="w-24 h-24 p-3 md:w-28 md:h-28 l:w-32 l:h-32"
                        />
                    </div>
                    <div className="flex flex-col w-full md:w-auto gap-4 mt-12  md:mt-6">
                        <button
                            onClick={() => onStartGame(difficultyPicked)}
                            className="px-12 py-4 h-16 md:h-auto bg-letterboxd-blue text-white rounded hover:bg-[#1093ef]"
                        >
                            Play
                        </button>
                    </div>
                    <div className="mt-10">
                        {userHasBeenChecked === false ? <Spinner /> : (<GoogleSignInButton />)}
                    </div>
                </>
            )}
        </div>
    );
}