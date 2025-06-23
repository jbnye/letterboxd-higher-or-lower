import {useState, useEffect} from "react";
import type { Difficulty } from "../types/types";
import {Spinner} from "../UI/spinner.tsx";

interface GameProps{
    difficulty: Difficulty,
    onLose: () => void
}

interface filmData{
    averageRating: number,
    id: number,
    isTop250: boolean,
    popularityRank: number,
    posterURL: string,
    inHouseURL: string,
    slug: string,
    title: string,
    year: number
}

export default function Game({difficulty, onLose}: GameProps){
    const [score, setScore] = useState<number>(0);
    const [films, setFilms] = useState<filmData[]>([]);
    const [choice, setChoice] = useState<number>(2);
    const isLoading = films.length === 2 ? false : true; 
    console.log(isLoading);

    const film1: filmData = films[0] || null;
    const film2: filmData = films[1] || null;
    console.log(films);

    useEffect(() => {
        async function fetchTwoFilms(){
            try {
                const response = await fetch(`http://localhost:3000/api/get-films/${difficulty}`);
                if(response.status === 200){
                    const data = await response.json();
                    console.log(data);
                    setFilms(data.filmData);

                }
            } catch (error) {
                console.error("Failed to fetch initial films", error);
                throw error;
            }
        }
        fetchTwoFilms();
    }, []);

    function handleGuess(){
        console.log("CLICKED!");
    }



    async function fetchOneFilm(){
        try {
            const removeRandom: number = Math.floor(Math.random() * 1);
            const filmIdsParam = `${film1.id},${film2.id}`;
            const response = await fetch(`http://localhost:3000/api/get-film/${difficulty}?filmIds=${filmIdsParam}`);
            if(response.status === 200){
                const data = await response.json();
                const newFilms: filmData[] = films.map((film, index) => {
                    if(removeRandom === index ){
                        return data.film;
                    } else{
                        return film;
                    }
                });
                setFilms(newFilms);
            }
        } catch (error) {
            console.error("Failed to fetch next film", error);
            throw error;
        }
    }

    return (
        <div className="flex h-screen w-screen relative">
        {/* Left Image Container */}
        <div className="w-1/2 h-full relative">
            {isLoading ? (
            <Spinner />
            ) : (
            <>
            <button onClick={handleGuess} className="w-full h-full p-0 border-none bg-none">
                <img
                src={film1.inHouseURL}
                className="w-full h-full"
                alt={film1.title}
                />
                {/* Overlay for title/year */}
                <div className="absolute bottom-[50%] left-1/2 translate-x-[-50%] translate-y-1/2 bg-white p-1 text-center text-black shadow-[8px_8px_15px_rgba(0,0,0,0.5)]">
                <h2 className="text-xl font-bold">{`${film1.title} (${film1.year})`}</h2>
                </div>
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
            <button onClick={handleGuess} className="w-full h-full p-0 border-none bg-none">
                <img
                src={film2.inHouseURL}
                className="w-full h-full z-10"
                alt={film2.title}
                />
                <div className="absolute bottom-[50%] left-1/2 translate-x-[-50%] translate-y-1/2 bg-white p-1 text-center text-black shadow-[8px_8px_15px_rgba(0,0,0,0.5)]">
                <h2 className="text-xl font-bold">{`${film2.title} (${film2.year})`}</h2>
                </div>
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