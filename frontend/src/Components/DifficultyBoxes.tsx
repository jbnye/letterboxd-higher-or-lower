
import type { Difficulty } from "../types/types";
import { useAuth } from "../Context/UserContext";
import type { Highscores } from "../types/types";
import { capitalizeFirst } from "../Util/utilityFunctions";
import {Tooltip, TooltipTrigger, TooltipContent } from "@/Components/ui/tooltip";

interface DifficultyBoxesProps{
    difficultyPicked: keyof Highscores | null;
    onDifficultyChoice: (d: keyof Highscores) => void
    style: string
}
export default function DifficultyBoxes({difficultyPicked, onDifficultyChoice, style}: DifficultyBoxesProps){
    const {userHighscores} = useAuth();
    //console.log(userHighscores);
    const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'impossible'];
    const getDifficultyDescription = (difficulty: keyof Highscores ): string => {
      let difficultyDescription;
      if(difficulty === "easy"){
        difficultyDescription = "Top 500 most popular movies on letterboxd";
      } else if(difficulty === "medium"){
        difficultyDescription = "Top 1,200 most popular movies on letterboxd";
      } else if(difficulty === "hard"){
        difficultyDescription = "Top 2,500 most popular movies on letterboxd";
      } else {
        difficultyDescription = "Top 10,000 most popular ENTRIES on letterboxd. This includes all categories (movies, documentaries, short-films, and tv shows). BE WARNED 💀"
      }
      return difficultyDescription
    } 

  return (
    <div className="grid grid-cols-2 md:flex md:flex-row md:gap-6 gap-4 justify-center mt-8">
      {difficulties.map((difficulty) => (
        <Tooltip key={difficulty}>
          <TooltipTrigger asChild>
            <div
              onClick={() => onDifficultyChoice(difficulty)}
              className={`${style} flex flex-col items-center justify-center rounded-xl shadow-md cursor-pointer 
                transition-all select-none
                ${difficultyPicked === difficulty 
                  ? "bg-letterboxd-green hover:opacity-85 text-white" 
                  : "bg-white dark:text-black hover:bg-gray-300"}`}
            >
              <span className="text-lg font-semibold">{capitalizeFirst(difficulty)}</span>
              {userHighscores && (
                <span className="text-xl font-bold">
                  <span className="relative -top-0.5">👑</span> {userHighscores[difficulty]}
                </span>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="flex flex-col gap-1 break-words">
              <span>{getDifficultyDescription(difficulty)}</span>
              {userHighscores && (
                <span>{`Current highscore for ${difficulty}: ${userHighscores[difficulty]}`}</span>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
