import { useThemeContext } from "@/Context/ThemeStatus";
import {useState, useEffect} from "react";

interface lastDateResponse {
    dateLastUpdated: string,
}

export default function Footer({}){
    const [dateLastUpdated, setDateLasteUpdated] = useState<string | null>();
    const {breakpoint} = useThemeContext();
    useEffect(()=> {
        const getLastDateUpdated = async () => {
            try{
                const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
                const response = await fetch(`${API_BASE}/api/movies-last-updated`);
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
        <footer className=" bg-letterboxd-lighter-gray dark:bg-letterboxd-background  flex-wrap w-full  text-center text-sm items-center justify-center min-h-[42px] text-medium-gray dark:text-white
        flex flex-col mt-4 p-2 gap-1
        md:gap-3 md:flex-row ">
            {dateLastUpdated && (
                <span className="md:pr-4 md:border-r md:border-medium-gray md:dark:border-white">Movie stats last updated: {dateLastUpdated}.</span>
            )}
            <span className="md:pr-4 md:border-r md:border-medium-gray md:dark:border-white">Not affiliated with or endorsed by Letterboxd.</span>
            {breakpoint !== "mobile" && <span><a href="mailto:jn3268@gmail.com">jn3268@gmail.com</a></span>}
        </footer>
    )
}