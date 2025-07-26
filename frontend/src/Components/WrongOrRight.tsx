import type { ColorState } from "../types/types";

interface WrongOrRightProps {
    ratingColor: ColorState;
}

export default function WrongOrRight({ratingColor}: WrongOrRightProps ) {
    return (
        <>
            {ratingColor === "correct" ? (
                <div className ={`bg-letterboxd-green absolute bottom-[50%] left-1/2 translate-x-[-50%]  translate-y-1/2 rounded-full text-black text-lg p-5 font-semibold
                border-4 border-black z-50`}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="white"
                        viewBox="0 0 24 24"
                        className="w-6 h-6"
                    >
                        <path d="M9 16.2l-3.5-3.5L4 14.2l5 5 12-12-1.4-1.4z" />
                    </svg>
                </div> 
            ): ratingColor === "incorrect" ? (
                <div className ={`bg-red-500 absolute bottom-[50%] left-1/2 translate-x-[-50%]  translate-y-1/2 rounded-full text-black text-lg p-5 font-semibold
                border-4 border-black z-50`}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                        <line x1="18" y1="6" x2="6" y2="18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                        <line x1="6" y1="6" x2="18" y2="18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                </div> 
            ): ratingColor === "none" ? (
                <div className ={`bg-white absolute bottom-[50%] left-1/2 translate-x-[-50%]  translate-y-1/2 rounded-full text-black text-lg p-5 font-semibold
                border-4 border-black z-50`}>
                    OR
                </div> 
            ): null
            }
        </>
    )
}