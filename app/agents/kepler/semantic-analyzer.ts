/**
 * Analizador Semántico - Embeddings + Clustering
 * 
 * Agrupa datos similares (tickets, reviews, etc.) usando embeddings
 * para reducir tokens y mejorar identificación de patrones
 */

import { Ticket, NPSSurvey, CSATSurvey, PlayStoreReview, InstagramPost, LinkedInPost } from './types';
// Este archivo ya no se usa (clustering eliminado), pero se mantiene por referencia futura

// Tipos para clustering
export interface DataItem {
  id: string;
  text: string; // Texto completo para embedding
  source: 'ticket' | 'nps' | 'csat' | 'review' | 'instagram' | 'linkedin';
  original: Ticket | NPSSurvey | CSATSurvey | PlayStoreReview | InstagramPost | LinkedInPost;
  score?: number; // Score si aplica (NPS, CSAT, rating)
}

export interface Cluster {
  id: string;
  items: DataItem[];
  centroid: number[]; // Embedding promedio
  representative: DataItem; // Item más cercano al centroide
  size: number;
  avgScore?: number; // Score promedio si aplica
  priority: number; // Volumen × Riesgo
}

// Este archivo recibe el cliente de OpenAI como parámetro desde agent.ts
// No necesita crear su propio cliente

/**
 * Convierte datos de entrada a DataItems para procesamiento
 */
export function prepareDataItems(data: {
  tickets?: Ticket[];
  nps?: NPSSurvey[];
  csat?: CSATSurvey[];
  playstore?: PlayStoreReview[];
  instagram?: InstagramPost[];
  linkedin?: LinkedInPost[];
}): DataItem[] {
  const items: DataItem[] = [];

  // Tickets
  if (data.tickets) {
    data.tickets.forEach(ticket => {
      items.push({
        id: ticket.id,
        text: `${ticket.subject} ${ticket.description}`.trim(),
        source: 'ticket',
        original: ticket,
      });
    });
  }

  // NPS (solo con comentarios)
  if (data.nps) {
    data.nps
      .filter(n => n.comment && n.comment.trim().length > 0)
      .forEach(nps => {
        items.push({
          id: nps.id,
          text: nps.comment!,
          source: 'nps',
          original: nps,
          score: nps.score,
        });
      });
  }

  // CSAT (solo con comentarios)
  if (data.csat) {
    data.csat
      .filter(c => c.comment && c.comment.trim().length > 0)
      .forEach(csat => {
        items.push({
          id: csat.id,
          text: csat.comment!,
          source: 'csat',
          original: csat,
          score: csat.score,
        });
      });
  }

  // Play Store Reviews
  if (data.playstore) {
    data.playstore.forEach(review => {
      items.push({
        id: review.id,
        text: review.reviewText,
        source: 'review',
        original: review,
        score: review.rating,
      });
    });
  }

  // Instagram (comentarios)
  if (data.instagram) {
    data.instagram.forEach(post => {
      post.latestComments.forEach(comment => {
        items.push({
          id: comment.id,
          text: comment.text,
          source: 'instagram',
          original: post,
        });
      });
    });
  }

  // LinkedIn (comentarios)
  if (data.linkedin) {
    data.linkedin.forEach(post => {
      post.latestComments.forEach(comment => {
        items.push({
          id: comment.id,
          text: comment.text,
          source: 'linkedin',
          original: post,
        });
      });
    });
  }

  return items;
}

/**
 * Genera embeddings para un array de textos (batch)
 */
async function generateEmbeddings(openaiClient: OpenAI, texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  // Procesar en batches de 100 (límite de OpenAI)
  const batchSize = 100;
  const batches: string[][] = [];
  
  for (let i = 0; i < texts.length; i += batchSize) {
    batches.push(texts.slice(i, i + batchSize));
  }

  const allEmbeddings: number[][] = [];

  for (const batch of batches) {
    try {
      const response = await openaiClient.embeddings.create({
        model: 'text-embedding-3-small', // Más barato, suficiente para clustering
        input: batch,
      });

      const embeddings = response.data.map(item => item.embedding);
      allEmbeddings.push(...embeddings);
    } catch (error: any) {
      console.error('Error generando embeddings:', error);
      throw new Error(`Error al generar embeddings: ${error.message}`);
    }
  }

  return allEmbeddings;
}

/**
 * Calcula similaridad coseno entre dos vectores
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectores deben tener la misma dimensión');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return dotProduct / denominator;
}

/**
 * Calcula el centroide (promedio) de un grupo de embeddings
 */
function calculateCentroid(embeddings: number[][]): number[] {
  if (embeddings.length === 0) return [];

  const dimension = embeddings[0].length;
  const centroid = new Array(dimension).fill(0);

  for (const embedding of embeddings) {
    for (let i = 0; i < dimension; i++) {
      centroid[i] += embedding[i];
    }
  }

  return centroid.map(val => val / embeddings.length);
}

