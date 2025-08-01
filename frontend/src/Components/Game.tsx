import {useState, useEffect} from "react";
import type { Difficulty, RatingStatus, ColorState, Highscores} from "../types/types";
import {Spinner} from "../UI/spinner.tsx";
import { symbols } from "../UI/symbols.tsx";
import FilmBox from "./FilmBox.tsx";
import { AuthProvider, useAuth } from "../Context/UserContext.tsx";
import TimeLimit from "./TimeLimit.tsx";
import WrongOrRight from "./WrongOrRight.tsx";


interface GameProps{
    difficulty: Difficulty,
    onLose: (score: number, prevHighscore: number | undefined,) => void
}

interface getFilmsResponse {
    id: number;
    slug: string;
    title: string;
    year: number;
    posterurl: string;
    inHouseURL: string;
}




interface FilmDisplayState {
    trueRating: number;
    displayedRating: number;
    status: RatingStatus;
}

interface CheckGuessResponse {
    success: boolean;
    correctChoice: number;
    replacedFilm: number;
    filmRatings: {
    film1: [string, number];
    film2: [string, number];
    };
    gameId: string,
    newFilm?: {
    id: number;
    slug: string;
    title: string;
    year: number;
    posterurl: string;
    inHouseURL: string;
    };
    score: number;
    highscore?: number;
    highscores?: Highscores;
}


