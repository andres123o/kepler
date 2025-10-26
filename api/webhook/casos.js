// Endpoint para Vercel Serverless Functions
export default function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Solo aceptar POST
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }

  try {
    const payload = req.body;
    
    console.log('📥 Webhook recibido desde n8n:', payload);
    
    // Crear nuevo incidente
    const newIncident = {
      id: Date.now(),
      ticket_number: payload.ticket_number || `CO-${Math.floor(Math.random() * 9000) + 1000}`,
      cx_agent: payload.cx_agent || 'Alejandra',
      priority: payload.priority || 'Medio',
      customer_name: payload.customer_name || 'Cliente',
      customer_email: payload.customer_email || 'cliente@example.com',
      country: payload.country || 'COL',
      report_description: payload.report_description || 'Descripción',
      status: payload.status || 'En progreso',
      channel: payload.channel || 'WhatsApp',
      incident_type: payload.incident_type || 'Falla in-app',
      createdAt: new Date().toISOString()
    };
    
    console.log('✅ Incidente creado:', newIncident);
    
    // Respuesta exitosa
    res.status(200).json({ 
      success: true, 
      message: 'Incidente creado exitosamente',
      incident: newIncident 
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
}
