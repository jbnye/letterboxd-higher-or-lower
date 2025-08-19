import { createContext, useState, useContext, useEffect, useMemo } from "react";
import type { AuthStatus } from "../types/types";

interface User {
    email: string;
    name: string;
    picture: string;
    sub: string;
}
interface Highscores {
    easy: number;
    medium: number;
    hard: number;
    impossible: number;
}

interface AuthConextProps {
    user: User | null;
    authStatus: AuthStatus;
    setUser: (user: User | null) => void;
    setAuthStatus: (status: AuthStatus) => void;
    userHighscores: Highscores | null;
    setUserHighscores: (scores: Highscores | null) => void;
    logout: () => void;
    userHasBeenChecked: boolean;
}


const AuthContext = createContext<AuthConextProps | undefined> (undefined);

export const AuthProvider = ({children }: {children: React.ReactNode}) => {
    const [user, setUserState] = useState <User | null> (null);
    const [authStatus, setAuthStatusState] = useState<AuthStatus>("not-authenticated");
    const [userHighscores, setUserHighscoresState] = useState<Highscores | null>(null);
    const [userHasBeenChecked, setUserHasBeenChecked] = useState<boolean>(false);
    //console.log("context user", user)
    const setUser = (user: User | null) => {
        setUserState(user);
    };

    const setAuthStatus = (status: AuthStatus) => {
        setAuthStatusState(status);
    };
    const setUserHighscores = (hs: Highscores | null) => {
        if (hs && typeof hs === "object" && "easy" in hs) {
            setUserHighscoresState(hs);
        } else {
            console.error("Invalid highscores passed into context:", hs);
        }
    }

    const logout = async () => {
        try {
            const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
            await fetch(`${API_BASE}/api/logout`, {
            method: "POST",
            credentials: "include", 
            });
        } catch (error) {
            //console.error("Logout request failed", error);
        }

        setUserState(null);
        setAuthStatus("not-authenticated");
        setUserHighscoresState(null);
    };

    useEffect(() => {
        const checkCookieLogin = async () => {
            setAuthStatus("checking"); 
            setUserHasBeenChecked(true);
            try {
                const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
                const response = await fetch(`${API_BASE}/api/auth-status`, {
                    method: "GET",
                    credentials: "include",
                });

                if (response.ok) {
                    const data = await response.json();
                    setUser(data.user);
                    setAuthStatus("authenticated");
                } else if (response.status === 401) {
                    setUser(null);
                    setAuthStatus("not-authenticated");
                } else {
                    //console.warn("Unexpected auth check status:", response.status);
                    setAuthStatus("not-authenticated");
                }
            } catch (error) {
                //console.error("Network error checking auth status", error);
                setAuthStatus("not-authenticated");
            }
        };

        checkCookieLogin();
    }, []);


    useEffect (() => {
        const fetchHighscores = async () => {
            if(!user){
                return;
            }
            try{
                const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
                const response = await fetch(`${API_BASE}/api/get-highscores?userSub=${user?.sub}`, {
                    method: "GET",
                    credentials: "include",
                    });
                const data = await response.json();
                setUserHighscores(data.highscores);
            } catch (error){
                //console.error("Failed to fetch get-highscores",error)
            }
        }
        fetchHighscores();
    },[user]);

    const value = useMemo(() => ({
        user,
        authStatus,
        setUser,
        setAuthStatus,
        userHighscores,
        setUserHighscores,
        logout,
        userHasBeenChecked,
    }), [user, authStatus, userHighscores]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};