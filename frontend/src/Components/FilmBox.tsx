import AniamatedNumber from './AnimatedNumber';
import { useState} from 'react';
import { useThemeContext } from '@/Context/ThemeStatus';
import MuteButton from './ui/muteButton';
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
  isImageLoaded: boolean; 
}


export default function FilmBox({ film, index, handleGuess, filmDisplayState, animationIsPlaying, setFilmDisplayStates,
   ratingColor, choice, isImageLoaded}: FilmBoxProps){

  const {breakpoint} = useThemeContext();
  const [imgSrc, setImgSrc] = useState(film.inHouseURL);
  const colorClass =
    index === choice
      ? ratingColor === "correct"
        ? "text-letterboxd-green"
        : ratingColor === "incorrect"
        ? "text-red-600"
        : "text-[#f5eeec]"
      : "text-[#f5eeec]";
  const getResponsiveFontSize = (title: string) => {
    const length = title.length;

    if(length < 40) {return "text-[14px] sm:text-[14px] md:text-[16px] lg:text-[18px]";}
    else{return "text-[12px] sm:text-[12px] md:text-[14px] lg:text-[16px]";}
  }

  //console.log(`Film index: ${index}, choice: ${choice}, ratingColor: ${ratingColor}, colorClass: ${colorClass}`);
  //w-full h-full p-0 border-none bg-none flex items-center justify-center
    
  return( 
    <div className='h-screen'>
      <button value={1} onClick={() => handleGuess(index)} className="p-0 flex border-none bg-none h-full w-full md:w-auto items-center relative ">
      {!isImageLoaded ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          <img
            src={imgSrc}
            onError={() => setImgSrc(film.posterurl)}
            className={`h-full  max-w-[620px] w-full md:w-auto hover:brightness-75 transform transition-transform duration-500 ${
              index === 0 ? "animate-slide-in-down" : "animate-slide-in-up"
            }`}
            alt={film.title}
          />
          <div
            className="
              absolute bottom-[50%] md:bottom-[50%] left-1/2 opacity-90 translate-x-[-50%] translate-y-1/2 bg-white p-1 sm:p-2 md:p-3 text-center text-black 
              shadow-[8px_8px_15px_rgba(0,0,0,0.5)] sm:max-w-[70vw] md:max-w-[50vw] rounded"
          >
            <h2 className={`${getResponsiveFontSize(film.title)} font-bold `}>
              {`${film.title} (${film.year})`}
            </h2>
          </div>

          {filmDisplayState.status !== "secret" && (
            <div
              className={`
                absolute border-1 border-white bottom-[20%] md:bottom-[30%] lg:bottom-[35%] 
                left-1/2 translate-x-[-50%] translate-y-1/2 bg-black p-2 shadow-[8px_8px_15px_rgba(0,0,0,0.5)] 
                transition-opacity duration-300 text-[18px] md:text-[20px] lg:text-[22px]
                flex items-center justify-center text-center rounded`}
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

          {breakpoint !== "mobile" && filmDisplayState.status !== "secret" && (
            <div className="absolute left-0 bottom-1 m-2 z-20 text-[12px]">
              <a 
                href={`https://letterboxd.com/film/${film.slug}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  px-2 py-1 rounded-md
                  text-white font-medium
                  bg-black bg-opacity-70 hover:bg-opacity-90
                  backdrop-blur-sm
                  underline hover:no-underline
                  transition-all
                  shadow-lg
                  hover:text-blue-300
                "
              >
                {film.title}
              </a>
            </div>
          )}
        </>
      )}
        {((index === 1) && (breakpoint !=="mobile")) ? (
          <div className="absolute right-1 top-1 z-50 dark:bg-black rounded-full bg-white p-0 m-0 items-center w-8 h-8">
            <MuteButton />
            </div> 
        ) :
        (((index === 0) && (breakpoint === "mobile")) && 
          <div className="absolute right-1 top-1 z-50 dark:bg-black rounded-full bg-white p-0 m-0 items-center w-8 h-8">
            <MuteButton />
          </div>
        )
        }
      </button>
    </div>
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