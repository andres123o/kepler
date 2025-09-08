import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// 1. Importa BrowserRouter
import { BrowserRouter } from 'react-router-dom' 
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* 2. Envuelve tu componente App con BrowserRouter */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
