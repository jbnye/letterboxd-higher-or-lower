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
                const data: lastDateResponse = await response.json();
                const date = new Date(data.dateLastUpdated);
                setDateLasteUpdated(date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }));
            } catch (error){
                console.error("Failed to fetch get last updated api");
            }
        }
        getLastDateUpdated();
    },[]);

    return(
        <footer className="bg-letterboxd-lighter-gray dark:bg-letterboxd-background flex w-full gap-3 text-center text-sm items-center justify-center min-h-[42px]
        text-medium-gray dark:text-white mt-4 p-2">
            {dateLastUpdated && (
                <span className="pr-4 border-r border-medium-gray dark:border-white">Movie stats last updated: {dateLastUpdated}.</span>
            )}
            <span className="pr-4 border-r border-medium-gray dark:border-white">Not affiliated with or endorsed by Letterboxd.</span>
            <span><a href="mailto:jn3268@gmail.com">jn3268@gmail.com</a></span>
            {/* <div className="flex gap-6 justify-center items-center">
                <div className="border-black bg-white dark:bg-white border rounded-2xl">
                    <a 
                        href="https://github.com/jbnye" 
                        target="_blank" 
                        rel="noopener noreferrer"
                    >
                    <img src="/Images/github_icon.png" alt="GitHub" width="32" height="32" className="w-8 h-8" loading="eager" />
                    </a>
                </div>
            </div> */}
    </footer>
    )
}