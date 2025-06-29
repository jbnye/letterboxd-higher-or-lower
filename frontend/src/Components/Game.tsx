import {useState, useEffect} from "react";
import type { Difficulty } from "../types/types";
import {Spinner} from "../UI/spinner.tsx";

interface GameProps{
    difficulty: Difficulty,
    onLose: () => void
}

interface getFilmsResponse {
  id: number;
  slug: string;
  title: string;
  year: number;
  posterurl: string;
  inHouseURL: string;
}
interface CheckGuessResponse {
  success: boolean;
  correctChoice: number;
  replacedFilm: number;
  filmRatings: {
    film1: [string, number];
    film2: [string, number];
  };
}


export default function Game({difficulty, onLose}: GameProps){
    const [score, setScore] = useState<number>(0);
    const [animationIsPlaying, setAnimationIsPlaying] = useState<boolean>(false);
    const [films, setFilms] = useState<getFilmsResponse[]>([]);
    const [filmRatings, setFilmRatings] = useState<number[]>([0,0]);
    const [checkGuessData, setCheckGuessData] = useState(null);
    const [showRatings, setShowRatings] = useState<boolean[]> ([false,false]);
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
                    setShowRatings([true,true]);
                    setFilmRatings([data.filmRatings.film1[1], data.filmRatings.film2[1]]);
                    setCheckGuessData(data);
                }
                else{
                    console.log("RECIEVED WRONG CHOICE RESPONSE: ", data);
                    setShowRatings([true,true]);
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
                <button value={0} onClick={() => handleGuess(0)} className="w-full h-full p-0 border-none bg-none">
                    <img
                    src={film1.inHouseURL}
                    className="w-full h-full"
                    alt={film1.title}
                    />
                    {/* Overlay for title/year */}
                    <div className="absolute bottom-[50%] left-1/2 translate-x-[-50%] translate-y-1/2 bg-white p-1 text-center text-black shadow-[8px_8px_15px_rgba(0,0,0,0.5)]">
                    <h2 className="text-xl font-bold">{`${film1.title} (${film1.year})`}</h2>
                    </div>
                    {showRatings[0] ?  (
                        <div className="absolute bottom-[40%] left-1/2 translate-x-[-50%] translate-y-1/2 bg-white p-1 text-center text-black shadow-[8px_8px_15px_rgba(0,0,0,0.5)] text-xl font-bold">
                            {filmRatings[0]}
                        </div>
                        ) : (<></>)
                    }   

                </button>

                </>
                )}
            </div>

            {/* Right Image Container */}
            <div className="w-1/2 h-full relative">
                {isLoading ? (
                <Spinner />
                ) : (
                <>
                <button value={1}  onClick={() => handleGuess(1)} className="w-full h-full p-0 border-none bg-none">
                    <img
                    src={film2.inHouseURL}
                    className="w-full h-full z-10"
                    alt={film2.title}
                    />
                    <div className="absolute bottom-[50%] left-1/2 translate-x-[-50%] translate-y-1/2 bg-white p-1 text-center text-black shadow-[8px_8px_15px_rgba(0,0,0,0.5)]">
                    <h2 className="text-xl font-bold">{`${film2.title} (${film2.year})`}</h2>
                    </div>
                    {showRatings[0] ?  (
                        <div className="absolute bottom-[40%] left-1/2 translate-x-[-50%] translate-y-1/2 bg-white p-1 text-center text-black shadow-[8px_8px_15px_rgba(0,0,0,0.5)] text-xl font-bold">
                            {filmRatings[1]}
                        </div>
                        ) : (<></>)
                    }
                </button>
                </>
                )}
            </div>

            {/* Score Display (floating above everything) #00ac1c */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 px-6 py-2 rounded-full shadow-md text-black text-lg font-semibold z-50">
                Score: {score}
            </div>
            <div className ="absolute bottom-[50%] left-1/2 translate-x-[-50%] bg-white translate-y-1/2 rounded-full text-black text-lg p-5 font-semibold z-50">
                OR
            </div> 
        </div>
    );
}