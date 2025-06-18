import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { ServerStatusProvider } from './context/ServerStatusContext.tsx';
import Game from "./Components/Game.tsx"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ServerStatusProvider>
      <Game />
    </ServerStatusProvider>
  </StrictMode>,
)
