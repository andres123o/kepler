/**
 * Constructor de Prompts para el Agente Kepler
 * 
 * Construye el prompt completo que se enviará a OpenAI
 * combinando el system prompt con el contexto y los datos
 */

import { KeplerAgentInput } from './types';
import { BuiltContext } from './context-builder';
import { KEPLER_SYSTEM_PROMPT } from './system-prompt';

export interface BuiltPrompt {
  system: string;
  user: string;
}

/**
 * Construye el prompt completo para OpenAI
 */
export function buildPrompt(
  input: KeplerAgentInput,
  context: BuiltContext
): BuiltPrompt {
  
  const userPrompt = buildUserPrompt(input, context);
  
  return {
    system: KEPLER_SYSTEM_PROMPT,
    user: userPrompt,
  };
}

/**
 * Construye el prompt del usuario con todos los datos y contextos
 */
function buildUserPrompt(
  input: KeplerAgentInput,
  context: BuiltContext
): string {
  
  const dataSection = buildDetailedDataSection(input.data);
  
  return `# Análisis de Voz de Cliente - ${new Date().toLocaleDateString('es-ES')}

## Contexto de Negocio

${context.businessContext}

## Equipo y Responsables

${context.teamContext}

## Resumen de Datos Recopilados

${context.dataSummary}

## Datos Detallados para Análisis

${dataSection}

---

**INSTRUCCIONES:**

1. Analiza todos los datos proporcionados semánticamente (no uses keywords, analiza el significado completo)
2. Identifica el patrón P0 absoluto (más volumen × más riesgo de negocio)
3. Usa los contextos de negocio y equipo proporcionados para el Análisis DELTA
4. Selecciona automáticamente qué contextos son relevantes según el patrón detectado (el system prompt te indica cómo)
5. Genera el reporte en el formato estricto especificado en el system prompt

**Formato esperado:** Markdown con la estructura exacta del system prompt.`;
}

/**
 * Construye la sección de datos detallados
 * Limita la cantidad para no exceder tokens
 */
function buildDetailedDataSection(data: KeplerAgentInput['data']): string {
  const sections: string[] = [];
  
  // Tickets (máximo 30 para análisis robusto)
  if (data.tickets && data.tickets.length > 0) {
    const ticketsToShow = data.tickets.slice(0, 30);
    const ticketsText = ticketsToShow
      .map((t, idx) => {
        const ticketNum = t.ticket_number || `TICKET-${idx + 1}`;
        return `**Ticket ${ticketNum}:**\n**Asunto:** ${t.subject}\n**Descripción:** ${t.description}\n**Estado:** ${t.status}${t.priority ? ` | **Prioridad:** ${t.priority}` : ''}`;
      })
      .join('\n\n---\n\n');
    sections.push(`### Tickets (${data.tickets.length} total, mostrando ${ticketsToShow.length} más relevantes)\n\n${ticketsText}`);
  }
  
  // NPS (máximo 20 con comentarios)
  if (data.nps && data.nps.length > 0) {
    const npsWithComments = data.nps.filter(n => n.comment && n.comment.trim().length > 0);
    const npsToShow = npsWithComments.slice(0, 20);
    if (npsToShow.length > 0) {
      const npsText = npsToShow
        .map((n) => `**Score: ${n.score}/10**\n**Comentario:** ${n.comment}`)
        .join('\n\n---\n\n');
      sections.push(`### NPS (${data.nps.length} respuestas, ${npsWithComments.length} con comentarios)\n\n${npsText}`);
    }
  }
  
  // CSAT (máximo 20 con comentarios)
  if (data.csat && data.csat.length > 0) {
    const csatWithComments = data.csat.filter(c => c.comment && c.comment.trim().length > 0);
    const csatToShow = csatWithComments.slice(0, 20);
    if (csatToShow.length > 0) {
      const csatText = csatToShow
        .map((c) => `**Score: ${c.score}/5**\n**Comentario:** ${c.comment}`)
        .join('\n\n---\n\n');
      sections.push(`### CSAT (${data.csat.length} respuestas, ${csatWithComments.length} con comentarios)\n\n${csatText}`);
    }
  }
  
  // Play Store Reviews (máximo 20, priorizando bajas)
  if (data.playstore && data.playstore.length > 0) {
    // Ordenar por rating (más bajos primero) y luego tomar los primeros
    const sortedReviews = [...data.playstore].sort((a, b) => a.rating - b.rating);
    const reviewsToShow = sortedReviews.slice(0, 20);
    const reviewsText = reviewsToShow
      .map((r) => `**Rating: ${r.rating}/5** - ${r.userName}\n**Reseña:** ${r.reviewText}`)
      .join('\n\n---\n\n');
    sections.push(`### Play Store Reviews (${data.playstore.length} reseñas, mostrando las más relevantes)\n\n${reviewsText}`);
  }
  
  // Instagram (máximo 10 posts con comentarios más relevantes)
  if (data.instagram && data.instagram.length > 0) {
    const instagramToShow = data.instagram.slice(0, 10);
    const instagramText = instagramToShow
      .map((p) => {
        const comments = p.latestComments
          .slice(0, 5) // Máximo 5 comentarios por post
          .map(c => `- ${c.text}`)
          .join('\n');
        return `**Post:** ${p.caption}\n**Comentarios (${p.latestComments.length} total, mostrando 5):**\n${comments || 'Sin comentarios'}`;
      })
      .join('\n\n---\n\n');
    sections.push(`### Instagram (${data.instagram.length} posts, mostrando ${instagramToShow.length})\n\n${instagramText}`);
  }
  
  // LinkedIn (máximo 10 posts con comentarios más relevantes)
  if (data.linkedin && data.linkedin.length > 0) {
    const linkedinToShow = data.linkedin.slice(0, 10);
    const linkedinText = linkedinToShow
      .map((p) => {
        const comments = p.latestComments
          .slice(0, 5) // Máximo 5 comentarios por post
          .map(c => `- ${c.text}`)
          .join('\n');
        return `**Post:** ${p.text}\n**Comentarios (${p.latestComments.length} total, mostrando 5):**\n${comments || 'Sin comentarios'}`;
      })
      .join('\n\n---\n\n');
    sections.push(`### LinkedIn (${data.linkedin.length} posts, mostrando ${linkedinToShow.length})\n\n${linkedinText}`);
  }
  
  return sections.length > 0 
    ? sections.join('\n\n---\n\n')
    : 'No hay datos detallados para mostrar.';
}
