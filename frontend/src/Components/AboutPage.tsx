


export default function AboutPage() {
    return (
        <div className="max-w-2xl mx-auto px-4 py-10 text-white">
            <h1 className="text-3xl font-bold text-letterboxd-orange mb-4">About This Project</h1>

            <p className="mb-4">
                This site is a fan-made tribute inspired by the popular 
                <a 
                    href="https://www.higherorlowergame.com/imdb/ratings-movies/" 
                    className="text-blue-400 underline ml-1" 
                    target="_blank" 
                    rel="noopener noreferrer"
                >
                    IMDB Higher or Lower game
                </a>. 
                Instead of IMDB scores, this version uses ratings from <strong>Letterboxd</strong>, a platform I personally prefer for film tracking and discovery.
            </p>

            <p className="mb-4">
                I created this project both for fun and as a way to challenge myself technically. It pulls from a large dataset of movie ratings, with difficulty levels and a leaderboard to keep things competitive.
            </p>

            <p className="mb-4">
                If you're a fellow movie lover, feel free to check out and follow me on Letterboxd:
                <a 
                    href="https://letterboxd.com/Fachizzle/" 
                    className="text-blue-400 underline ml-1" 
                    target="_blank" 
                    rel="noopener noreferrer"
                >
                    @Fachizzle
                </a>.
            </p>

            <h2 className="text-2xl font-semibold text-letterboxd-orange mt-8 mb-2">Technologies Used</h2>
            <ul className="list-disc list-inside mb-4">
                <li>Frontend: React (Vite) + TailwindCSS</li>
                <li>Backend: Node.js with Express</li>
                <li>Database: PostgreSQL & Redis (via WSL)</li>
                <li>Data Source: Letterboxd (scraped)</li>
                <li>Deployment: Dockerized (in progress)</li>
            </ul>

            <p className="text-sm text-gray-400 mt-8">
                This project is for educational and personal use only. It is not affiliated with or endorsed by Letterboxd.
            </p>

            {/* Social links */}
            <div className="mt-8 flex gap-6 justify-center items-center">
                {/* GitHub */}
                <a 
                    href="https://github.com/jbnye" 
                    target="_blank" 
                    rel="noopener noreferrer"
                >
                    <img 
                        src="/github-icon.svg" 
                        alt="GitHub" 
                        className="w-8 h-8 hover:opacity-75 transition"
                    />
                </a>

                {/* Email */}
                <a href="mailto:jn3268@gmail.com">
                    <img 
                        src="/email-icon.svg" 
                        alt="Email" 
                        className="w-8 h-8 hover:opacity-75 transition"
                    />
                </a>
            </div>
        </div>
    );
}