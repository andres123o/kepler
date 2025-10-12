# 🚀 Kepler - AI Agent UI

**"Crea con IA"** - Una plataforma SaaS que reemplaza el miedo a usar IA con el miedo a no vivir.

## 📋 Resumen del Proyecto

Kepler es una interfaz de usuario moderna y elegante para un agente de inteligencia artificial que permite a los usuarios crear y colaborar con IA de manera intuitiva. La plataforma está construida con React, TypeScript y Tailwind CSS, ofreciendo una experiencia visual impresionante con gradientes animados, efectos de partículas y una interfaz de chat avanzada.

### 🎯 Filosofía del Producto

El proyecto se basa en la filosofía de que **"El tiempo es la única moneda que importa"**. Busca ayudar a los creadores a automatizar tareas repetitivas para que puedan enfocarse en lo que realmente importa: vivir y crear.

## 🛠️ Stack Tecnológico

### Frontend
- **React 19.1.1** - Framework principal
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Tailwind CSS 4.1.12** - Framework de estilos
- **React Router DOM 7.8.2** - Navegación
- **Zustand 5.0.8** - Gestión de estado

### Componentes y Librerías
- **Lucide React** - Iconografía
- **React Markdown** - Renderizado de markdown
- **React Player** - Reproductor multimedia
- **Remark GFM** - Soporte para GitHub Flavored Markdown

### Herramientas de Desarrollo
- **ESLint** - Linting
- **PostCSS** - Procesamiento de CSS
- **Autoprefixer** - Compatibilidad de navegadores

## 🏗️ Arquitectura del Proyecto

### Estructura de Directorios
```
src/
├── components/          # Componentes reutilizables
│   ├── ChatAgent.tsx    # Interfaz principal del chat con IA
│   ├── Header.tsx       # Navegación y panel de feedback
│   ├── HeroSection.tsx  # Sección principal con CTA
│   ├── FlowSection.tsx  # Integraciones con herramientas IA
│   ├── Method.tsx       # Metodología de 3 pasos
│   ├── Manifiesto.tsx   # Filosofía y valores del producto
│   ├── Foter.tsx        # Footer con enlaces y copyright
│   ├── PlayLoad.tsx     # Reproductor de música integrado
│   └── GlobalBackground.tsx # Fondo con estrellas animadas
├── pages/               # Páginas principales
│   ├── Home.tsx         # Landing page
│   └── Agent.tsx        # Página del agente de chat
├── assets/              # Recursos estáticos
├── styles/              # Estilos adicionales
└── main.tsx            # Punto de entrada de la aplicación
```

## ✨ Características Principales

### 🎨 Diseño Visual
- **Gradientes Animados**: Fondos con gradientes de colores vibrantes que cambian dinámicamente
- **Efectos de Partículas**: Sistema de estrellas animadas y elementos flotantes
- **Glassmorphism**: Efectos de cristal con blur y transparencias
- **Responsive Design**: Adaptable a todos los dispositivos

### 🤖 Chat con IA
- **Interfaz de Chat Avanzada**: Sistema de mensajes con soporte para markdown
- **Sesiones Persistentes**: Mantiene el contexto de la conversación
- **Animaciones de Carga**: Indicadores visuales durante el procesamiento
- **Auto-scroll**: Navegación automática en la conversación

### 🎵 Reproductor de Música
- **Playlist Integrada**: Colección curada de música para inspirar la creatividad
- **Visualizador de Audio**: Barras de audio animadas sincronizadas con la música
- **Controles Intuitivos**: Play, pause, siguiente, anterior

### 📝 Sistema de Feedback
- **Panel Desplegable**: Sistema de feedback integrado en el header
- **Integración con Backend**: Envío automático de comentarios de usuarios

## 🔧 Configuración y Desarrollo

### Prerrequisitos
- Node.js 18+
- npm o yarn

### Instalación
```bash
# Clonar el repositorio
git clone <repository-url>
cd ai-agent-ui

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

### Scripts Disponibles
```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run preview  # Preview del build
npm run lint     # Ejecutar ESLint
```

## 🌐 Integraciones

### Backend APIs
El proyecto se conecta con múltiples endpoints de webhook:

1. **Chat Agent**: `https://primary-production-a44da.up.railway.app/webhook/8a3dbf17-017b-48b2-9c76-ae1a9cd15ea3`
2. **User Registration**: `https://primary-production-a44da.up.railway.app/webhook/f3ef75f3-1780-4b55-b39f-dfde6b84f6ab`
3. **Feedback System**: `https://primary-production-a44da.up.railway.app/webhook/6d46822f-5cab-4cd8-9245-0395d82f7358`

### Herramientas IA Integradas
- **N8N**: Automatización de workflows
- **Lovable**: Desarrollo con IA
- **Make**: Integración de aplicaciones

## 🎭 Experiencia de Usuario

### Flujo Principal
1. **Landing Page**: Presentación de la filosofía y valor del producto
2. **Registro**: Formulario simple para iniciar la sesión
3. **Chat Interface**: Interacción directa con el agente de IA
4. **Música de Fondo**: Ambiente sonoro para la creatividad

### Estados de la Aplicación
- **Loading States**: Indicadores de carga en formularios y chat
- **Error Handling**: Manejo elegante de errores de conexión
- **Persistent Storage**: Datos de usuario almacenados en localStorage

## 🎨 Paleta de Colores

La aplicación utiliza una paleta de gradientes vibrantes:
- **Naranja**: `rgb(255, 133, 19)`
- **Coral**: `rgb(228, 113, 51)`
- **Rosa**: `rgb(241, 100, 75)`
- **Magenta**: `rgb(212, 87, 106)`
- **Púrpura**: `#b84378`
- **Violeta**: `rgb(211, 38, 127)`

## 📱 Responsive Design

- **Mobile First**: Diseño optimizado para dispositivos móviles
- **Breakpoints**: Adaptación a tablets y desktop
- **Touch Friendly**: Interacciones táctiles optimizadas

## 🔒 Seguridad

- **Validación de Formularios**: Validación tanto en frontend como backend
- **Sanitización de Datos**: Limpieza de inputs del usuario
- **HTTPS**: Todas las comunicaciones cifradas

## 🚀 Despliegue

### Build de Producción
```bash
npm run build
```

Los archivos optimizados se generan en el directorio `dist/` listos para despliegue en cualquier servicio de hosting estático.

### Variables de Entorno
El proyecto está configurado para usar variables de entorno para las URLs de los webhooks.

## 📊 Métricas y Analytics

El proyecto incluye sistemas de tracking para:
- Registro de usuarios
- Interacciones con el chat
- Feedback de usuarios
- Uso de características

## 🤝 Contribución

### Estructura de Commits
- `feat:` Nueva funcionalidad
- `fix:` Corrección de bugs
- `style:` Cambios de estilo/UI
- `refactor:` Refactorización de código
- `docs:` Actualización de documentación

### Estándares de Código
- TypeScript estricto
- ESLint configurado
- Componentes funcionales con hooks
- Naming conventions consistentes

## 📄 Licencia

© 2024 Kepler - "Crea con IA". El tiempo ahorrado es vida ganada.

---

**"Deja de crear listas de tareas pendientes. Empieza a construir tu vida."**

*Hecho con ❤️ y mucho café en Bogotá*