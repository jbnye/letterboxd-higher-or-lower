import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { ServerStatusProvider } from './Context/ServerStatusContext.tsx';
import GameWrapper from "./Components/GameWrapper.tsx";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ServerStatusProvider>
      <GameWrapper />
    </ServerStatusProvider>
  </StrictMode>,
)
