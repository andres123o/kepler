/**
 * Punto de entrada principal del Agente Orquestador Kepler
 * 
 * Exporta la función principal y tipos necesarios
 */

export { runKeplerAgent } from './agent';
export type {
  KeplerAgentInput,
  KeplerAgentOutput,
  ActionableInsight,
  BusinessContext,
  TeamContext,
  NPSSurvey,
  CSATSurvey,
  Ticket,
  InstagramPost,
  LinkedInPost,
  PlayStoreReview,
} from './types';

// Re-exportar para facilitar imports
export { KEPLER_SYSTEM_PROMPT } from './system-prompt';

