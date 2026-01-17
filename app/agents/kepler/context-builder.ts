/**
 * Constructor de Contexto para el Agente Kepler
 * 
 * Consolida los contextos de negocio y equipo desde la BD
 * para enviarlos al agente de OpenAI
 */

import { KeplerAgentInput, BusinessContext, TeamContext } from './types';

export interface BuiltContext {
  businessContext: string; // Contexto de negocio consolidado
  teamContext: string; // Información del equipo
  dataSummary: string; // Resumen estadístico de datos recopilados
}

/**
 * Construye el contexto completo para el análisis
 */
export function buildContext(input: KeplerAgentInput): BuiltContext {
  
  // 1. Consolidar contexto de negocio
  const businessContext = consolidateBusinessContext(input.businessContexts);
  
  // 2. Consolidar contexto del equipo
  const teamContext = consolidateTeamContext(input.teamContexts || []);
  
  // 3. Resumir datos recopilados
  const dataSummary = summarizeCollectedData(input.data);
  
  return {
    businessContext,
    teamContext,
    dataSummary,
  };
}

/**
 * Consolida todos los contextos de negocio en un solo texto
 */
function consolidateBusinessContext(contexts: BusinessContext[]): string {
  if (!contexts || contexts.length === 0) {
    return "No hay contexto de negocio configurado.";
  }
  
  return contexts
    .map((ctx) => `**${ctx.name}:**\n${ctx.content}`)
    .join('\n\n');
}

/**
 * Consolida el contexto del equipo
 */
function consolidateTeamContext(teamContexts: TeamContext[]): string {
  if (!teamContexts || teamContexts.length === 0) {
    return "No hay información de equipo configurada. El agente deberá inferir los responsables según la naturaleza del problema.";
  }
  
  return teamContexts
    .map((member) => {
      const name = member.name || member.email || 'Miembro del equipo';
      const expertise = member.expertise || 'Experto';
      const responsible = member.responsible_for || 'Responsabilidades generales';
      return `**${name}**\n- Especialidad: ${expertise}\n- Responsable de: ${responsible}`;
    })
    .join('\n\n');
}

/**
 * Resume los datos recopilados de todas las fuentes
 */
function summarizeCollectedData(data: KeplerAgentInput['data']): string {
  const summaries: string[] = [];
  
  if (data.nps && data.nps.length > 0) {
    const avgScore = data.nps.reduce((sum, n) => sum + n.score, 0) / data.nps.length;
    summaries.push(`**NPS:** ${data.nps.length} respuestas (Promedio: ${avgScore.toFixed(1)}/10)`);
  }
  
  if (data.csat && data.csat.length > 0) {
    const avgScore = data.csat.reduce((sum, c) => sum + c.score, 0) / data.csat.length;
    summaries.push(`**CSAT:** ${data.csat.length} respuestas (Promedio: ${avgScore.toFixed(1)}/5)`);
  }
  
  if (data.tickets && data.tickets.length > 0) {
    summaries.push(`**Tickets:** ${data.tickets.length} tickets`);
  }
  
  if (data.instagram && data.instagram.length > 0) {
    const totalComments = data.instagram.reduce((sum, p) => sum + p.latestComments.length, 0);
    summaries.push(`**Instagram:** ${data.instagram.length} posts, ${totalComments} comentarios`);
  }
  
  if (data.linkedin && data.linkedin.length > 0) {
    const totalComments = data.linkedin.reduce((sum, p) => sum + p.latestComments.length, 0);
    summaries.push(`**LinkedIn:** ${data.linkedin.length} posts, ${totalComments} comentarios`);
  }
  
  if (data.playstore && data.playstore.length > 0) {
    const avgRating = data.playstore.reduce((sum, r) => sum + r.rating, 0) / data.playstore.length;
    summaries.push(`**Play Store:** ${data.playstore.length} reseñas (Promedio: ${avgRating.toFixed(1)}/5)`);
  }
  
  return summaries.length > 0 
    ? summaries.join('\n') 
    : 'No hay datos recopilados.';
}
