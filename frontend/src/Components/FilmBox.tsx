import {useState} from "react";


type RatingStatus = "secret" | "animating" | "revealed";
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
}


export default function FilmBox({ film, index, handleGuess, filmDisplayState}: FilmBoxProps){

return( 
    <>
        <button value={1}  onClick={() => handleGuess(index)} className="w-full h-full p-0 border-none bg-none">
            <img
            src={film.inHouseURL}
            className="w-full h-full z-10"
            alt={film.title}
            />
            <div className="absolute bottom-[50%] left-1/2 translate-x-[-50%] translate-y-1/2 bg-white p-1 text-center text-black shadow-[8px_8px_15px_rgba(0,0,0,0.5)]">
            <h2 className="text-xl font-bold">{`${film.title} (${film.year})`}</h2>
            </div>
            {filmDisplayState.status !== "secret" &&(
                <div className="absolute bottom-[40%] left-1/2 translate-x-[-50%] translate-y-1/2 bg-white p-1 text-center text-black shadow-[8px_8px_15px_rgba(0,0,0,0.5)] text-xl font-bold">
                        <span >{(filmDisplayState.trueRating).toFixed(1)}</span>
                </div>
                )
            } 
        </button>
    </>
    )

}