/**
 * Encuentra el item más cercano al centroide
 */
function findRepresentative(centroid: number[], items: DataItem[], embeddings: number[][]): DataItem {
  let maxSimilarity = -1;
  let representative = items[0];

  items.forEach((item, idx) => {
    const similarity = cosineSimilarity(centroid, embeddings[idx]);
    if (similarity > maxSimilarity) {
      maxSimilarity = similarity;
      representative = item;
    }
  });

  return representative;
}

/**
 * Agrupa items por similaridad usando umbral
 */
export function clusterBySimilarity(
  items: DataItem[],
  embeddings: number[][],
  similarityThreshold: number = 0.75
): Cluster[] {
  if (items.length === 0 || embeddings.length === 0) return [];
  if (items.length !== embeddings.length) {
    throw new Error('Items y embeddings deben tener la misma longitud');
  }

  const clusters: Cluster[] = [];
  const assigned = new Set<number>();

  // Agrupar items similares
  for (let i = 0; i < items.length; i++) {
    if (assigned.has(i)) continue;

    const clusterItems: DataItem[] = [items[i]];
    const clusterEmbeddings: number[][] = [embeddings[i]];
    const indices = [i];
    assigned.add(i);

    // Buscar items similares
    for (let j = i + 1; j < items.length; j++) {
      if (assigned.has(j)) continue;

      const similarity = cosineSimilarity(embeddings[i], embeddings[j]);
      if (similarity >= similarityThreshold) {
        clusterItems.push(items[j]);
        clusterEmbeddings.push(embeddings[j]);
        indices.push(j);
        assigned.add(j);
      }
    }

    // Solo crear cluster si tiene mínimo 2 items (o 1 si es muy importante)
    if (clusterItems.length >= 2 || (clusterItems.length === 1 && hasLowScore(clusterItems[0]))) {
      const centroid = calculateCentroid(clusterEmbeddings);
      const representative = findRepresentative(centroid, clusterItems, clusterEmbeddings);
      
      const itemsWithScore = clusterItems.filter(item => item.score !== undefined);
      const avgScore = itemsWithScore.length > 0
        ? itemsWithScore.reduce((sum, item) => sum + (item.score || 0), 0) / itemsWithScore.length
        : undefined;

      // Calcular prioridad: volumen × riesgo
      const volume = clusterItems.length;
      const risk = calculateRisk(clusterItems, avgScore);
      const priority = volume * risk;

      clusters.push({
        id: `cluster-${clusters.length + 1}`,
        items: clusterItems,
        centroid,
        representative,
        size: clusterItems.length,
        avgScore: avgScore,
        priority,
      });
    }
  }

  return clusters;
}

/**
 * Verifica si un item tiene score bajo (más importante)
 */
function hasLowScore(item: DataItem): boolean {
  if (item.score === undefined) return false;
  
  // NPS: score <= 6 es bajo
  if (item.source === 'nps' && item.score <= 6) return true;
  // CSAT: score <= 2 es bajo
  if (item.source === 'csat' && item.score <= 2) return true;
  // Reviews: rating <= 2 es bajo
  if (item.source === 'review' && item.score <= 2) return true;
  
  return false;
}

/**
 * Calcula riesgo estimado del cluster (1-3)
 */
function calculateRisk(items: DataItem[], avgScore?: number): number {
  // Si hay scores bajos, riesgo alto
  if (avgScore !== undefined) {
    if (avgScore <= 2) return 3; // Alto
    if (avgScore <= 4) return 2; // Medio
  }

  // Si hay muchos items, riesgo medio-alto
  if (items.length >= 10) return 2.5;
  if (items.length >= 5) return 2;

  return 1; // Bajo
}

/**
 * Prioriza clusters por volumen × riesgo
 */
export function prioritizeClusters(clusters: Cluster[]): Cluster[] {
  return clusters.sort((a, b) => b.priority - a.priority);
}

/**
 * Función principal: Analiza datos y retorna clusters priorizados
 */
export async function analyzeAndCluster(
  data: {
    tickets?: Ticket[];
    nps?: NPSSurvey[];
    csat?: CSATSurvey[];
    playstore?: PlayStoreReview[];
    instagram?: InstagramPost[];
    linkedin?: LinkedInPost[];
  },
  openaiClient: OpenAI
): Promise<{ clusters: Cluster[], processedItemsCount: number }> {
  // Paso 1: Preparar items
  const items = prepareDataItems(data);
  
  if (items.length === 0) {
    return { clusters: [], processedItemsCount: 0 };
  }

  // Paso 2: Generar embeddings
  const texts = items.map(item => item.text);
  const embeddings = await generateEmbeddings(openaiClient, texts);

  // Paso 3: Clustering
  const clusters = clusterBySimilarity(items, embeddings, 0.75);

  // Paso 4: Priorizar
  const prioritized = prioritizeClusters(clusters);

  return { clusters: prioritized, processedItemsCount: items.length };
}

