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
        <footer className="w-full text-center text-sm text-white mt-4 mb-2">
            {dateLastUpdated && (
                <p>Movie stats last updated: {dateLastUpdated}</p>
            )}
    </footer>
    )
}