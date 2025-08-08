


export default function AboutPage() {
    return (
        <div className="max-w-2xl mx-auto px-4 py-10 text-white">
            <h1 className="text-3xl font-bold text-letterboxd-orange mb-4">About This Project</h1>

            <p className="mb-4">
                Hello, my name is Jacob and I'm an aspiring software developer. One of my passions is watching and rating movies. I first came accross this game, 
                <a 
                    href="https://www.higherorlowergame.com/imdb/ratings-movies/" 
                    className="text-blue-400 underline ml-1" 
                    target="_blank" 
                    rel="noopener noreferrer"
                >
                    IMDB Higher or Lower Game
                </a> and while ok, I much prefer to use Letterboxd for ratings for movies. Therefore, I came up with the idea to take that game and apply it to <strong>Letterboxd's ratings</strong>. This website is heavily inspired by the IMDB Higher or Lower game. 
            </p>

            <p className="mb-4">
                I created this project both for fun and as a way to challenge myself technically. It pulls from a large dataset of movie ratings, with difficulty levels and a leaderboard to keep things competitive.
            </p>

            <p className="mb-4">
                Feel free to check out my own letterboxd profile and give a follow if you like the site: 
                <a 
                    href="https://letterboxd.com/Fachizzle/" 
                    className="text-blue-400 underline ml-1" 
                    target="_blank" 
                    rel="noopener noreferrer"
                >
                    Fachizzle
                </a>.
            </p>
        </div>
    );
}