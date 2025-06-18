import {useState} from "react";

type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Impossible';

export default function WelcomePage(){
    const [difficultyPicked, setDifficultyPicked] = useState<Difficulty>("Easy");
    const difficulties: Difficulty[] = ['Easy', 'Medium', 'Hard', 'Impossible'];

    const handleDifficultyClick = (difficulty: Difficulty) => {
        setDifficultyPicked(difficulty);
    };
    

    return(
        <div>
            <h1>Letterboxd Higher or Lower Game</h1>
            <div className="flex gap-4 justify-center flex-wrap mt-8">
                {difficulties.map((level) =>(
                    <div
                    key = {level}
                    onClick={() => handleDifficultyClick(level)}
                    className={`w-32 h-32 flex items-center justify-center rounded-xl shadow-md cursor-pointer transition-all select-none
                    ${difficultyPicked === level ? "bg-blue-500 text-white" : "bg-white hover:bg-gray-100"}
                    `}
                    >
                    <span className="text-lg font-semibold">{level}</span>
                    </div>
                )
                )}
            </div>
        </div>
    )

}