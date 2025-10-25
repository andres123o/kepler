# 🚀 Instrucciones de Despliegue en Vercel

## ✅ Pre-requisitos

1. Cuenta en **GitHub** (gratis)
2. Cuenta en **Vercel** (gratis)

## 📝 Pasos para Desplegar

### 1️⃣ Subir el Código a GitHub

```bash
# Si ya tienes repositorio
git add .
git commit -m "feat: add webhook endpoint for n8n integration"
git push origin main

# Si NO tienes repositorio
git init
git add .
git commit -m "feat: add webhook endpoint for n8n integration"
git remote add origin https://github.com/TU_USUARIO/ai-agent-ui.git
git branch -M main
git push -u origin main
```

### 2️⃣ Desplegar en Vercel

1. Ve a https://vercel.com
2. Click en **"Add New"** → **"Project"**
3. Selecciona tu repositorio de GitHub
4. Click en **"Import"**
5. Deja las configuraciones por defecto
6. Click en **"Deploy"**

### 3️⃣ Obtener la URL

Una vez desplegado, Vercel te dará una URL como:
```
https://ai-agent-ui.vercel.app
```

Tu endpoint webhook será:
```
https://ai-agent-ui.vercel.app/api/webhook/casos
```

### 4️⃣ Configurar n8n (Railway)

**En tu workflow de n8n:**

1. **Nodo Code** → Estructura datos:
```javascript
const incidentData = {
  ticket_number: `CO-${Math.floor(Math.random() * 9000) + 1000}`,
  cx_agent: "Alejandra",
  priority: "Alto",
  customer_name: "Juan Pérez",
  customer_email: "juan@example.com",
  country: "COL",
  report_description: "Cliente no puede acceder a su cuenta",
  status: "En progreso",
  channel: "WhatsApp"
};

return [{ json: incidentData }];
```

2. **Nodo HTTP Request**:
   - Method: `POST`
   - URL: `https://TU_PROYECTO.vercel.app/api/webhook/casos`
   - Headers:
     - Key: `Content-Type`
     - Value: `application/json`
   - Body: JSON (del nodo anterior)

### 5️⃣ Probar

Ejecuta el workflow en n8n y verifica que funcione.

## 🧪 Test Manual con curl

```bash
curl -X POST https://TU_PROYECTO.vercel.app/api/webhook/casos \
  -H "Content-Type: application/json" \
  -d '{
    "ticket_number": "CO-01420",
    "cx_agent": "Alejandra",
    "priority": "Alto",
    "customer_name": "Test",
    "customer_email": "test@example.com",
    "country": "COL",
    "report_description": "Test webhook",
    "status": "En progreso",
    "channel": "WhatsApp"
  }'
```

Respuesta esperada:
```json
{
  "success": true,
  "message": "Incidente creado exitosamente",
  "incident": {
    "id": 1234567890,
    "ticket_number": "CO-01420",
    ...
  }
}
```

## 📊 Estructura del Proyecto

```
ai-agent-ui/
├── api/
│   └── webhook/
│       └── casos.js          # ✅ Endpoint webhook para Vercel
├── vercel.json               # ✅ Configuración de Vercel
├── server.js                 # Solo para desarrollo local
└── src/                      # Código React
```

## ⚙️ Variables de Entorno (Opcional)

Si en el futuro necesitas conectar a una base de datos:

1. En Vercel → Settings → Environment Variables
2. Agrega las variables necesarias
3. Serán accesibles en el endpoint con `process.env.VARIABLE_NAME`

## 🔄 Actualizar Despliegue

Cada vez que hagas `git push`:
- Vercel detectará los cambios automáticamente
- Desplegará la nueva versión
- La misma URL seguirá funcionando

## ✅ Listo!

Tu webhook estará disponible en producción y n8n podrá enviar datos sin problemas.

