/**
 * Agente Orquestador Kepler
 * 
 * Versión SIMPLE:
 * 1. Construir prompt (system + user con contextos y datos)
 * 2. Llamar a OpenAI
 * 3. Parsear respuesta
 * 4. Retornar insight
 */

import { KeplerAgentInput, KeplerAgentOutput } from './types';
import { buildContext } from './context-builder';
import { buildPrompt } from './prompt-builder';
import OpenAI from 'openai';

/**
 * Función principal del agente
 */
export async function runKeplerAgent(
  input: KeplerAgentInput
): Promise<KeplerAgentOutput> {
  
  const startTime = Date.now();
  
  try {
    // Validar que haya datos
    const hasData = 
      (input.data.tickets && input.data.tickets.length > 0) ||
      (input.data.nps && input.data.nps.length > 0) ||
      (input.data.csat && input.data.csat.length > 0) ||
      (input.data.playstore && input.data.playstore.length > 0) ||
      (input.data.instagram && input.data.instagram.length > 0) ||
      (input.data.linkedin && input.data.linkedin.length > 0);
    
    if (!hasData) {
      return {
        success: false,
        error: "No hay datos disponibles para analizar.",
      };
    }
    
    // Construir contexto y prompt
    const context = buildContext(input);
    const prompt = buildPrompt(input, context);
    
    // Llamar a OpenAI (usando import estático para Next.js)
    const apiKey = process.env.API_OPENAI || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('API_OPENAI o OPENAI_API_KEY no está configurado');
    }
    
    const client = new OpenAI({ apiKey });
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    
    console.log(`🤖 Llamando a OpenAI (${model})...`);
    console.log(`📝 System prompt length: ${prompt.system.length} caracteres`);
    console.log(`📝 User prompt length: ${prompt.user.length} caracteres`);
    
    const response = await client.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: prompt.system },
        { role: "user", content: prompt.user },
      ],
      temperature: 0.4,
      max_tokens: 2000,
    });
    
    const rawOutput = response.choices[0]?.message?.content || "";
    
    if (!rawOutput) {
      console.error('❌ OpenAI no devolvió contenido');
      return {
        success: false,
        error: "El agente no generó una respuesta.",
      };
    }
    
    console.log('✅ Respuesta recibida de OpenAI');
    console.log(`📄 Output length: ${rawOutput.length} caracteres`);
    console.log(`📊 Tokens usados: ${response.usage?.total_tokens || 'N/A'} (prompt: ${response.usage?.prompt_tokens || 'N/A'}, completion: ${response.usage?.completion_tokens || 'N/A'})`);
    
    // Parsear respuesta
    console.log('🔍 Parseando respuesta de Markdown...');
    const insight = parseInsightFromMarkdown(rawOutput);
    console.log('✅ Respuesta parseada exitosamente');
    console.log(`📋 Insight generado: "${insight.title}"`);
    
    // Retornar resultado
    const processingTime = Date.now() - startTime;
    const totalItems = 
      (input.data.tickets?.length || 0) +
      (input.data.nps?.length || 0) +
      (input.data.csat?.length || 0) +
      (input.data.playstore?.length || 0) +
      (input.data.instagram?.reduce((sum, p) => sum + p.latestComments.length, 0) || 0) +
      (input.data.linkedin?.reduce((sum, p) => sum + p.latestComments.length, 0) || 0);
    
    return {
      success: true,
      insight,
      rawOutput,
      metadata: {
        processingTime,
        modelUsed: response.model,
        clustersDetected: 0,
        itemsAnalyzed: totalItems,
        tokensUsed: {
          prompt: response.usage?.prompt_tokens || 0,
          completion: response.usage?.completion_tokens || 0,
          total: response.usage?.total_tokens || 0,
        },
      },
    };
    
  } catch (error: any) {
    console.error("❌ Error en agente Kepler:", error);
    return {
      success: false,
      error: error.message || "Error desconocido",
    };
  }
}

/**
 * Parsea el output de Markdown a estructura de insight
 * Versión mejorada con mejor manejo de errores y logging
 */
