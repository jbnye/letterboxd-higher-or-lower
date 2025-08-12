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
  //console.log(`Film index: ${index}, choice: ${choice}, ratingColor: ${ratingColor}, colorClass: ${colorClass}`);
  //w-full h-full p-0 border-none bg-none flex items-center justify-center
    
  return( 
    <>
      <button value={1}  onClick={() => handleGuess(index)} className="p-0 border-none bg-none h-full w-full md:w-auto flex items-center relative ">
        <img
          src={film.inHouseURL}
          className={`h-full w-full md:w-auto md:object-contain max-w-full hover:brightness-75 transform transition-transform duration-500 ${
            index === 0 ? "animate-slide-in-down" : "animate-slide-in-up"
          }`}
          alt={film.title}
        />
        <div
          className="
            absolute bottom-[50%] md:bottom-[50%] left-1/2 translate-x-[-50%] translate-y-1/2 bg-white p-1 sm:p-2 md:p-3 text-center text-black 
            shadow-[8px_8px_15px_rgba(0,0,0,0.5)] max-w-[90vw] sm:max-w-[70vw] md:max-w-[50vw] rounded"
        >
          <h2 className="text-[14px] sm:text-[16px] md:text-xl font-bold truncate">
            {`${film.title} (${film.year})`}
          </h2>
        </div>
        {filmDisplayState.status !== "secret" && (
          <div
            className={`
              absolute bottom-[20%] md:bottom-[40%] left-1/2 translate-x-[-50%] translate-y-1/2  bg-black p-1 shadow-[8px_8px_15px_rgba(0,0,0,0.5)] 
              transition-opacity duration-300 text-[16px] md:text-lg lg:text-xl  h-[2.5rem] md:h-[3.5rem] lg:h-[4rem]  min-w-[3.5rem] md:min-w-[6rem] lg:min-w-[7rem] 
              flex items-center justify-center text-center`}
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
                <span className={` font-bold ${colorClass}`}>
                  {filmDisplayState.trueRating.toFixed(1)}
                </span>
                )}
          </div>
          )}
        <div className={`hidden sm:flex absolute left-0 bottom-0 m-1 z-20 transform transition-transform duration-500  ${
            index === 0 ? "animate-slide-in-down" : "animate-slide-in-up"}`}>
          <a className= "underline cursor-pointer text-white hover:text-blue-400 "href={`https://letterboxd.com/film/${film.slug}/`}
          target="_blank"
          rel="noopener noreferrer">{film.title}</a>
        </div>
      </button>
    </>
  )

}


/*
      <button value={1}  onClick={() => handleGuess(index)} className=" relative w-auto h-full p-0 border-none bg-none flex items-center justify-center">
        <img
          src={film.inHouseURL}
          className={`h-screen w-auto max-w-full p-0 m-0 object-contain block hover:brightness-75 transform transition-transform duration-500 ${
            index === 0 ? "animate-slide-in-down" : "animate-slide-in-up"
          }`}
          alt={film.title}
        />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-1 text-center text-black shadow-[8px_8px_15px_rgba(0,0,0,0.5)]">
          <h2 className="text-xl font-bold">{`${film.title} (${film.year})`}</h2>
        </div>


*/