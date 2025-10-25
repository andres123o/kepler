// Servidor API simple para recibir webhooks desde n8n
import fs from 'fs';
import http from 'http';

const PORT = 3001;

const server = http.createServer((req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Manejar preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Endpoint POST para recibir incidentes
    if (req.method === 'POST' && req.url === '/api/webhook/casos') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const payload = JSON.parse(body);
                
                console.log('📥 Webhook recibido:', payload);
                
                // Leer incidentes existentes del archivo (simulando base de datos)
                let incidents = [];
                if (fs.existsSync('incidents.json')) {
                    incidents = JSON.parse(fs.readFileSync('incidents.json', 'utf8'));
                }
                
                // Crear nuevo incidente
                const newIncident = {
                    id: incidents.length + 1,
                    ticket_number: payload.ticket_number,
                    cx_agent: payload.cx_agent || 'Alejandra',
                    priority: payload.priority || 'Medio',
                    customer_name: payload.customer_name,
                    customer_email: payload.customer_email,
                    country: payload.country || 'COL',
                    report_description: payload.report_description,
                    status: payload.status || 'En progreso',
                    channel: payload.channel || 'WhatsApp',
                    createdAt: new Date().toISOString()
                };
                
                // Agregar a la lista
                incidents.push(newIncident);
                
                // Guardar en archivo
                fs.writeFileSync('incidents.json', JSON.stringify(incidents, null, 2));
                
                console.log('✅ Incidente guardado:', newIncident);
                
                // Respuesta exitosa
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: true, 
                    message: 'Incidente creado exitosamente',
                    incident: newIncident 
                }));
                
            } catch (error) {
                console.error('❌ Error:', error);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: false, 
                    message: error.message 
                }));
            }
        });
    } 
    // Endpoint GET para obtener todos los incidentes
    else if (req.method === 'GET' && req.url === '/api/incidents') {
        try {
            if (fs.existsSync('incidents.json')) {
                const incidents = JSON.parse(fs.readFileSync('incidents.json', 'utf8'));
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, incidents }));
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, incidents: [] }));
            }
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: error.message }));
        }
    }
    // Endpoint no encontrado
    else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Endpoint no encontrado' }));
    }
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor API corriendo en http://0.0.0.0:${PORT}`);
    console.log(`📝 Endpoint POST: http://0.0.0.0:${PORT}/api/webhook/casos`);
    console.log(`📝 Endpoint GET: http://0.0.0.0:${PORT}/api/incidents`);
    console.log(`\n⚠️  N8N EN RAILWAY: Usa ngrok para exponer el servidor:`);
    console.log(`📥 ngrok http 3001`);
    console.log(`\n🔗 Luego usa la URL de ngrok en n8n`);
});

