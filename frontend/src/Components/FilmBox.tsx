import {useState} from "react";
import AniamatedNumber from './AnimatedNumber';

type RatingStatus = "secret" | "animating" | "revealed";
type ColorState = "correct" | "incorrect" | "none";
interface FilmDisplayState {
  trueRating: number;
  displayedRating: number;
  status: RatingStatus;
}

interface getFilmsResponse {
  id: number;
  slug: string;
  title: string;
  year: number;
  posterurl: string;
  inHouseURL: string;
}
interface FilmBoxProps {
  film: getFilmsResponse;
  index: number;
  handleGuess: (index: number) => void;
  filmDisplayState: FilmDisplayState;
  animationIsPlaying: boolean;
  setFilmDisplayStates: React.Dispatch<React.SetStateAction<FilmDisplayState[]>>
  ratingColor: ColorState;
  choice: number;
}


export default function FilmBox({ film, index, handleGuess, filmDisplayState, animationIsPlaying, setFilmDisplayStates, ratingColor, choice}: FilmBoxProps){
  const colorClass = 
    index === choice ? ratingColor === "correct" ? "text-letterboxd-green" : ratingColor === "incorrect" ? "text-red-600" : "text-[#f5eeec]"
     : 
    "text-[#f5eeec]";
  console.log(`Film index: ${index}, choice: ${choice}, ratingColor: ${ratingColor}, colorClass: ${colorClass}`);
    
  return( 
    <>
      <button value={1}  onClick={() => handleGuess(index)} className="w-full h-full p-0 border-none bg-none">
        <img
          src={film.inHouseURL}
          className={`w-full h-full z-10 hover:brightness-75 transform transition-transform duration-500 ${
            index === 0 ? "animate-slide-in-down" : "animate-slide-in-up"
          }`}
          alt={film.title}
        />
        <div className="absolute bottom-[50%] left-1/2 translate-x-[-50%] translate-y-1/2 bg-white p-1 text-center text-black shadow-[8px_8px_15px_rgba(0,0,0,0.5)]">
          <h2 className="text-xl font-bold">{`${film.title} (${film.year})`}</h2>
        </div>
        {filmDisplayState.status !== "secret" && (
          <div
            className={`absolute bottom-[40%] left-1/2 translate-x-[-50%] translate-y-1/2 bg-black p-1 shadow-[8px_8px_15px_rgba(0,0,0,0.5)] transition-opacity duration-300 h-[3.5rem] min-w-[6rem] flex items-center justify-center text-center `}
          >
            {filmDisplayState.status === "animating" && animationIsPlaying === true ? (
              <AniamatedNumber
                target={filmDisplayState.trueRating}
                duration={1000}
                className={colorClass}
                onAnimationComplete={() => {
                  setFilmDisplayStates(prev => {
                    const updated = [...prev];
                    updated[index] = {
                    ...updated[index],
                    status: "revealed",
                    displayedRating: updated[index].trueRating,
                    };
                  return updated;
                  });
                }}
              />
            ) : (
                <span className={`text-2xl font-bold ${colorClass}`}>
                  {filmDisplayState.trueRating.toFixed(1)}
                </span>
                )}
          </div>
          )}
      </button>
    </>
  )

}


