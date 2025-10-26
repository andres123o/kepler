// 1. Importa los componentes necesarios de react-router-dom
import { Routes, Route } from 'react-router-dom';

import Agent from './pages/Agent'
import Home from './pages/Home'
import CaseTracking from './pages/CaseTracking'
import GlobalBackground from './components/GlobalBackground'
import HomeDemo from './demo/homeDemo'
import EncuestaNPS from './demo/encuestaNPS'
import EncuestaScat from './demo/Scat'

function App() {
  return (
    <div>
      {/* El fondo global puede quedar aquí para que se muestre en todas las páginas */}
      <GlobalBackground />

      {/* 2. Aquí definimos las rutas */}
      <Routes>
        {/* Cuando la URL sea "/", muestra el componente Home */}
        <Route path="/" element={<Home />} />

        {/* Cuando la URL sea "/agent", muestra el componente Agent */}
        <Route path="/agent" element={<Agent />} />

        <Route path="/demo" element={<HomeDemo />} />
        
        {/* Ruta para tracking de caso */}
        <Route path="/caso/:ticketNumber" element={<CaseTracking />} />
        
        {/* Ruta única para la encuesta NPS */}
        <Route path="/encuesta/nps" element={<EncuestaNPS />} />
        
        {/* Ruta única para la encuesta SCAT */}
        <Route path="/encuesta/scat" element={<EncuestaScat />} />
      </Routes>
    </div>
  )
}

export default App;