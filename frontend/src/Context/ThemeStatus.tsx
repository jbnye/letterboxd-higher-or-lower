import {createContext, useContext, useState, useEffect, useMemo} from "react";


interface ThemeStatusProps{
    darkMode: boolean;
    setDarkMode: (select: boolean) => void;
}


const ThemeStatus = createContext<ThemeStatusProps | undefined>(undefined);

export const ThemeStatusProvider = ({children}: ({children: React.ReactNode})) => {
    const [darkMode, setDarkMode] = useState<boolean>(() => {
        if(typeof window === 'undefined'){return true;}
        const stored = localStorage.getItem("darkMode");
        if(stored === 'true'){return true};
        if(stored === 'false'){return false;}
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });
    // console.log(darkMode);

    useEffect(() => {
        localStorage.setItem('darkMode', darkMode.toString());
        if(darkMode){
            document.documentElement.classList.add('dark');
        }else{
            document.documentElement.classList.remove('dark');
        }
    },[darkMode]);

    const value = useMemo(() => ({darkMode, setDarkMode}), [darkMode]);
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
