
import { useThemeContext } from "@/Context/ThemeStatus";

export default function AboutPage() {
    const {darkMode} = useThemeContext();
    return (

        <div className="max-w-2xl mx-auto px-4  text-black dark:text-white">
            <h1 className="text-letterboxd-orange text-2xl md:text-4xl mt-4 md:mt-4 mb-4 text-center">About This Project</h1>

            <p className="mb-4">
                Hello, my name is Jacob and I'm an aspiring software developer. One of my passions is watching and rating movies. I first came accross this game, 
                <a 
                    href="https://www.higherorlowergame.com/imdb/ratings-movies/" 
                    className=" md:inline-block text-blue-500 underline ml-1 hover:scale-105 duration-200 transition-all" 
                    target="_blank" 
                    rel="noopener noreferrer"
                >
                    IMDB Higher or Lower Game
                </a> and while ok, I much prefer to use Letterboxd for ratings for movies. Therefore, I came up with the idea to take that game and apply it to <strong>Letterboxd's ratings</strong>. This website is heavily inspired by the IMDB Higher or Lower game. 
            </p>

            <p className="mb-4">
                I created this project both for fun and as a way to challenge myself technically. It pulls from a large dataset of movie ratings, with difficulty levels and a leaderboard to keep things competitive.
            </p>

            <p className="mb-4 leading-relaxed">
            In this game, you'll see two film posters side by side. Your goal is to choose 
            the movie with the higher <span className="font-semibold">Letterboxd average rating </span> 
            before the timer runs out.  
            <br /><br />
            A wrong guess or running out of time ends the game.  
            </p>
            <span className="font-semibold">Difficulties:</span>
            <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong>Easy</strong> - Top 500 most popular movies.</li>
                <li><strong>Medium</strong> - Top 1,200 most popular movies.</li>
                <li><strong>Hard</strong> - Top 2,500 most popular movies.</li>
                <li><strong>Impossible</strong> - Top 10,000 <u><strong>entries</strong></u> (including short films, documentaries, and TV shows).</li>
            </ul>
            <br /><br />
            <p className="mb-4">
                Check out my own letterboxd profile and my github. Give a follow if you like the site: 
            </p>

            <div className="flex justify-center gap-4">
                <button>
                    <a
                        href="https://letterboxd.com/Fachizzle"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-[150px] h-[80px] border-2 border-black dark:border-white rounded-2xl flex items-center justify-center transition-all duration-200 hover:bg-letterboxd-lighter-gray dark:hover:bg-gray-700 hover:scale-110"
                    >
                        <img
                        src={darkMode===true ? "/Images/letterboxd-decal-dots-neg-rgb.svg": "/Images/letterboxd-decal-dots-pos-rgb.svg" }
                        alt="Letterboxd"
                        className="w-12 h-12"
                        />
                    </a>
                </button>

                <button className="">
                    <a
                        href="https://github.com/jbnye"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-[150px] h-[80px] border-2 border-black dark:border-white rounded-2xl flex items-center justify-center transition-all duration-200 hover:bg-letterboxd-lighter-gray dark:hover:bg-gray-700 hover:scale-110"
                    >
                        {gitHubSVG()}
                    </a>
                </button>
            </div>

        </div>
    );
}


function gitHubSVG() {
    return (
        <svg
        className="w-10 h-10 text-gray-800 dark:text-white"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        >
        <path d="M12 .296c-6.63 0-12 5.373-12 12 0 5.303 
        3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 
        0-.285-.01-1.04-.015-2.04-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.744.083-.729.083-.729 
        1.205.084 1.84 1.236 1.84 1.236 1.07 1.835 2.807 1.305 3.492.998.108-.775.418-1.305.76-1.605-2.665-.3-5.466-1.334-5.466-5.931 
        0-1.31.468-2.38 1.235-3.22-.124-.303-.535-1.524.117-3.176 
        0 0 1.008-.322 3.3 1.23a11.52 11.52 0 0 1 3.003-.404c1.018.005 
        2.042.138 3.003.404 2.29-1.552 3.296-1.23 
        3.296-1.23.653 1.653.242 2.874.118 3.176.77.84 
        1.233 1.91 1.233 3.22 0 4.609-2.804 5.628-5.475 
        5.922.43.372.823 1.102.823 2.222 
        0 1.604-.015 2.896-.015 3.286 
        0 .32.218.694.825.576C20.565 22.092 
        24 17.592 24 12.296c0-6.627-5.373-12-12-12z"/>
        </svg>
    )
}