import {GoogleLogin } from "@react-oauth/google";
import {useAuth} from "../Context/UserContext";


export default function GoogleSignInButton() {
    const { setUser, setAuthStatus, authStatus, user, logout} = useAuth(); 


    const handleLoginSuccess = async (credentialResponse: any) => {
        console.log(credentialResponse);
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
            console.log(data);

            if(data.user) {
                setUser(data.user);
                setAuthStatus("authenticated");
            }
            else{
                console.log("No response from backend for user credentials");
            }

        } catch (error){
            console.log("Login Failure:", error);
        }
    }
    console.log("RENDERING", authStatus, user);


    return (
        <>
            <div>
                {authStatus ==="not-authenticated" || !user ? (
                    <GoogleLogin
                        onSuccess={handleLoginSuccess}
                        onError={() => {
                            console.error("Login Failed");
                        }}
                    />
                    ) : (
                    <div className="flex items-center gap-2 bg-white p-2 rounded shadow">
                        <img
                        src={user.picture}
                        alt="User avatar"
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-full"
                        />
                        <div className="text-black text-[12px] md:text-sm">
                        Signed in as <strong>{user?.email}</strong>
                        </div>
                        <button
                        onClick={() => {
                            logout();
                            setUser(null);
                            setAuthStatus("not-authenticated");
                        }}
                        className="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                        >
                        Logout
                        </button>
                    </div>
                    )
                }
            </div>
        </>
    )
}