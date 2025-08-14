import { createContext, useState, useEffect, useContext, useMemo } from "react";
import type { ServerStatus } from "../types/types";


interface ServerStatusContextType {
  status: ServerStatus;
  serverHasBeenChecked: boolean;
}

const ServerStatusContext = createContext<ServerStatusContextType | undefined>(undefined);
export const ServerStatusProvider = ({ children }: { children: React.ReactNode }) => {
    const [status, setStatus] = useState<ServerStatus>('checking');
    const [serverHasBeenChecked, setServerHasBeenChecked] = useState(false);
    console.log(status);

    const pingServer = async () => {
      try {

        const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
        const response = await fetch(`${API_BASE}/api/ping`);
        if(response.ok){
          setStatus('online');
        }
        else {
          setStatus('offline');
          }
      } catch (error) {
        setStatus('offline');
        throw error;
      }
      finally{
        setServerHasBeenChecked(true);
      }
  };


  useEffect(() => {
    pingServer();
    // const interval = setInterval(pingServer, 10000); 
    // return () => clearInterval(interval);
  }, []);

  const value = useMemo(()=> {
    return (
      {
      status,
      serverHasBeenChecked,
      }
    )
  },[status, serverHasBeenChecked])

  return (
    <ServerStatusContext.Provider value={value}>
      {children}
    </ServerStatusContext.Provider>
  );
};

export const useServerStatus = () => {
  const context = useContext(ServerStatusContext);
    if (!context) {
    throw new Error("useServerStatus must be used within a ServerStatusProvider");
  }
  return context;
};