function parseInsightFromMarkdown(markdown: string): any {
  try {
    // Título: buscar con o sin "**" al inicio/final
    const titleMatch = markdown.match(/(?:\*\*)?🎯\s*Foco del Día\s*\(P0\):\s*(.+?)(?:\*\*|$)/i);
    const title = titleMatch ? titleMatch[1].trim() : "Análisis de voz del cliente";
    
    // Acciones: buscar en sección "Acción Sugerida" o directamente
    let actionMatches = markdown.match(/\*\*\[(UX\/UI|Backend|Ops\/Process)[^\]]*\]\*\*:\s*(.+?)(?=\n\*\*|$)/gi);
    if (!actionMatches || actionMatches.length === 0) {
      // Intentar con formato alternativo (con guiones o asteriscos)
      actionMatches = markdown.match(/(?:[-*]|\*\*)\s*\[(UX\/UI|Backend|Ops\/Process)[^\]]*\]\s*:\s*(.+?)(?=\n|$)/gi);
    }
    
    const actions = actionMatches?.map(match => {
      const typeMatch = match.match(/\[(UX\/UI|Backend|Ops\/Process)/i);
      const descMatch = match.match(/(?:\[[^\]]*\]\s*:?\s*|-|\*)\s*(.+?)(?=\n|$)/);
      const type = typeMatch && typeMatch[1] ? typeMatch[1] : "UX/UI";
      // Normalizar el tipo para que coincida con el enum
      let normalizedType: "UX/UI" | "Backend" | "Ops/Process" = "UX/UI";
      if (type.toLowerCase().includes("backend")) normalizedType = "Backend";
      else if (type.toLowerCase().includes("ops") || type.toLowerCase().includes("process")) normalizedType = "Ops/Process";
      
      const description = descMatch && descMatch[1] 
        ? descMatch[1].trim() 
        : match.replace(/^[-*\s]*\[[^\]]*\]\s*:?\s*/, '').trim();
      
      return {
        type: normalizedType,
        description: description || "",
      };
    }).filter(a => a.description && a.description.length > 0) || [];
    
    // Dueño: buscar con diferentes formatos
    let ownerMatch = markdown.match(/\*\*Dueño:\*\*\s*`(.+?)`\s*\(@(.+?)\)/i);
    if (!ownerMatch) {
      ownerMatch = markdown.match(/\*\*Dueño:\*\*\s*(.+?)\s*\(@(.+?)\)/i);
    }
    if (!ownerMatch) {
      ownerMatch = markdown.match(/Dueño[:\s]+(.+?)\s*\(@(.+?)\)/i);
    }
    
    const owner = ownerMatch ? {
      squad: ownerMatch[1].replace(/`/g, '').trim(),
      responsible: ownerMatch[2].trim(),
    } : {
      squad: "Equipo de Producto",
      responsible: "producto",
    };
    
    // Impacto y Violación: buscar en sección "Análisis DELTA" o directamente
    let impactMatch = markdown.match(/\*\*Impacto:\*\*\s*(.+?)(?=\n|$)/i);
    if (!impactMatch) {
      impactMatch = markdown.match(/Impacto[:\s]+\*\*(.+?)\*\*/i);
    }
    
    let violationMatch = markdown.match(/\*\*Violación:\*\*\s*(.+?)(?=\n|$)/i);
    if (!violationMatch) {
      violationMatch = markdown.match(/Violación[:\s]+\*\*(.+?)\*\*/i);
    }
    
    // Evidencia: buscar tickets
    const evidenceMatch = markdown.match(/\*\*Tickets?\s*(?:\(Muestra\))?:\*\*\s*(.+?)(?=\n\*\*|$)/i);
    const ticketIds: string[] = [];
    if (evidenceMatch) {
      // Buscar formatos como "CO-01195, CO-01198" o "TICKET-1, TICKET-2" o números simples
      const ticketMatches = evidenceMatch[1].match(/([A-Z]+-\d+|\d+)/g);
      if (ticketMatches) {
        ticketIds.push(...ticketMatches);
      }
    }
    
    // Otros hallazgos
    const otherFindingsMatch = markdown.match(/\*\*📉\s*Otros\s*hallazgos[^\n]*\n([\s\S]+?)(?=\n\n|$)/i);
    const otherFindings = otherFindingsMatch
      ? otherFindingsMatch[1]
          .split('\n')
          .filter(line => line.trim().startsWith('*') || line.trim().startsWith('-'))
          .map(line => {
            const match = line.match(/(?:[-*]|\*)\s*.*?\((P[23])\s*-\s*(\d+)/i);
            if (match) {
              const title = line.replace(/(?:[-*]|\*)\s*/, '').replace(/\s*\(P[23]\s*-\s*\d+.*?\)/, '').trim();
              return {
                title: title || "Hallazgo adicional",
                priority: match[1] as "P2" | "P3",
                count: parseInt(match[2]),
              };
            }
            return null;
          })
          .filter((item): item is { title: string; priority: "P2" | "P3"; count: number } => item !== null)
      : [];
    
    const result = {
      title: `🎯 Foco del Día (P0): ${title}`,
      actions,
      owner,
      deltaAnalysis: {
        impact: impactMatch ? impactMatch[1].trim() : "Impacto significativo en la experiencia del usuario",
        violation: violationMatch ? violationMatch[1].trim() : "Patrón detectado en múltiples fuentes",
      },
      evidence: {
        tickets: ticketIds.length > 0 ? ticketIds : undefined,
        count: ticketIds.length || undefined,
      },
      otherFindings: otherFindings.length > 0 ? otherFindings : undefined,
    };
    
    // Validación básica
    if (!result.title || result.title.length < 10) {
      console.warn('⚠️ Título parseado parece inválido');
    }
    if (result.actions.length === 0) {
      console.warn('⚠️ No se encontraron acciones en el output');
    }
    
    return result;
  } catch (error: any) {
    console.error('❌ Error parseando Markdown:', error);
    console.error('📄 Markdown recibido (primeros 500 caracteres):', markdown.substring(0, 500));
    // Retornar un insight por defecto para no romper el flujo
    return {
      title: "🎯 Foco del Día (P0): Análisis de voz del cliente",
      actions: [{ type: "UX/UI" as const, description: "Revisar feedback de clientes" }],
      owner: { squad: "Equipo de Producto", responsible: "producto" },
      deltaAnalysis: {
        impact: "Error al parsear la respuesta del agente",
        violation: "Formato de respuesta no reconocido",
      },
      evidence: {},
    };
  }
}
