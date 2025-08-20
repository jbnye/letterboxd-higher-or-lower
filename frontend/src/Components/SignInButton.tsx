import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "../Context/UserContext";

export default function GoogleSignInButton() {
  const { setUser, setAuthStatus, authStatus, user, logout } = useAuth();

  // useGoogleLogin returns a function to call when clicking the button
  const login = useGoogleLogin({
    flow: "implicit", // get access_token
    onSuccess: async (tokenResponse) => {
      const accessToken = tokenResponse.access_token;
      if (!accessToken) return;

      try {
        // Send the access token to backend for session + JWT
        const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
        const response = await fetch(`${API_BASE}/api/google-auth`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: accessToken }),
          credentials: "include",
        });

        const data = await response.json();

        if (data.user) {
          // ✅ Update the user and auth state
          setUser(data.user);
          setAuthStatus("authenticated");
        } else {
          setAuthStatus("not-authenticated");
        }
      } catch (error) {
        console.error("Login failure:", error);
        setAuthStatus("not-authenticated");
      }
    },
    onError: () => setAuthStatus("not-authenticated"),
  });

  return (
    <div className="w-full">
      {authStatus === "not-authenticated" || !user ? (
        <button
          onClick={() => login()}
          className="flex items-center justify-center gap-2 bg-white border border-gray-300 
                     rounded-md px-3 py-2 h-12 shadow-sm hover:shadow-md transition w-full cursor-pointer hover:border-2 hover:border-blue-400"
        >
          <img src="/Images/google.svg" alt="Google logo" className="w-5 h-5 justify-self-start" />
          <span className="text-gray-700">Sign in with Google</span>
        </button>
      ) : (
        <div
          className="flex items-center justify-center text-sm gap-2 bg-white border border-gray-300 
                     rounded-md px-3 py-2 h-12 shadow-sm hover:shadow-md transition w-full"
        >
          <img
            src={user.picture}
            alt="User avatar"
            referrerPolicy="no-referrer"
            className="w-5 h-5 rounded-full"
          />
          <span className="text-gray-700 truncate max-w-[150px]">{user.email}</span>
          <div className="w-px h-4 bg-gray-300 mx-1"></div>
          <button
            onClick={() => {
              logout();
              setUser(null);
              setAuthStatus("not-authenticated");
            }}
            className="text-blue-600 hover:underline cursor-pointer"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}