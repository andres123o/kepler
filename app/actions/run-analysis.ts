/**
 * Orquestador Principal de Análisis
 * 
 * Coordina todo el proceso:
 * 1. Procesar archivos
 * 2. Ejecutar scrapers (UNA SOLA VEZ por análisis)
 * 3. Combinar datos
 * 4. Llamar al agente Kepler
 * 5. Guardar resultado
 */

'use server'

import { createClient } from '@/lib/supabase/server';
import { processAllFiles } from './process-files';
import { scrapeInstagramWeekComments } from './scrape-instagram';
import { scrapeLinkedInPosts } from './scrape-linkedin';
import { scrapePlayStoreReviews } from './scrape-playstore';
import { runKeplerAgent, KeplerAgentInput } from '@/app/agents/kepler';
import { saveInsightToDatabase, RawSourceData } from './save-insight';
import { Ticket, NPSSurvey, CSATSurvey } from '@/app/agents/kepler/types';

// Cache simple en memoria para evitar ejecuciones duplicadas de scrapers
const scraperCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 horas

export interface AnalysisResult {
  success: boolean;
  insightId?: string;
  error?: string;
  metadata?: {
    filesProcessed: number;
    scrapersExecuted: number;
    itemsAnalyzed: number;
    clustersDetected?: number;
    processingTime: number;
  };
}

/**
 * Ejecuta el análisis completo
 * @param organizationId ID de la organización
 * @param parsedFileData Datos parseados de archivos (opcional, si se pasan directamente desde el modal)
 * @param rawFileData Datos crudos del CSV para mostrar en UI (opcional)
 */
