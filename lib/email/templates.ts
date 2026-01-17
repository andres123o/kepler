/**
 * Templates HTML para emails - Preview/Teaser
 * Diseñado para generar curiosidad y obligar a ir a la plataforma
 */

export interface SourceCounts {
  instagram?: number;
  linkedin?: number;
  playstore?: number;
  nps?: number;
  csat?: number;
  tickets?: number;
}

export interface InsightEmailData {
  title: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  generatedAt: string;
  detailedAnalysis: string;
  organizationName: string;
  sourceCounts?: SourceCounts;
}

/**
 * Extrae un resumen corto del análisis para el preview
 */
function extractPreviewSummary(markdown: string, maxLength: number = 120): string {
  // Buscar el primer párrafo después de "Análisis del Problema"
  const analysisMatch = markdown.match(/Análisis del Problema[:\s]*\n+([^#\n][^\n]+)/i);
  if (analysisMatch && analysisMatch[1]) {
    const text = analysisMatch[1].replace(/\*\*/g, '').replace(/[#*_`]/g, '').trim();
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }
  
  // Si no encuentra, buscar cualquier párrafo sustancial
  const paragraphs = markdown.split('\n').filter(line => {
    const clean = line.replace(/[#*_`\-→]/g, '').trim();
    return clean.length > 50 && !clean.startsWith('📊') && !clean.startsWith('🎯');
  });
  
  if (paragraphs.length > 0) {
    const text = paragraphs[0].replace(/\*\*/g, '').replace(/[#*_`]/g, '').trim();
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }
  
  return 'Se detectó un patrón crítico que requiere tu atención inmediata.';
}

/**
 * Calcula el total de datos analizados usando los sourceCounts REALES
 */
function calculateTotalDataCount(sourceCounts?: SourceCounts): string {
  if (!sourceCounts) {
    return 'Múltiples fuentes de datos analizadas para detectar este patrón.';
  }
  
  const total = 
    (sourceCounts.tickets || 0) +
    (sourceCounts.nps || 0) +
    (sourceCounts.csat || 0) +
    (sourceCounts.instagram || 0) +
    (sourceCounts.linkedin || 0) +
    (sourceCounts.playstore || 0);
  
  if (total === 0) {
    return 'Múltiples fuentes de datos analizadas para detectar este patrón.';
  }
  
  // Contar cuántas fuentes tienen datos
  const activeSources: string[] = [];
  if (sourceCounts.tickets && sourceCounts.tickets > 0) activeSources.push('tickets');
  if (sourceCounts.nps && sourceCounts.nps > 0) activeSources.push('NPS');
  if (sourceCounts.csat && sourceCounts.csat > 0) activeSources.push('CSAT');
  if (sourceCounts.instagram && sourceCounts.instagram > 0) activeSources.push('Instagram');
  if (sourceCounts.linkedin && sourceCounts.linkedin > 0) activeSources.push('LinkedIn');
  if (sourceCounts.playstore && sourceCounts.playstore > 0) activeSources.push('Play Store');
  
  const sourceText = activeSources.length > 1 
    ? `${activeSources.length} fuentes` 
    : activeSources[0] || 'múltiples fuentes';
  
  return `Analizamos ${total.toLocaleString('es-ES')} datos de ${sourceText} para detectar este patrón.`;
}

/**
 * Genera el HTML del email - VERSION TEASER/PREVIEW
 * Fondo blanco, pequeño, impactante, genera curiosidad
 */
export function generateInsightEmail(data: InsightEmailData): string {
  const priorityConfig = {
    critical: { 
      label: '🚨 CRÍTICO',
      urgency: 'Requiere acción inmediata',
      gradient: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)'
    },
    high: { 
      label: '⚠️ ALTO',
      urgency: 'Atención prioritaria',
      gradient: 'linear-gradient(135deg, #EA580C 0%, #9A3412 100%)'
    },
    medium: { 
      label: '📋 MEDIO',
      urgency: 'Revisar esta semana',
      gradient: 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)'
    },
    low: { 
      label: '📝 BAJO',
      urgency: 'Para tu información',
      gradient: 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)'
    },
  };

  const priority = priorityConfig[data.priority];
  const previewSummary = extractPreviewSummary(data.detailedAnalysis);
  const totalDataInfo = calculateTotalDataCount(data.sourceCounts);
  const dashboardUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nuevo hallazgo detectado - ${data.organizationName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        
        <!-- Container principal -->
        <table role="presentation" width="480" cellspacing="0" cellpadding="0" border="0" style="max-width: 480px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);">
          
          <!-- Badge de prioridad arriba -->
          <tr>
            <td align="center" style="padding: 28px 24px 0 24px;">
              <span style="display: inline-block; padding: 10px 20px; background: ${priority.gradient}; color: #ffffff; border-radius: 24px; font-size: 13px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">
                ${priority.label}
              </span>
            </td>
          </tr>

          <!-- Título principal -->
          <tr>
            <td style="padding: 20px 32px 8px 32px; text-align: center;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 700; color: #171717; line-height: 1.2; letter-spacing: -0.02em;">
                ${data.title}
              </h1>
            </td>
          </tr>

          <!-- Subtítulo de urgencia -->
          <tr>
            <td style="padding: 0 32px 24px 32px; text-align: center;">
              <p style="margin: 0; font-size: 14px; color: #737373; font-weight: 500;">
                ${priority.urgency}
              </p>
            </td>
          </tr>

          <!-- Línea divisoria con gradiente -->
          <tr>
            <td style="padding: 0 32px;">
              <div style="height: 2px; background: linear-gradient(90deg, transparent, #8A2BE2, #C2185B, transparent); border-radius: 1px;"></div>
            </td>
          </tr>

          <!-- Preview del contenido -->
          <tr>
            <td style="padding: 24px 32px;">
              <p style="margin: 0 0 16px 0; font-size: 15px; color: #525252; line-height: 1.6; text-align: center;">
                ${previewSummary}
              </p>
              <p style="margin: 0; font-size: 13px; color: #a3a3a3; text-align: center; font-style: italic;">
                ${totalDataInfo}
              </p>
            </td>
          </tr>

          <!-- Caja de "qué hay dentro" -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #fafafa; border-radius: 12px; border: 1px solid #e5e5e5;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="margin: 0 0 12px 0; font-size: 11px; color: #737373; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                      En el reporte completo:
                    </p>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding: 4px 0;">
                          <span style="color: #10B981; font-size: 14px;">✓</span>
                          <span style="margin-left: 8px; color: #525252; font-size: 13px;">Análisis completo del problema</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0;">
                          <span style="color: #10B981; font-size: 14px;">✓</span>
                          <span style="margin-left: 8px; color: #525252; font-size: 13px;">Plan de acción específico</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0;">
                          <span style="color: #10B981; font-size: 14px;">✓</span>
                          <span style="margin-left: 8px; color: #525252; font-size: 13px;">Dueño y responsables asignados</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0;">
                          <span style="color: #10B981; font-size: 14px;">✓</span>
                          <span style="margin-left: 8px; color: #525252; font-size: 13px;">Evidencia y tickets relacionados</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button grande -->
          <tr>
            <td style="padding: 0 32px 32px 32px; text-align: center;">
              <a href="${dashboardUrl}/dashboard" 
                 style="display: block; padding: 18px 32px; background: linear-gradient(135deg, #8A2BE2 0%, #C2185B 100%); color: #ffffff; text-decoration: none; border-radius: 14px; font-weight: 700; font-size: 16px; letter-spacing: 0.3px; box-shadow: 0 8px 24px rgba(138, 43, 226, 0.3);">
                Ver Reporte Completo →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #fafafa; border-top: 1px solid #e5e5e5;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0 0 4px 0; font-size: 12px; color: #737373;">
                      Generado por Kepler AI para <strong style="color: #525252;">${data.organizationName}</strong>
                    </p>
                    <p style="margin: 0; font-size: 11px; color: #a3a3a3;">
                      ${data.generatedAt}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

        <!-- Mensaje fuera del card -->
        <p style="margin: 24px 0 0 0; font-size: 11px; color: #737373; text-align: center;">
          ¿No puedes ver el botón? Copia este enlace: ${dashboardUrl}/dashboard
        </p>

      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Texto plano del email (fallback) - VERSION TEASER
 */
export function generateInsightEmailText(data: InsightEmailData): string {
  const priorityLabels = {
    critical: '🚨 CRÍTICO - Requiere acción inmediata',
    high: '⚠️ ALTO - Atención prioritaria',
    medium: '📋 MEDIO - Revisar esta semana',
    low: '📝 BAJO - Para tu información',
  };

  const previewSummary = extractPreviewSummary(data.detailedAnalysis);
  const totalDataInfo = calculateTotalDataCount(data.sourceCounts);
  const dashboardUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${priorityLabels[data.priority]}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${data.title.toUpperCase()}

${previewSummary}

${totalDataInfo}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

En el reporte completo encontrarás:
✓ Análisis completo del problema
✓ Plan de acción específico
✓ Dueño y responsables asignados
✓ Evidencia y tickets relacionados

👉 VER REPORTE COMPLETO:
${dashboardUrl}/dashboard

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generado por Kepler AI para ${data.organizationName}
${data.generatedAt}
  `.trim();
}
