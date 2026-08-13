import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GuestSessionProvider } from './auth/GuestSessionProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GuestSessionProvider>
      <App />
    </GuestSessionProvider>
  </StrictMode>,
)
