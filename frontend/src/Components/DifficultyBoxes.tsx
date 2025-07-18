import {useState} from "react";
import type { Difficulty } from "../types/types";

interface DifficultyBoxesProps{
    difficultyPicked: Difficulty,
    onDifficultyChoice: (difficulty: Difficulty) => void
}
export default function DifficultyBoxes({difficultyPicked, onDifficultyChoice}: DifficultyBoxesProps){
    const difficulties: Difficulty[] = ['Easy', 'Medium', 'Hard', 'Impossible'];
 return (
    <div className="flex gap-4 justify-center flex-wrap mt-8">
      {difficulties.map((difficulty) => (
        <div
          key={difficulty}
          onClick={() => onDifficultyChoice(difficulty)}
          className={`w-32 h-32 flex items-center justify-center rounded-xl shadow-md cursor-pointer 
                      transition-all select-none
                      ${difficultyPicked === difficulty ? "bg-letterboxd-green hover:opacity-85 text-white" : "bg-white hover:bg-gray-300"}`}
        >
          <span className="text-lg font-semibold">{difficulty}</span>
        </div>
      ))}
    </div>
  );
}