export async function runCompleteAnalysis(
  organizationId: string,
  parsedFileData?: { nps?: NPSSurvey[]; csat?: CSATSurvey[]; tickets?: Ticket[] },
  rawFileData?: { nps?: Record<string, string>[]; csat?: Record<string, string>[]; tickets?: Record<string, string>[] }
): Promise<AnalysisResult> {
  const startTime = Date.now();
  const supabase = await createClient();
  
  try {
    // Paso 1: Obtener data sources
    const { data: dataSources, error: sourcesError } = await supabase
      .from('data_sources')
      .select('*')
      .eq('organization_id', organizationId);
    
    if (sourcesError) {
      throw new Error(`Error obteniendo data sources: ${sourcesError.message}`);
    }
    
    if (!dataSources || dataSources.length === 0) {
      throw new Error('No hay fuentes de datos configuradas para esta organización');
    }
    
    // Paso 2: Usar datos parseados si se pasaron, sino intentar leer de Storage (fallback)
    let processedFiles = { 
      nps: parsedFileData?.nps || [] as NPSSurvey[], 
      csat: parsedFileData?.csat || [] as CSATSurvey[], 
      tickets: parsedFileData?.tickets || [] as Ticket[] 
    };
    let filesProcessed = processedFiles.nps.length + processedFiles.csat.length + processedFiles.tickets.length;
    
    // Si no hay datos parseados y hay archivos en Storage, intentar leerlos (fallback)
    if (filesProcessed === 0) {
      try {
        const storageFiles = await processAllFiles(organizationId);
        processedFiles = {
          nps: processedFiles.nps.length > 0 ? processedFiles.nps : storageFiles.nps,
          csat: processedFiles.csat.length > 0 ? processedFiles.csat : storageFiles.csat,
          tickets: processedFiles.tickets.length > 0 ? processedFiles.tickets : storageFiles.tickets,
        };
        filesProcessed = processedFiles.nps.length + processedFiles.csat.length + processedFiles.tickets.length;
      } catch (error: any) {
        console.warn('⚠️ Error procesando archivos desde Storage, continuando:', error.message);
      }
    }
    
    // Paso 3: Ejecutar scrapers SOLO UNA VEZ (con cache para evitar ejecuciones duplicadas)
    const typedSources = (dataSources || []) as Array<{ source_type?: string; social_platform?: string; app_store_type?: string; [key: string]: any }>;
    const instagramSources = typedSources.filter(s => s.source_type === 'social' && s.social_platform === 'instagram');
    const linkedInSources = typedSources.filter(s => s.source_type === 'social' && s.social_platform === 'linkedin');
    const playStoreSources = typedSources.filter(s => s.source_type === 'app_store' && s.app_store_type === 'play_store');
    
    const scrapedData: any = {
      instagram: null,
      linkedin: null,
      playstore: null,
    };
    let scrapersExecuted = 0;
    
    // Preparar promesas para ejecutar en paralelo
    const scraperPromises: Promise<any>[] = [];
    const now = Date.now();
    
    // Instagram scraper - verificar cache antes de ejecutar
    if (instagramSources.length > 0) {
      const firstSource = instagramSources[0];
      const username = firstSource.social_username;
      if (username) {
        const cacheKey = `instagram-${organizationId}-${username}`;
        const cached = scraperCache.get(cacheKey);
        
        if (cached && (now - cached.timestamp) < CACHE_TTL) {
          console.log(`📋 Usando datos en cache para Instagram @${username}`);
          scrapedData.instagram = cached.data;
          if (cached.data) scrapersExecuted++;
        } else {
          console.log(`📸 Ejecutando scraper de Instagram para @${username}... (primera vez)`);
          scraperPromises.push(
            scrapeInstagramWeekComments(username)
              .then(result => {
                const data = result.success ? result.data : null;
                // Guardar en cache
                scraperCache.set(cacheKey, { data, timestamp: now });
                return { type: 'instagram', data };
              })
              .catch(error => {
                console.warn('⚠️ Error scraping Instagram:', error.message);
                return { type: 'instagram', data: null };
              })
          );
        }
      }
    }
    
    // LinkedIn scraper - verificar cache antes de ejecutar
    if (linkedInSources.length > 0) {
      const firstSource = linkedInSources[0];
      const profileUrl = firstSource.social_profile_url || firstSource.social_username;
      if (profileUrl) {
        const cacheKey = `linkedin-${organizationId}-${profileUrl}`;
        const cached = scraperCache.get(cacheKey);
        
        if (cached && (now - cached.timestamp) < CACHE_TTL) {
          console.log(`📋 Usando datos en cache para LinkedIn ${profileUrl}`);
          scrapedData.linkedin = cached.data;
          if (cached.data) scrapersExecuted++;
        } else {
          console.log(`💼 Ejecutando scraper de LinkedIn para ${profileUrl}... (primera vez)`);
          scraperPromises.push(
            scrapeLinkedInPosts(profileUrl)
              .then(result => {
                const data = result.success ? result.data : null;
                // Guardar en cache
                scraperCache.set(cacheKey, { data, timestamp: now });
                return { type: 'linkedin', data };
              })
              .catch(error => {
                console.warn('⚠️ Error scraping LinkedIn:', error.message);
                return { type: 'linkedin', data: null };
              })
          );
        }
      }
    }
    
    // Play Store scraper - verificar cache antes de ejecutar
    if (playStoreSources.length > 0) {
      const firstSource = playStoreSources[0];
      const appUrl = firstSource.app_url;
      if (appUrl) {
        const cacheKey = `playstore-${organizationId}-${appUrl}`;
        const cached = scraperCache.get(cacheKey);
        
        if (cached && (now - cached.timestamp) < CACHE_TTL) {
          console.log(`📋 Usando datos en cache para Play Store ${appUrl}`);
          scrapedData.playstore = cached.data;
          if (cached.data) scrapersExecuted++;
        } else {
          console.log(`📱 Ejecutando scraper de Play Store para ${appUrl}... (primera vez)`);
          scraperPromises.push(
            scrapePlayStoreReviews(appUrl, 10)
              .then(result => {
                const data = result.success ? result.data : null;
                // Guardar en cache
                scraperCache.set(cacheKey, { data, timestamp: now });
                return { type: 'playstore', data };
              })
              .catch(error => {
                console.warn('⚠️ Error scraping Play Store:', error.message);
                return { type: 'playstore', data: null };
              })
          );
        }
      }
    }
    
    // Ejecutar solo los scrapers que no están en cache
    if (scraperPromises.length > 0) {
      console.log(`🔄 Ejecutando ${scraperPromises.length} scraper(s) en paralelo...`);
      const scraperResults = await Promise.all(scraperPromises);
      
      // Procesar resultados y actualizar scrapedData
      scraperResults.forEach(result => {
        if (result.data) {
          scrapedData[result.type] = result.data;
          scrapersExecuted++;
        }
      });
      
      console.log(`✅ Scrapers completados. Total: ${scrapersExecuted} scraper(s) con datos.`);
    } else {
      console.log(`✅ Todos los scrapers usaron datos en cache. Total: ${scrapersExecuted} scraper(s) con datos.`);
    }
    
    // Paso 4: Verificar que haya al menos algún dato
    const hasData = 
      processedFiles.nps.length > 0 ||
      processedFiles.csat.length > 0 ||
      processedFiles.tickets.length > 0 ||
      (scrapedData.instagram && scrapedData.instagram.length > 0) ||
      (scrapedData.linkedin && scrapedData.linkedin.length > 0) ||
      (scrapedData.playstore && scrapedData.playstore.length > 0);
    
    if (!hasData) {
      throw new Error('No hay datos disponibles para analizar. Asegúrate de haber subido archivos o configurado scrapers.');
    }
    
    // Paso 5: Obtener contextos de negocio y equipo
    const { data: businessContexts } = await supabase
      .from('business_context')
      .select('*')
      .eq('organization_id', organizationId);
    
    const { data: teamContexts } = await supabase
      .from('team_context')
      .select('*')
      .eq('organization_id', organizationId);
    
    // Paso 6: Preparar input para el agente con TODOS los datos
    console.log('📦 Preparando datos para el agente...');
    console.log('  - Archivos procesados:', {
      nps: processedFiles.nps.length,
      csat: processedFiles.csat.length,
      tickets: processedFiles.tickets.length,
    });
    console.log('  - Scrapers ejecutados:', {
      instagram: scrapedData.instagram?.length || 0,
      linkedin: scrapedData.linkedin?.length || 0,
      playstore: scrapedData.playstore?.length || 0,
    });
    console.log('  - Contextos de negocio:', businessContexts?.length || 0);
    console.log('  - Contextos de equipo:', teamContexts?.length || 0);
    
    const agentInput: KeplerAgentInput = {
      organizationId,
      businessContexts: businessContexts || [],
      teamContexts: teamContexts || [],
      data: {
        nps: processedFiles.nps.length > 0 ? processedFiles.nps : undefined,
        csat: processedFiles.csat.length > 0 ? processedFiles.csat : undefined,
        tickets: processedFiles.tickets.length > 0 ? processedFiles.tickets : undefined,
        instagram: scrapedData.instagram && scrapedData.instagram.length > 0 ? scrapedData.instagram : undefined,
        linkedin: scrapedData.linkedin && scrapedData.linkedin.length > 0 ? scrapedData.linkedin : undefined,
        playstore: scrapedData.playstore && scrapedData.playstore.length > 0 ? scrapedData.playstore : undefined,
      },
    };
    
    // Paso 7: Ejecutar agente Kepler CON LOS DATOS
    console.log('🤖 Ejecutando agente Kepler con datos combinados...');
    console.log('  - Total de items a analizar:', {
      nps: agentInput.data.nps?.length || 0,
      csat: agentInput.data.csat?.length || 0,
      tickets: agentInput.data.tickets?.length || 0,
      instagram: agentInput.data.instagram?.reduce((sum, p) => sum + p.latestComments.length, 0) || 0,
      linkedin: agentInput.data.linkedin?.reduce((sum, p) => sum + p.latestComments.length, 0) || 0,
      playstore: agentInput.data.playstore?.length || 0,
    });
    
    const agentResult = await runKeplerAgent(agentInput);
    console.log('✅ Agente Kepler ejecutado. Resultado:', agentResult.success ? 'ÉXITO' : 'ERROR');
    
    if (!agentResult.success || !agentResult.insight) {
      console.error('❌ Error del agente:', agentResult.error);
      console.error('📄 Raw output (si existe):', agentResult.rawOutput?.substring(0, 500));
      throw new Error(agentResult.error || 'El agente no generó un insight válido');
    }
    
    console.log('✅ Insight generado exitosamente:', agentResult.insight.title);
    if (agentResult.metadata) {
      console.log('📊 Metadata:', {
        processingTime: `${agentResult.metadata.processingTime}ms`,
        modelUsed: agentResult.metadata.modelUsed,
        itemsAnalyzed: agentResult.metadata.itemsAnalyzed,
        tokensUsed: agentResult.metadata.tokensUsed,
      });
    }
    
    // Paso 8: Calcular conteos por fuente para guardarlos en el insight
    const sourceCounts = {
      instagram: scrapedData.instagram?.reduce((sum: number, p: any) => sum + (p.latestComments?.length || 0), 0) || 0,
      linkedin: scrapedData.linkedin?.reduce((sum: number, p: any) => sum + (p.latestComments?.length || 0), 0) || 0,
      playstore: scrapedData.playstore?.length || 0,
      nps: processedFiles.nps.length || 0,
      csat: processedFiles.csat.length || 0,
      tickets: processedFiles.tickets.length || 0,
    };

    // Paso 8.1: Preparar datos crudos para mostrar en UI (limitados para no sobrecargar BD)
    // Para scrapers: usar estructura fija
    // Para archivos (NPS, CSAT, Tickets): usar datos crudos del CSV para preservar todas las columnas
    const rawData: RawSourceData = {
      // Scrapers - estructura fija
      instagram: scrapedData.instagram?.flatMap((post: any) =>
        post.latestComments?.slice(0, 50).map((comment: any) => ({
          postUrl: post.postUrl,
          text: comment.text,
          username: comment.username,
          timestamp: comment.timestamp,
        })) || []
      ) || undefined,
      linkedin: scrapedData.linkedin?.flatMap((post: any) =>
        post.latestComments?.slice(0, 50).map((comment: any) => ({
          postUrl: post.postUrl,
          text: comment.text,
          username: comment.username,
          timestamp: comment.timestamp,
        })) || []
      ) || undefined,
      playstore: scrapedData.playstore?.slice(0, 100).map((review: any) => ({
        id: review.id,
        reviewText: review.reviewText,
        rating: review.rating,
        userName: review.userName,
        datePublished: review.datePublished,
      })) || undefined,
      // Archivos - usar datos CRUDOS del CSV para preservar todas las columnas originales
      nps: rawFileData?.nps?.slice(0, 100) || undefined,
      csat: rawFileData?.csat?.slice(0, 100) || undefined,
      tickets: rawFileData?.tickets?.slice(0, 100) || undefined,
    };

    // Limpiar propiedades undefined o vacías
    Object.keys(rawData).forEach(key => {
      if (!rawData[key as keyof RawSourceData] || (rawData[key as keyof RawSourceData] as any[]).length === 0) {
        delete rawData[key as keyof RawSourceData];
      }
    });

    // Paso 9: Guardar insight en BD
    const dataSourceIds = typedSources.map(s => (s as { id: string }).id);
    const insightId = await saveInsightToDatabase(
      organizationId,
      agentResult,
      dataSourceIds,
      sourceCounts,
      rawData
    );
    
    // Paso 10: Actualizar processing_status de data sources
    const updateData = { 
      processing_status: 'completed',
      last_processed_at: new Date().toISOString(),
    };
    // @ts-expect-error - Supabase types issue in server actions
    await supabase
      .from('data_sources')
      .update(updateData)
      .in('id', dataSourceIds);
    
    const processingTime = Date.now() - startTime;
    
    return {
      success: true,
      insightId,
      metadata: {
        filesProcessed,
        scrapersExecuted,
        itemsAnalyzed: 
          processedFiles.nps.length +
          processedFiles.csat.length +
          processedFiles.tickets.length +
          (scrapedData.instagram?.length || 0) +
          (scrapedData.linkedin?.length || 0) +
          (scrapedData.playstore?.length || 0),
        clustersDetected: agentResult.metadata?.clustersDetected,
        processingTime,
      },
    };
    
  } catch (error: any) {
    console.error('❌ Error en análisis completo:', error);
    
    // Actualizar status de error en data sources
    try {
      const { data: dataSources } = await supabase
        .from('data_sources')
        .select('id')
        .eq('organization_id', organizationId);
      
      if (dataSources && dataSources.length > 0) {
        await supabase
          .from('data_sources')
          .update({ 
            processing_status: 'error',
            processing_error: error.message,
          })
          .in('id', dataSources.map(s => s.id));
      }
    } catch (updateError) {
      console.error('Error actualizando status:', updateError);
    }
    
    return {
      success: false,
      error: error.message || 'Error desconocido al ejecutar el análisis',
      metadata: {
        filesProcessed: 0,
        scrapersExecuted: 0,
        itemsAnalyzed: 0,
        processingTime: Date.now() - startTime,
      },
    };
  }
}


