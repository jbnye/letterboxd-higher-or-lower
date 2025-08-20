import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../Context/UserContext";
import { useState, useEffect } from "react";


export default function GoogleSignInButton() {
    const { setUser, setAuthStatus, authStatus, user, logout } = useAuth();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    const handleLogout = () => {
        logout();
        setUser(null);
        setAuthStatus("not-authenticated");
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 1000);
    };
    const handleLoginSuccess = async (credentialResponse: any) => {
        //console.log(credentialResponse);
        const token = credentialResponse.credential;
        if(!token) return;
        try{
            const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
            const response = await fetch(`${API_BASE}/api/google-auth`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json",
                },
                body: JSON.stringify({token}),
                credentials: "include",
            });

            const data = await response.json();
            //console.log(data);

            if(data.user) {
                setUser(data.user);
                setAuthStatus("authenticated");
            }
            else{
                //console.log("No response from backend for user credentials");
            }

        } catch (error){
            //console.log("Login Failure:", error);
        }
    }
    //console.log("RENDERING", authStatus, user);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-12 w-full bg-gray-100 rounded border border-gray-300">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading...</span>
            </div>
        );
    }

    return (
        <div className="w-full">
            {authStatus === "not-authenticated" || !user ? (
                <div className="relative overflow-hidden h-12 w-full">

                    <div className="absolute -top-96 left-0 w-full">
                        <GoogleLogin
                            onSuccess={handleLoginSuccess}
                            onError={() => {}}
                            width="100%"
                        />
                    </div>

                    <div className="w-full h-full">
                        <GoogleLogin
                            onSuccess={handleLoginSuccess}
                            onError={() => {}}
                            width="100%"
                        />
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-center text-sm gap-2 bg-white border border-gray-300 rounded-md px-3 py-2 h-12 shadow-sm hover:shadow-md transition w-full">
                    <img
                        src={user.picture}
                        alt="User avatar"
                        referrerPolicy="no-referrer"
                        className="w-5 h-5 rounded-full"
                    />
                    <span className="text-gray-700 truncate max-w-[150px]">{user?.email}</span>
                    <div className="w-px h-4 bg-gray-300 mx-1"></div>
                    <button
                        onClick={handleLogout}
                        className="text-blue-600 hover:underline cursor-pointer"
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
}