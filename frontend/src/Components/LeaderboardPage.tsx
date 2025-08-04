import type { Difficulty } from "@/types/types";
import { useState, useEffect } from "react";
import DifficultyBoxes from "./DifficultyBoxes";


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

interface LeaderboardPageProps {
    welcomePage: () => void,
}

export default function LeaderboardPage({welcomePage}: LeaderboardPageProps) {
    const [difficultySelected, setDifficultySelected] = useState<Difficulty>("easy");
    const [leaderboardResponseData, setLeaderboardResponseData] = useState<leaderboardResponse>();
    let top10;
    if(leaderboardResponseData){
        top10 = leaderboardResponseData[difficultySelected];
    }
    console.log(top10);
    useEffect(()=>{
        const getLeaderboard = async () => {
            try{
                const response = await fetch("http://localhost:3000/api/get-leaderboard");
                if(response.ok){
                    const data = await response.json();
                    setLeaderboardResponseData(data)
                }
                else{
                    console.error("FAILED TO FETCH LEADERBOARD", response);
                }
            } catch(error){
                console.error("Error in leaderboard request", error);
            }
        }
        getLeaderboard();
    },[])


    return (
        
        <div className="bg-letterboxd-background min-h-screen w-full flex  items-center justify-center">
            <div>
                <h1 className="text-white text-2xl ">
                Hall of Fame
                </h1>
            </div>
            <div className=" ">
            <DifficultyBoxes             
                onDifficultyChoice={(difficulty) => {
                    setDifficultySelected(difficulty);
                }} 
                difficultyPicked={difficultySelected} 
            />
            </div>
            <div>

            </div>
        </div>
        
    )
}