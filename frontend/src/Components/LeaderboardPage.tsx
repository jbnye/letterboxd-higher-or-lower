import type { Difficulty } from "@/types/types";
import { useState, useEffect } from "react";
import DifficultyBoxes from "./DifficultyBoxes";
import { useGameStatus } from "@/Context/GameStatus";


interface leaderboardEntry {
    name: string,
    score: number,
    googleSub: string,
    email: string,
    picture: string
}

interface leaderboardResponse {
    easy: leaderboardEntry[],
    medium: leaderboardEntry[],
    hard: leaderboardEntry[],
    impossible: leaderboardEntry[],
}


const mockTop10 = [
  {
    googleSub: "101131547715102025945",
    score: 24,
    name: "Jacob Nye",
    email: "jn3268@gmail.com",
    picture: "https://lh3.googleusercontent.com/a/ACg8ocI_aLZnEhdQiBxabFQxx53Dpolv_aFxs23A2nVTJyKo4pwNUyU=s96-c"
  },
  {
    googleSub: "107109413899380413942",
    score: 8,
    name: "Mike Smith",
    email: "mikesmith5540@gmail.com",
    picture: "https://lh3.googleusercontent.com/a/ACg8ocLV42leC-XblwIn-7f9N2BolxZV1lOgR7wLf2PDRGbF9Jub_g=s96-c"
  },
  {
    googleSub: "102938475612345678901",
    score: 7,
    name: "Alice Johnson",
    email: "alicej@gmail.com",
    picture: "https://randomuser.me/api/portraits/women/1.jpg"
  },
  {
    googleSub: "123456789098765432109",
    score: 6,
    name: "Bob Lee",
    email: "boblee@example.com",
    picture: "https://randomuser.me/api/portraits/men/2.jpg"
  },
  {
    googleSub: "456789123456789123456",
    score: 5,
    name: "Charlie Kim",
    email: "ckim@domain.com",
    picture: "https://randomuser.me/api/portraits/men/3.jpg"
  },
  {
    googleSub: "789456123789456123789",
    score: 4,
    name: "Dana White",
    email: "dwhite@domain.com",
    picture: "https://randomuser.me/api/portraits/women/4.jpg"
  },
  {
    googleSub: "159753456159753456159",
    score: 3,
    name: "Evan Thomas",
    email: "evant@example.com",
    picture: "https://randomuser.me/api/portraits/men/5.jpg"
  },
  {
    googleSub: "321654987321654987321",
    score: 2,
    name: "Fiona Green",
    email: "fgreen@example.com",
    picture: "https://randomuser.me/api/portraits/women/6.jpg"
  },
  {
    googleSub: "654987321654987321654",
    score: 1,
    name: "George Allen",
    email: "gallen@domain.com",
    picture: "https://randomuser.me/api/portraits/men/7.jpg"
  },
  {
    googleSub: "987123654987123654987",
    score: 0,
    name: "Hannah Wells",
    email: "hwells@example.com",
    picture: "https://randomuser.me/api/portraits/women/8.jpg"
  }
];
export default function LeaderboardPage() {
    const [difficultySelected, setDifficultySelected] = useState<Difficulty>("easy");
    const [leaderboardResponseData, setLeaderboardResponseData] = useState<leaderboardResponse>()
    const {setGameStatus} = useGameStatus();
    let top10;
    if(leaderboardResponseData){
        top10 = leaderboardResponseData[difficultySelected];
    }
    console.log(top10);
    useEffect(()=>{
        const controller = new AbortController();
        const getLeaderboard = async () => {
            try{
                const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
                const response = await fetch(`${API_BASE}/api/get-leaderboard`);
                if(response.ok){
                    const data = await response.json();
                    setLeaderboardResponseData(data)
                }
                else{
                    console.error("FAILED TO FETCH LEADERBOARD", response);
                    setGameStatus("Error");
                }
            } catch(error){
                console.error("Error in leaderboard request", error);
            }
        }
        getLeaderboard();
        return () => {
            controller.abort();
        };
    },[])


    return (
        
        <div className="flex flex-col items-center px-4 text-black dark:text-white">
            <h1 className="text-letterboxd-orange text-2xl md:text-4xl mt-4 md:mt-12 mb-4 text-center">Hall of Fame</h1>
                <DifficultyBoxes             
                    onDifficultyChoice={(difficulty) => {
                        setDifficultySelected(difficulty);
                    }} 
                    difficultyPicked={difficultySelected} 
                    style={"w-24 h-24"}
                />
            <div className="flex flex-col my-5 w-full sm:w-3/5 md:w-2/5 lg:w-1/3 mx-auto">
                {mockTop10&& mockTop10.map((entry, index) => (
                    <div
                    key={index}
                    className="flex flex-nowrap items-center gap-4 p-2 border-b border-letterboxd-dark-blue dark:border-letterboxd-blue w-full"
                    >
                    <span className="w-6 text-right font-bold">{index + 1}.</span>
                    <img
                        src={entry.picture}
                        alt={entry.name}
                        className="w-10 h-10 rounded-full flex-shrink-0"
                        referrerPolicy="no-referrer"
                    />
                    <span className="font-bold truncate max-w-[120px]">{entry.name}</span>
                    <span className="ml-auto text-black dark:text-letterboxd-blue font-bold">{entry.score}</span>
                    </div>
                ))}
                </div>
            </div>
    )
}