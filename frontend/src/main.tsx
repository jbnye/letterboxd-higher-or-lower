import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { ServerStatusProvider } from './Context/ServerStatusContext.tsx';
import {AuthProvider} from './Context/UserContext.tsx';
import { GoogleOAuthProvider } from '@react-oauth/google';
import GameWrapper from "./Components/GameWrapper.tsx";


const clientId = import.meta.env.VITE_Client_ID;


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <ServerStatusProvider>
        <AuthProvider>
            <GameWrapper />
        </AuthProvider>
      </ServerStatusProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
