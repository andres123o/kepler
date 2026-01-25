'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { fetchCompanyContextWithAdmin } from './fetch-company-context'
import { scrapeInstagramWeekComments } from './scrape-instagram'
import { scrapePlayStoreReviews } from './scrape-playstore'
import { runCompleteAnalysisWithAdmin } from './run-analysis'

/**
 * Ejecuta todos los scrapings y genera el primer análisis automáticamente
 * Se ejecuta en background durante el registro
 */
export async function generateFirstAnalysis(
  organizationId: string,
  companyName: string,
  userId: string,
  instagramUsername?: string,
  playStoreUrl?: string
) {
  console.log(`🚀 Iniciando generación de primer análisis para organización: ${organizationId}`)
  
  try {
    // Usar admin client porque se ejecuta sin sesión activa
    const supabase = createAdminClient()

    // Paso 1: Ejecutar scraping de contexto de empresa (si no existe)
    console.log('📋 Verificando contexto de empresa...')
    const { data: existingContext } = await supabase
      .from('business_context')
      .select('id')
      .eq('organization_id', organizationId)
      .limit(1)

    let companyContextDone = false
    if (!existingContext || existingContext.length === 0) {
      console.log('🔍 Ejecutando scraping de contexto de empresa...')
      const contextResult = await fetchCompanyContextWithAdmin(organizationId, companyName, userId)
      if (contextResult.success) {
        console.log(`✅ Contexto de empresa guardado: ${contextResult.saved} registros`)
        companyContextDone = true
      } else {
        console.warn(`⚠️ Error en contexto de empresa: ${contextResult.error}`)
      }
    } else {
      console.log('✅ Contexto de empresa ya existe')
      companyContextDone = true
    }

    // Paso 2: Ejecutar scrapings de Instagram y Play Store en paralelo
    console.log('📡 Ejecutando scrapings de Instagram y Play Store...')
    const scrapingPromises: Promise<any>[] = []

    if (instagramUsername && instagramUsername.trim()) {
      const cleanInstagram = instagramUsername.trim().replace(/^@/, '').replace(/\s+/g, '')
      scrapingPromises.push(
        scrapeInstagramWeekComments(cleanInstagram)
          .then(result => ({ type: 'instagram', success: result.success, data: result.data }))
          .catch(error => {
            console.error('❌ Error scraping Instagram:', error.message)
            return { type: 'instagram', success: false, data: null }
          })
      )
    }

    if (playStoreUrl && playStoreUrl.trim()) {
      scrapingPromises.push(
        scrapePlayStoreReviews(playStoreUrl.trim(), 10)
          .then(result => ({ type: 'playstore', success: result.success, data: result.data }))
          .catch(error => {
            console.error('❌ Error scraping Play Store:', error.message)
            return { type: 'playstore', success: false, data: null }
          })
      )
    }

    // Esperar a que todos los scrapings terminen
    const scrapingResults = await Promise.all(scrapingPromises)
    console.log('✅ Scrapings completados')

    // Verificar que al menos el contexto de empresa esté listo
    if (!companyContextDone) {
      console.warn('⚠️ Contexto de empresa no está listo, esperando...')
      // Esperar un poco más y verificar de nuevo
      await new Promise(resolve => setTimeout(resolve, 5000))
    }

    // Paso 3: Verificar que tenemos datos suficientes para el análisis
    const { data: businessContexts } = await supabase
      .from('business_context')
      .select('*')
      .eq('organization_id', organizationId)

    const hasBusinessContext = businessContexts && businessContexts.length > 0
    const hasInstagramData = scrapingResults.find(r => r.type === 'instagram')?.success || false
    const hasPlayStoreData = scrapingResults.find(r => r.type === 'playstore')?.success || false

    if (!hasBusinessContext) {
      console.error('❌ No hay contexto de negocio disponible para generar análisis')
      return { success: false, error: 'No hay contexto de negocio disponible' }
    }

    console.log('📊 Datos disponibles:', {
      businessContext: hasBusinessContext,
      instagram: hasInstagramData,
      playstore: hasPlayStoreData,
    })

    // Paso 4: Generar análisis automáticamente
    console.log('🤖 Generando primer análisis automático...')
    const analysisResult = await runCompleteAnalysisWithAdmin(organizationId)

    if (analysisResult.success) {
      console.log(`✅ Primer análisis generado exitosamente. Insight ID: ${analysisResult.insightId}`)
      return {
        success: true,
        insightId: analysisResult.insightId,
        metadata: analysisResult.metadata,
      }
    } else {
      console.error(`❌ Error al generar análisis: ${analysisResult.error}`)
      return {
        success: false,
        error: analysisResult.error || 'Error desconocido al generar análisis',
      }
    }
  } catch (error: any) {
    console.error('❌ Error en generateFirstAnalysis:', error.message)
    return {
      success: false,
      error: error.message || 'Error desconocido',
    }
  }
}

