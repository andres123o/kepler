// 1. Importa los componentes necesarios de react-router-dom
import { Routes, Route } from 'react-router-dom';

import Agent from './pages/Agent'
import Home from './pages/Home'
import GlobalBackground from './components/GlobalBackground'

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
      </Routes>
    </div>
  )
}

export default App;