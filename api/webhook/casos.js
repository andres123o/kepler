// Endpoint para Vercel Serverless Functions
// IMPORTANTE: Vercel detecta automáticamente el handler
module.exports = async (req, res) => {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Solo aceptar POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const payload = req.body;
    
    console.log('📥 Webhook recibido desde n8n:', payload);
    
    // Aquí guardarías en tu base de datos real
    // Por ahora solo respondemos con éxito simulando la creación
    
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
      createdAt: new Date().toISOString()
    };
    
    console.log('✅ Incidente creado:', newIncident);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Incidente creado exitosamente',
      incident: newIncident 
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    return res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
}
