import { createContext, useState, useContext } from "react";
import type { AuthStatus } from "../types/types";

interface User {
    email: string;
    name: string;
    avatar: string;
    sub: string;
}

interface AuthConextProps {
    user: User | null;
    authStatus: AuthStatus;
    setUser: (user: User | null) => void;
    setAuthStatus: (status: AuthStatus) => void;
    logout: () => void;
}


const AuthContext = createContext<AuthConextProps | undefined> (undefined);

export const AuthProvider = ({children }: {children: React.ReactNode}) => {
    const [user, setUserState] = useState <User | null> (null);
    const [authStatus, setAuthStatusState] = useState<AuthStatus>("not-authenticated");

    const setUser = (user: User | null) => {
        setUserState(user);
    };

    const setAuthStatus = (status: AuthStatus) => {
        setAuthStatusState(status);
    };

    const logout = () => {
        setUserState(null);
        setAuthStatus("not-authenticated");
        //to-do remove cookie
    };

    return (
        <AuthContext.Provider value={{user, authStatus, setUser, setAuthStatus, logout}}>
            {children}
        </AuthContext.Provider>
    )
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};