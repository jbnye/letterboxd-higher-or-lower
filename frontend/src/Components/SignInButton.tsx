import {GoogleLogin } from "@react-oauth/google";
import {useAuth} from "../Context/UserContext";


export default function GoogleSignInButton() {
    const { setUser, setAuthStatus, authStatus, user, logout} = useAuth(); 


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


    return (
        <>
            <div>
                {authStatus ==="not-authenticated" || !user ? (
                    <GoogleLogin
                        onSuccess={handleLoginSuccess}
                        onError={() => {
                            //console.error("Login Failed");
                        }}
                        width="100%" 
                    />
                ) : (
                <div
                    className="flex items-center justify-center text-sm gap-2 bg-white border border-gray-300 
                            rounded-md px-3 py-2 h-12 shadow-sm hover:shadow-md transition"
                >
                    <img
                        src={user.picture}
                        alt="User avatar"
                        referrerPolicy="no-referrer"
                        className="w-5 h-5 rounded-full"
                    />
                    <span className=" text-gray-700 truncate max-w-[150px]">
                    {user?.email}
                    </span>
                    <div className="w-px h-4 bg-gray-300 mx-1"></div>
                    <button
                    onClick={() => {
                        logout();
                        setUser(null);
                        setAuthStatus("not-authenticated");
                    }}
                    className=" text-blue-600 hover:underline cursor-pointer"
                    >
                        Logout
                    </button>
                </div>
                )}
            </div>
        </>
    );
}