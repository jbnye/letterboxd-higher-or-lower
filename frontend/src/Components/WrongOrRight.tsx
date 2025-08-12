import type { ColorState } from "../types/types";
import TimeLimit from "./TimeLimit";


interface getFilmsResponse {
    id: number;
    slug: string;
    title: string;
    year: number;
    posterurl: string;
    inHouseURL: string;
}
interface WrongOrRightProps {
    ratingColor: ColorState;
    animationIsPlaying: boolean;
    films: getFilmsResponse[],
    onTimeout: () => void,
    setShouldPulse: (shouldPulse: boolean) => void,
}

export default function WrongOrRight({ratingColor, animationIsPlaying, films, onTimeout, setShouldPulse}: WrongOrRightProps ) {
    return (
        <>
            {ratingColor === "correct" ? (
                <div
                className={`h-16 w-16 md:h-24 md:w-24 bg-letterboxd-green absolute bottom-1/2 left-1/2 -translate-x-1/2 translate-y-1/2 
                    rounded-full border-4 border-black z-50 flex items-center justify-center`}
                >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="white"
                    viewBox="0 0 24 24"
                    className="w-full h-full"
                    preserveAspectRatio="xMidYMid meet"
                >
                    <path d="M9 16.2l-3.5-3.5L4 14.2l5 5 12-12-1.4-1.4z" />
                </svg>
                </div>
            ) : ratingColor === "incorrect" ? (
                <div
                className={`h-16 w-16 md:h-24 md:w-24 bg-red-500 absolute bottom-1/2 left-1/2 -translate-x-1/2 translate-y-1/2 
                    rounded-full border-4 border-black z-50 flex items-center justify-center`}
                >
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="white"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full"
                    preserveAspectRatio="xMidYMid meet"
                >
                    <line
                    x1="18"
                    y1="6"
                    x2="6"
                    y2="18"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    />
                    <line
                    x1="6"
                    y1="6"
                    x2="18"
                    y2="18"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    />
                </svg>
                </div>
            ) : ratingColor === "none" ? (
                <div
                className={`h-16 w-16 md:h-24 md:w-24 p-4 bg-white absolute bottom-1/2 left-1/2 -translate-x-1/2 translate-y-1/2 
                    rounded-full border-4 border-black z-50 flex items-center justify-center`}
                >
                <TimeLimit
                    films={films}
                    animationIsPlaying={animationIsPlaying}
                    onTimeout={onTimeout}
                    setShouldPulse={setShouldPulse}
                />
                </div>
            ) : null}
        </>
    )
}