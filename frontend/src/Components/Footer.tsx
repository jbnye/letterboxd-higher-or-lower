import {useState, useEffect} from "react";

interface lastDateResponse {
    dateLastUpdated: string,
}

export default function Footer({}){
    const [dateLastUpdated, setDateLasteUpdated] = useState<string | null>();
    useEffect(()=> {
        const getLastDateUpdated = async () => {
            try{
                const response = await fetch("http://localhost:3000/api/movies-last-updated");
                if(!response.ok){
                    throw new Error("Failure from server getting movies last updated");
                }
                const data = await response.json();
                const date = new Date(data.dateLastUpdated);
                setDateLasteUpdated(date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }));
            } catch (error){
                console.error("Failed to fetch get last updated api");
            }
        }
        getLastDateUpdated();
    },[]);

    return(
        <footer className="bg-letterboxd-background flex flex-col w-full gap-3 text-center text-sm items-center justify-center text-white mt-4 p-2">
            {dateLastUpdated && (
                <p>Movie stats last updated: {dateLastUpdated}. Not affiliated with or endorsed by Letterboxd.</p>
            )}
            <div className="flex gap-6 justify-center items-center">
                <div className="">
                    <a 
                        href="https://letterboxd.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                    >
                    <img src="/Images/letterboxd-mac-icon.png" alt="Letterboxd" className="w-8 h-8" />
                    </a>
                </div>
                <div className="bg-amber-50 border rounded-2xl">
                    <a 
                        href="https://github.com/jbnye" 
                        target="_blank" 
                        rel="noopener noreferrer"
                    >
                    <img src="/Images/github_icon.png" alt="GitHub" className="w-8 h-8" />
                    </a>
                </div>
                <a href="mailto:jn3268@gmail.com">jn3268@gmail.com</a>
            </div>
    </footer>
    )
}