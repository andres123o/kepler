/**
 * Guardar Insight en Base de Datos
 * 
 * Mapea el resultado del agente Kepler a la tabla insights
 */

'use server'

import { createClient } from '@/lib/supabase/server';
import { KeplerAgentOutput } from '@/app/agents/kepler';

/**
 * Estructura de datos crudos por fuente
 * - Instagram, LinkedIn, Play Store: estructura fija (vienen de scrapers)
 * - NPS, CSAT, Tickets: estructura dinámica (vienen de archivos CSV del usuario)
 */
export interface RawSourceData {
  // Scrapers - estructura fija
  instagram?: Array<{
    postUrl?: string;
    text: string;
    username?: string;
    timestamp?: string;
  }>;
  linkedin?: Array<{
    postUrl?: string;
    text: string;
    username?: string;
    timestamp?: string;
  }>;
  playstore?: Array<{
    id: string;
    reviewText: string;
    rating: number;
    userName: string;
    datePublished: string;
  }>;
  // Archivos - estructura DINÁMICA (cualquier columna del CSV)
  nps?: Array<Record<string, any>>;
  csat?: Array<Record<string, any>>;
  tickets?: Array<Record<string, any>>;
}

/**
 * Mapea el output del agente a la estructura de la tabla insights
 */
export async function saveInsightToDatabase(
  organizationId: string,
  agentOutput: KeplerAgentOutput,
  dataSourceIds: string[],
  sourceCounts?: {
    instagram?: number;
    linkedin?: number;
    playstore?: number;
    nps?: number;
    csat?: number;
    tickets?: number;
  },
  rawData?: RawSourceData
): Promise<string> {
  const supabase = await createClient();
  
  if (!agentOutput.success || !agentOutput.insight) {
    throw new Error('No se puede guardar un insight que no existe');
  }
  
  const insight = agentOutput.insight;
  
  // Extraer resumen del rawOutput o generar uno
  const summary = insight.actions.length > 0 
    ? insight.actions.map(a => a.description).join('. ')
    : insight.title;
  
  // Convertir recomendaciones a array
  const recommendations = insight.actions.map(a => 
    `[${a.type}] ${a.description}`
  );
  
  // Buscar asignado por nombre (si existe)
  let assignedTo: string | null = null;
  if (insight.owner.responsible && insight.owner.responsible !== 'producto') {
    // Intentar buscar por nombre en team_context
    const { data: teamMember } = await supabase
      .from('team_context')
      .select('id')
      .eq('organization_id', organizationId)
      .ilike('name', `%${insight.owner.responsible}%`)
      .maybeSingle();
    
    if (teamMember) {
      // Buscar en profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .ilike('full_name', `%${insight.owner.responsible}%`)
        .maybeSingle();
      
      if (profile) {
        assignedTo = profile.id;
      }
    }
  }
  
  // Determinar tipo de insight basado en las acciones
  let insightType = 'action_item'; // Default
  if (insight.actions.some(a => a.type === 'Backend')) {
    insightType = 'risk';
  } else if (insight.actions.some(a => a.type === 'UX/UI')) {
    insightType = 'opportunity';
  }
  
  // Determinar prioridad
  let priority = 'medium';
  if (insight.title.toLowerCase().includes('p0') || insight.title.toLowerCase().includes('crítico')) {
    priority = 'critical';
  } else if (insight.title.toLowerCase().includes('p1') || insight.title.toLowerCase().includes('alto')) {
    priority = 'high';
  } else if (insight.title.toLowerCase().includes('p2') || insight.title.toLowerCase().includes('bajo')) {
    priority = 'low';
  }
  
  // Extraer categorías del título y análisis
  const categories: string[] = [];
  const titleLower = insight.title.toLowerCase();
  if (titleLower.includes('onboarding') || titleLower.includes('registro')) {
    categories.push('onboarding');
  }
  if (titleLower.includes('bug') || titleLower.includes('error')) {
    categories.push('bug');
  }
  if (titleLower.includes('ux') || titleLower.includes('ui') || titleLower.includes('diseño')) {
    categories.push('ux');
  }
  if (titleLower.includes('suscripción') || titleLower.includes('precio')) {
    categories.push('pricing');
  }
  if (titleLower.includes('soporte') || titleLower.includes('atención')) {
    categories.push('support');
  }
  
  // Construir metadata
  const generationMetadata = {
    model: agentOutput.metadata?.modelUsed || 'gpt-4o',
    tokens: agentOutput.metadata?.tokensUsed || {},
    clustersDetected: agentOutput.metadata?.clustersDetected || 0,
    itemsAnalyzed: agentOutput.metadata?.itemsAnalyzed || 0,
    processingTime: agentOutput.metadata?.processingTime || 0,
  };
  
  // Calcular confidence score (básico)
  const confidenceScore = 0.85; // Default, se puede mejorar con lógica más sofisticada
  
  // Insertar insight
  const { data: insertedInsight, error } = await supabase
    .from('insights')
    .insert({
      organization_id: organizationId,
      data_source_ids: dataSourceIds,
      insight_type: insightType,
      categories: categories.length > 0 ? categories : null,
      title: insight.title,
      summary: summary.substring(0, 500), // Limitar tamaño
      detailed_analysis: agentOutput.rawOutput || summary,
      recommendations: recommendations.length > 0 ? recommendations : null,
      priority: priority as 'low' | 'medium' | 'high' | 'critical',
      assigned_to: assignedTo,
      status: 'new',
      confidence_score: confidenceScore,
      model_version: generationMetadata.model,
      generation_metadata: {
        ...generationMetadata,
        sourceCounts: sourceCounts || {},
        rawData: rawData || {},
      },
      affected_metrics: insight.evidence.count 
        ? { items_analyzed: insight.evidence.count }
        : null,
    })
    .select('id')
    .single();
  
  if (error) {
    console.error('Error guardando insight:', error);
    throw new Error(`Error guardando insight: ${error.message}`);
  }
  
  return insertedInsight.id;
}


