import {createContext, useContext, useState, useEffect, useMemo} from "react";
import type { windowBreakpoints } from "@/types/types";

interface ThemeStatusProps{
    darkMode: boolean;
    setDarkMode: (select: boolean) => void;
    breakpoint: windowBreakpoints;
    isSoundOn: boolean;
    setIsSoundOn: (select: boolean) => void;
}

const ThemeStatus = createContext<ThemeStatusProps | undefined>(undefined);

export const ThemeStatusProvider = ({children}: {children: React.ReactNode}) => {
    const [darkMode, setDarkMode] = useState<boolean>(() => {
        if(typeof window === 'undefined'){return true;}
        const stored = localStorage.getItem("darkMode");
        if(stored === 'true'){return true};
        if(stored === 'false'){return false;}
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    const [breakpoint, setBreakpoint] = useState<"mobile" | "tablet" | "desktop">("desktop");
    const [isSoundOn, setIsSoundOn] = useState<boolean>(true);

    useEffect(()=> {
        const checkBreakpoint = () => {
            const width = window.innerWidth;
            if(width <= 767) setBreakpoint("mobile");
            else if(width<=1024) setBreakpoint("tablet");
            else setBreakpoint("desktop");
        }
        checkBreakpoint();
        window.addEventListener("resize", checkBreakpoint);
        return () => window.removeEventListener("resize", checkBreakpoint);
    },[]);

    useEffect(() => {
        localStorage.setItem("darkMode", darkMode.toString());
        document.documentElement.classList.toggle("dark", darkMode);
    }, [darkMode]);

    const value = useMemo(() => ({
        darkMode,
        setDarkMode,
        breakpoint,
        isSoundOn,
        setIsSoundOn,
    }), [darkMode, breakpoint, isSoundOn]);

    return(
        <ThemeStatus.Provider value={value}>
            {children}
        </ThemeStatus.Provider>
    )
}

export function useThemeContext() {
    const context = useContext(ThemeStatus);
    if(!context) throw new Error("Could not create theme context");
    return context;
}