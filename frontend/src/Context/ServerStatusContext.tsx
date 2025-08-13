import { createContext, useState, useEffect, useContext } from "react";
import type { ServerStatus } from "../types/types";


interface ServerStatusContextType {
  status: ServerStatus;
}
const ServerStatusContext = createContext<ServerStatusContextType | undefined>(undefined);
export const ServerStatusProvider = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = useState<ServerStatus>('checking');
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
  };


  useEffect(() => {
    pingServer();
    // const interval = setInterval(pingServer, 10000); 
    // return () => clearInterval(interval);
  }, []);

  return (
    <ServerStatusContext.Provider value={{ status }}>
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