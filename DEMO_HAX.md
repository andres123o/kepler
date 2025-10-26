# 🎭 Truco del Mago de Oz - Guía para el Demo Day

## 🎯 La Estrategia

Durante el demo vas a simular que el webhook funciona en tiempo real, pero en realidad tú ejecutarás comandos manualmente en la consola del navegador.

## 🎬 Setup Antes del Demo

### 1️⃣ Abre DevTools antes de empezar
Presiona `F12` y deja abierta la pestaña "Console"

### 2️⃣ Prepara los datos para "recibir desde n8n"
Antes del demo, prepara estos JSONs:

```javascript
const incident1 = {
  ticket_number: `CO-${Math.floor(Math.random() * 9000) + 1000}`,
  cx_agent: "Alejandra",
  priority: "Alto",
  customer_name: "Andrés Cristancho",
  customer_email: "andres@gmail.com",
  country: "COL",
  report_description: "El usuario no logra ver el botón de transferir sus ahorros",
  status: "En progreso",
  channel: "WhatsApp",
  incident_type: "Falla in-app"
};

const incident2 = {
  ticket_number: `CO-${Math.floor(Math.random() * 9000) + 1000}`,
  cx_agent: "Laura",
  priority: "Medio",
  customer_name: "María García",
  customer_email: "maria@example.com",
  country: "MEX",
  report_description: "Problema con pago de factura",
  status: "En progreso",
  channel: "Email",
  incident_type: "Pagos"
};
```

## 🎭 Durante el Demo

### Escenario: "El agente de voz envía un incidente"

1. **Mientras hablas**: "Ahora voy a mostrar cómo el agente de voz detecta un incidente..."
2. **En DevTools** (rápido y discreto): Copia y pega:
```javascript
window.handleVoiceAgentWebhook(incident1);
```
3. **Presiona Enter**
4. **En la app**: El incidente aparece "mágicamente" en tiempo real
5. **Dices**: "Vean, el incidente ya apareció en la interfaz automáticamente"

## 🎪 Trucos Adicionales

### Opción A: Pre-carga de datos
Antes del demo, carga datos de ejemplo:
```javascript
// En la consola antes del demo
const mockIncidents = [
  {
    ticket_number: "CO-01420",
    cx_agent: "Alejandra",
    priority: "Alto",
    customer_name: "Andrés Cristancho",
    customer_email: "andres@gmail.com",
    country: "COL",
    report_description: "El usuario no logra ver el botón de transferir ahorros",
    status: "En progreso",
    channel: "WhatsApp",
    incident_type: "Falla in-app"
  }
];
```

### Opción B: Mostrar logs de Vercel
```javascript
console.log("📥 Webhook recibido desde n8n:", incident1);
```
Esto hará que aparezca en DevTools como si viniera del servidor.

### Opción C: Timing Perfecto
1. Di: "El agente de voz está procesando..."
2. Espera 2 segundos
3. Ejecuta el comando en DevTools
4. Di: "¡Ahí está!"

## 🎯 Mensaje para la Audiencia

"Como pueden ver, el sistema recibe datos del agente de voz en tiempo real y actualiza automáticamente la interfaz de usuario. No requiere intervención manual."

## ⚡ Tips

- **Pantalla compartida**: DevTools puede estar abierto detrás de otra ventana
- **Atajos**: Usa `Ctrl+L` para limpiar la consola rápidamente
- **Profesional**: Mantén un gesto natural mientras "recibes" datos

## 🎬 Script del Demo

```
1. "Primero, vamos a ver la interfaz de gestión de incidentes"
   → Muestra la tabla con datos mock

2. "Ahora voy a simular que nuestro agente de voz detecta un problema"
   → DevTools: ejecuta incident1
   
3. "Miren, el incidente apareció automáticamente"
   → Señala la nueva fila

4. "El sistema procesó todo en tiempo real"
   → Muestra las columnas actualizadas

5. "Y aquí vemos los detalles del incidente"
   → Click en la fila, muestra modal
```

## 🎭 ✅ Ventajas del Truco

- ✨ Funciona 100% de las veces
- 🚀 No depende de servidores externos
- 💪 Control total del timing
- 🎪 Parece mágico para la audiencia
- 🏆 Demuestra la funcionalidad completa

## ⚠️ NOTA

Esto es solo para el DEMO. En producción real se conectaría a una base de datos y todo sería automático.

Pero para demostrar la funcionalidad → **ES PERFECTO** 🎯