export default function Game({difficulty, onLose}: GameProps){
    const [score, setScore] = useState<number>(0);
    const [animationIsPlaying, setAnimationIsPlaying] = useState<boolean>(false);
    const [films, setFilms] = useState<getFilmsResponse[]>([]);
    const [filmRatings, setFilmRatings] = useState<number[]>([0,0]);
    const [checkGuessData, setCheckGuessData] = useState<CheckGuessResponse | null>(null);
    const [gameId, setGameId] = useState<string>("");
    const [ratingColor, setRatingColor] = useState<ColorState>("none");
    const [filmDisplayStates, setFilmDisplayStates] = useState<FilmDisplayState[]>([
        { trueRating: 0, displayedRating: 0, status: "secret" },
        { trueRating: 0, displayedRating: 0, status: "secret" },
    ]);
    const [shouldPulse, setShouldPulse] = useState<boolean>(true);
    const {user, userHighscores, setUserHighscores} = useAuth();
    const [choice, setChoice] = useState<number>(-1);
    const isLoading = films.length !== 2;
    const prevHighscore = userHighscores?.[difficulty];
    //console.log("guess data:", checkGuessData);
    //console.log("film data:",filmDisplayStates);
    //console.log("COLOR RATING", ratingColor);
    //console.log(gameId);
    const film1 = films[0];
    const film2 = films[1];
    // let classColor;
    // ratingColor === "correct" ? classColor = "bg-green-600" : ratingColor === "incorrect" ? classColor="bg-red-600" : classColor = "bg-white";

    useEffect(() => {
        async function fetchTwoFilms(){
            try {
                const response = await fetch(`http://localhost:3000/api/get-films`, {
                    method: "POST",
                    headers: {
                        "content-type": "application/json",
                    },
                    body: JSON.stringify({difficulty, user}),
                    credentials: "include",
                });
                if(response.status === 200){
                    const data = await response.json();
                    console.log(data);
                    setFilms(data.newFilms);
                    setGameId(data.gameId);

                }
            } catch (error) {
                console.error("Failed to fetch initial films", error);
                throw error;
            }
        }
        fetchTwoFilms();
    }, [difficulty]);



    useEffect(() => {
        if (!checkGuessData) return;
        const duration = 1000; 
        const bothAreSecret = filmDisplayStates[0].status === "secret" && filmDisplayStates[1].status === "secret";

        if (bothAreSecret) {
            setFilmDisplayStates(prev => [
                {
                    ...prev[0],
                    trueRating: checkGuessData.filmRatings.film1[1],
                    status: "animating",
                },
                {
                    ...prev[1],
                    trueRating: checkGuessData.filmRatings.film2[1],
                    status: "secret",
                },
            ]);

            setTimeout(() => {
                setFilmDisplayStates(prev => [
                    {
                    ...prev[0],
                    status: "revealed",
                    displayedRating: prev[0].trueRating,
                    },
                    {
                    ...prev[1],
                    status: "animating",
                    },
                ]);
                setTimeout(() => {
                    setFilmDisplayStates(prev => [
                        prev[0],
                        {
                            ...prev[1],
                            status: "revealed",
                            displayedRating: prev[1].trueRating,
                        },
                    ]);
                }, duration);
            }, duration);
        } else {
            setFilmDisplayStates(prev => {
                return prev.map((film, index) => {
                    const isSecret = film.status === "secret";
                    return {
                    ...film,
                    trueRating: index === 0 ? checkGuessData.filmRatings.film1[1] : checkGuessData.filmRatings.film2[1],
                    status: isSecret ? "animating" : film.status,
                    };
                });
            });
        }
        }, [checkGuessData]);

    useEffect(() => {
        const bothRevealed = filmDisplayStates.every(f => f.status === "revealed");
        if (!bothRevealed) return;
        let choiceAnswer: ColorState = "none";
        choice === checkGuessData?.correctChoice ? choiceAnswer = "correct" : choiceAnswer = "incorrect";
        setRatingColor(choiceAnswer);
        const timer = setTimeout(() => {
            if (checkGuessData?.success) {
                handleReplaceFilm();
            } else {
                onLose(score, prevHighscore);
                if (checkGuessData?.highscores) {
                    console.log("user highscores", checkGuessData.highscores);
                    setUserHighscores(checkGuessData.highscores);
                }
            }
            setRatingColor("none");
            //setAnimationIsPlaying(false); // Reset for next round
        }, 2000);

        return () => clearTimeout(timer);
    }, [filmDisplayStates]);


    function handleReplaceFilm(){
        if (!checkGuessData?.success || !checkGuessData.newFilm) return;
        const replacedIndex = checkGuessData.replacedFilm;
        const newFilm = checkGuessData.newFilm;

        setFilms((prev) => {
            const updatedList = [...prev];
            updatedList[replacedIndex] = newFilm;
            return updatedList;
        })

        setFilmRatings((prev) => {
            const updatedList = [...prev];
            updatedList[replacedIndex] = 0;
            return updatedList;
        })

        setFilmDisplayStates((prev) => {
            const updatedList = [...prev];
            updatedList[replacedIndex] = { trueRating: 0, displayedRating: 0, status: "secret" };
            return updatedList;
        })

        //setRatingColor("none");
        setChoice(-1);
        setScore((prev) => prev + 1);
        setAnimationIsPlaying(false)
        setCheckGuessData(null);


    }

    

    function handleGuess(choice: number){
        if(animationIsPlaying === true){
            return;
        }
        setAnimationIsPlaying(true);
        // setFilmDisplayStates((prev) =>
        //     prev.map((state) =>
        //     state.status === "secret" ? { ...state, status: "animating" } : state
        //     )
        // );
        checkGuessBackend(choice);
        setChoice(choice);
    }


    async function onTimeout() {
        //setAnimationIsPlaying(true);
        //setIsTimeout(true);
        //handleGuess(-1);
        // setTimeout(() => {
        //     onLose(score, prevHighscore);
        //     if (checkGuessData?.highscores) {
        //         console.log("user highscores", checkGuessData.highscores);
        //         setUserHighscores(checkGuessData.highscores);
        //     }
        // });
    }

    async function checkGuessBackend(choice: number){
        
        try{
            console.log("SENDING CHOICE TO BACKEND");
            const filmIds = [film1.id, film2.id];
            const response = await fetch(`http://localhost:3000/api/check-guess`, {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({gameId, choice, difficulty, filmIds, user}),
                credentials: "include",
            });
                         
            if(response.status === 200){
                //setAnimationIsPlaying(true);
                const data = await response.json();
                if(data.success === true){
                    console.log("RECIEVED  RIGHT CHOICE RESPONSE: ", data);
                    setFilmRatings([data.filmRatings.film1[1], data.filmRatings.film2[1]]);
                    setCheckGuessData(data);
                }
                else{
                    console.log("RECIEVED WRONG CHOICE RESPONSE: ", data);
                    setCheckGuessData(data);
                }
            }
            else{
                console.log("ERROR CHECKING GUESS", response.status);
            }
        } catch (error){
            console.error("ERROR FETCHING CHECK GUESS");
            throw error;
        }
    }




    if (isLoading) {
        return <Spinner />;
    }
    //console.log(showRatings);
    return (
        <div className={`h-screen w-screen transition-all duration-300 ${shouldPulse ? 'breathe' : ''} p-[20px] box-border`}>
        <div className="flex w-full h-full bg-letterboxd-background box-border">
            {/* Left Image Container */}
            <div className="w-1/2 h-full flex justify-end items-center">
                {isLoading ? (
                <Spinner />
                ) : (
                <>
                    <FilmBox  key={film1.id} film={film1} index={0} handleGuess={handleGuess}  filmDisplayState={filmDisplayStates[0]} animationIsPlaying={animationIsPlaying} setFilmDisplayStates={setFilmDisplayStates} ratingColor={ratingColor} choice={choice}/>

                </>
                )}
            </div>

            {/* Right Image Container */}
            <div className="w-1/2 h-full flex justify-start items-center">
                {isLoading ? (
                <Spinner />
                ) : (
                <>
                    <FilmBox  key={film2.id} film={film2} index={1} handleGuess={handleGuess}  filmDisplayState={filmDisplayStates[1]} animationIsPlaying={animationIsPlaying} setFilmDisplayStates={setFilmDisplayStates} ratingColor={ratingColor} choice={choice}/>
                </>
                )}
            </div>
            <WrongOrRight films={films} onTimeout={onTimeout} ratingColor={ratingColor} animationIsPlaying={animationIsPlaying} />
            {/* Score Display (floating above everything) #00ac1c */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 px-6 py-2 rounded-full border-solid-black shadow-md text-black text-lg font-semibold border-4 border-black z-50">
                <span>
                    Score: {score} <span className="relative -top-0.5">{user && userHighscores && (score > prevHighscore!) &&` 👑`}</span>
                </span>
                {user && userHighscores && userHighscores[difficulty] && (
                <div>
                    Highscore: {prevHighscore}
                </div>
                )}
            </div>
            <div className="absolute left-0 bottom-0 m-1 ">
                <a className= "underline cursor-pointer text-black bg-white hover:text-blue-900 "href={`https://letterboxd.com/film/${film1.slug}/`}
                   target="_blank"
                    rel="noopener noreferrer">{film1.title}</a>
            </div>
            <div className="absolute right-0 bottom-0 m-1">
                <a className= "underline cursor-pointer text-black bg-white hover:text-blue-900  "href={`https://letterboxd.com/film/${film2.slug}/`}
                   target="_blank"
                    rel="noopener noreferrer">{film2.title}</a>
            </div>
        </div>
        </div>
    );
}

