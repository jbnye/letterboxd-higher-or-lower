import {useState, useEffect} from "react";
import type { Difficulty } from "../types/types";
import {Spinner} from "../UI/spinner.tsx";
import FilmBox from "./FilmBox.tsx";

interface GameProps{
    difficulty: Difficulty,
    onLose: (score: number) => void
}

interface getFilmsResponse {
  id: number;
  slug: string;
  title: string;
  year: number;
  posterurl: string;
  inHouseURL: string;
}

type RatingStatus = "secret" | "animating" | "revealed";

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
  newFilm?: {
    id: number;
    slug: string;
    title: string;
    year: number;
    posterurl: string;
    inHouseURL: string;
  };
}


export default function Game({difficulty, onLose}: GameProps){
    const [score, setScore] = useState<number>(0);
    const [animationIsPlaying, setAnimationIsPlaying] = useState<boolean>(false);
    const [films, setFilms] = useState<getFilmsResponse[]>([]);
    const [filmRatings, setFilmRatings] = useState<number[]>([0,0]);
    const [checkGuessData, setCheckGuessData] = useState<CheckGuessResponse | null>(null);
    const [filmDisplayStates, setFilmDisplayStates] = useState<FilmDisplayState[]>([
        { trueRating: 0, displayedRating: 0, status: "secret" },
        { trueRating: 0, displayedRating: 0, status: "secret" },
    ]);
    const [choice, setChoice] = useState<number>(2);
    const isLoading = films.length !== 2;
    const film1 = films[0];
    const film2 = films[1];

    useEffect(() => {
        async function fetchTwoFilms(){
            try {
                const response = await fetch(`http://localhost:3000/api/get-films/${difficulty}`);
                if(response.status === 200){
                    const data = await response.json();
                    console.log(data);
                    setFilms(data.newFilms);

                }
            } catch (error) {
                console.error("Failed to fetch initial films", error);
                throw error;
            }
        }
        fetchTwoFilms();
    }, [difficulty]);


    useEffect(() => {
        if(animationIsPlaying === true){
            const timer = setTimeout(() =>{
                console.log("TEST");
            }, 5000);

            return () => clearTimeout(timer); 
        }
    },[animationIsPlaying]);


    useEffect(() => {
        if (!checkGuessData) return;

        // Set true ratings in state
        const newStates = [...filmDisplayStates];
        newStates[0].trueRating = checkGuessData.filmRatings.film1[1];
        newStates[1].trueRating = checkGuessData.filmRatings.film2[1];
        setFilmDisplayStates(newStates);

        if (filmDisplayStates[0].status !== "revealed") {
            animateRating(0);

            setTimeout(() => {
            if (filmDisplayStates[1].status !== "revealed") {
                animateRating(1);
            }
            }, 2000);
        } else if (filmDisplayStates[1].status !== "revealed") {
            // If film 0 was already revealed but film 1 wasn't
            animateRating(1);
        }
        }, [checkGuessData]);;


    useEffect(() => {
    // When both are revealed, trigger next step
    const bothRevealed = filmDisplayStates.every(f => f.status === "revealed");
    if (!bothRevealed) return;

    // Give user 1 second to see ratings before changing
    const timer = setTimeout(() => {
        if (checkGuessData?.success) {
        handleReplaceFilm();
        } else {
        onLose(score); 
        }
        setAnimationIsPlaying(false); // Reset for next round
    }, 1000);

    return () => clearTimeout(timer);
    }, [filmDisplayStates]);


    function animateRating(index: number) {
        setFilmDisplayStates(prev => {
            const updated = [...prev];
            updated[index].status = "animating";
            return updated;
        });

        const duration = 2000;
        const interval = 50;
        const startTime = Date.now();

        const timer = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 2);
            
            setFilmDisplayStates(prev => {
            const updated = [...prev];
            const target = updated[index].trueRating;
            updated[index].displayedRating = parseFloat((target * eased).toFixed(1));
            return updated;
            });

            if (progress === 1) {
                clearInterval(timer);
                setFilmDisplayStates(prev => {
                    const updated = [...prev];
                    updated[index].status = "revealed";
                    return updated;
                });
            }
        }, interval);
    }

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

        setScore((prev) => prev + 1);
        setCheckGuessData(null);

    }

    

    function handleGuess(choice: number){
        if(animationIsPlaying === true){
            return;
        }
        else{
            console.log("CHOICE: ", choice);
            checkGuessBackend(choice);
        }
    }


    async function checkGuessBackend(choice: number){
        try{
            console.log("SENDING CHOICE TO BACKEND");
            const filmIdsParam = `${film1.id},${film2.id}`;
            const response = await fetch(`http://localhost:3000/api/check-guess/${difficulty}?filmIds=${filmIdsParam}&choice=${choice}`);
            if(response.status === 200){
                setAnimationIsPlaying(true);
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
                console.log("ERROR CHECKING GUESS");
            }
        } catch (error){
            console.log("ERROR CHECKING GUESS");
            throw error;
        }
    }




    if (isLoading) {
        return <Spinner />;
    }
    //console.log(showRatings);
    return (
        <div className="flex h-screen w-screen relative">
            {/* Left Image Container */}
            <div className="w-1/2 h-full relative">
                {isLoading ? (
                <Spinner />
                ) : (
                <>
                    <FilmBox  film={film1} index={0} handleGuess={handleGuess}  filmDisplayState={filmDisplayStates[0]} />

                </>
                )}
            </div>

            {/* Right Image Container */}
            <div className="w-1/2 h-full relative">
                {isLoading ? (
                <Spinner />
                ) : (
                <>
                    <FilmBox  film={film2} index={1} handleGuess={handleGuess}  filmDisplayState={filmDisplayStates[1]} />
                </>
                )}
            </div>

            {/* Score Display (floating above everything) #00ac1c */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 px-6 py-2 rounded-full border-solid-black shadow-md text-black text-lg font-semibold border-4 border-black  z-50">
                Score: {score}
            </div>
            <div className ="absolute bottom-[50%] left-1/2 translate-x-[-50%] bg-white translate-y-1/2 rounded-full text-black text-lg p-5 font-semibold
              border-4 border-black z-50">
                OR
            </div> 
        </div>
    );
}