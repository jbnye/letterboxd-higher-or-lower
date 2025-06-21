import {useState, useEffect} from "react";
import type { Difficulty } from "../types/types";

interface GameProps{
    difficulty: Difficulty,
    onLose: () => void
}
interface filmResponse{
    filmData: filmData
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

    useEffect(() => {
        async function fetchTwoFilms(){
            try {
                const response = await fetch(`http://localhost:3000/api/get-films/${difficulty}`);
                if(response.status === 200){
                    const data = await response.json();
                    console.log(data);
                }
            } catch (error) {
                console.log(error);
                throw error;
            }
        }
        fetchTwoFilms();
    }, []);

    return(
        <div>

        </div>
    )
}