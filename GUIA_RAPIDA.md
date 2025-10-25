# ⚡ Guía Rápida - Despliegue en 3 Pasos

## ✅ Lo que está listo

- ✅ Endpoint webhook: `api/webhook/casos.js`
- ✅ Configuración Vercel: `vercel.json`
- ✅ CORS configurado
- ✅ Manejo de errores
- ✅ Respuestas JSON

## 🚀 3 Pasos para Deploy

### 1️⃣ Sube a GitHub
```bash
git add .
git commit -m "feat: webhook endpoint ready for Vercel"
git push
```

### 2️⃣ Despliega en Vercel
1. Ve a https://vercel.com
2. Importa tu repo de GitHub
3. Click "Deploy"
4. Copia la URL: `https://TU_PROYECTO.vercel.app`

### 3️⃣ Configura n8n
URL en el nodo HTTP Request:
```
https://TU_PROYECTO.vercel.app/api/webhook/casos
```

## 📝 Estructura JSON para n8n

```json
{
  "ticket_number": "CO-01420",
  "cx_agent": "Alejandra",
  "priority": "Alto",
  "customer_name": "Juan Pérez",
  "customer_email": "juan@example.com",
  "country": "COL",
  "report_description": "Problema con login",
  "status": "En progreso",
  "channel": "WhatsApp"
}
```

## 🧪 Test Rápido

```bash
curl -X POST https://TU_PROYECTO.vercel.app/api/webhook/casos \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

## ✅ Listo!

Eso es todo. Tu webhook funcionará en producción.

