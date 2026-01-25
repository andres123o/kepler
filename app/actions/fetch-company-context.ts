'use server'

import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

interface SerpAPIResult {
  organic_results?: Array<{
    title?: string
    snippet?: string
    link?: string
  }>
  answer_box?: {
    answer?: string
    snippet?: string
  }
}

/**
 * Busca información de la empresa usando SerpAPI
 */
async function searchWithSerpAPI(query: string): Promise<string> {
  const apiKey = process.env.SERPAPI_API_KEY
  if (!apiKey) {
    throw new Error('SERPAPI_API_KEY no está configurado')
  }

  try {
    const response = await fetch(
      `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${apiKey}&engine=google&hl=es&gl=co`
    )

    if (!response.ok) {
      throw new Error(`SerpAPI error: ${response.statusText}`)
    }

    const data: SerpAPIResult = await response.json()

    // Priorizar answer_box si existe
    if (data.answer_box?.answer || data.answer_box?.snippet) {
      return data.answer_box.answer || data.answer_box.snippet || ''
    }

    // Si no hay answer_box, tomar los primeros 3 resultados orgánicos
    if (data.organic_results && data.organic_results.length > 0) {
      const snippets = data.organic_results
        .slice(0, 3)
        .map(result => result.snippet || result.title || '')
        .filter(Boolean)
        .join(' ')

      return snippets
    }

    return ''
  } catch (error: any) {
    console.error(`Error en SerpAPI para query "${query}":`, error.message)
    return ''
  }
}

/**
 * Limpia y extrae el texto relevante usando OpenAI
 */
async function cleanWithOpenAI(rawText: string, contextType: string): Promise<string> {
  if (!rawText || rawText.trim().length === 0) {
    return ''
  }

  const apiKey = process.env.API_OPENAI || process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY no está configurado')
  }

  const client = new OpenAI({ apiKey })
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini'

  try {
    const prompt = `Eres un asistente que extrae información relevante. Del siguiente texto extraído de búsquedas web sobre una empresa, extrae SOLO la información relacionada con la ${contextType} de la empresa. 

Responde ÚNICAMENTE con el texto limpio y relevante, sin explicaciones adicionales, sin prefijos, sin comillas. Si no encuentras información relevante, responde con "No disponible".

Texto a procesar:
${rawText}`

    const response = await client.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'Eres un asistente que extrae información relevante de textos. Responde solo con el texto limpio, sin explicaciones.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    })

    const cleanedText = response.choices[0]?.message?.content?.trim() || ''

    // Si OpenAI devuelve "No disponible" o está vacío, retornar string vacío
    if (cleanedText.toLowerCase().includes('no disponible') || cleanedText.length === 0) {
      return ''
    }

    return cleanedText
  } catch (error: any) {
    console.error(`Error en OpenAI para ${contextType}:`, error.message)
    return ''
  }
}

/**
 * Función principal que busca y guarda el contexto de la empresa
 */
export async function fetchCompanyContext(
  organizationId: string,
  companyName: string,
  userId: string
) {
  if (!organizationId || !companyName || !userId) {
    console.error('❌ Parámetros faltantes para fetchCompanyContext')
    return { success: false, error: 'Parámetros faltantes' }
  }

  console.log(`🔍 Iniciando búsqueda de contexto para: ${companyName}`)

  try {
    const supabase = await createClient()

    // Definir las 4 consultas
    const queries = [
      { type: 'Misión', query: `${companyName} misión` },
      { type: 'Visión', query: `${companyName} visión` },
      { type: 'Metas 2026', query: `${companyName} metas 2026 objetivos` },
      { type: 'Qué hace la empresa', query: `${companyName} qué hace empresa servicios productos` },
    ]

    // Ejecutar las 4 búsquedas en SerpAPI en paralelo
    console.log('📡 Ejecutando 4 consultas a SerpAPI en paralelo...')
    const serpResults = await Promise.all(
      queries.map(({ query }) => searchWithSerpAPI(query))
    )

    // Procesar cada resultado con OpenAI en paralelo
    console.log('🤖 Procesando resultados con OpenAI en paralelo...')
    const cleanedResults = await Promise.all(
      queries.map(({ type }, index) =>
        cleanWithOpenAI(serpResults[index], type)
      )
    )

    // Preparar los contextos para guardar
    const contextsToSave = queries
      .map(({ type }, index) => ({
        name: type,
        content: cleanedResults[index],
        organization_id: organizationId,
        created_by: userId,
      }))
      .filter((ctx) => ctx.content && ctx.content.length > 0) // Solo guardar si hay contenido

    if (contextsToSave.length === 0) {
      console.log('⚠️ No se encontró información relevante para guardar')
      return { success: true, saved: 0, message: 'No se encontró información relevante' }
    }

    // Guardar todos los contextos en una sola transacción
    console.log(`💾 Guardando ${contextsToSave.length} contextos en business_context...`)
    const { error: insertError } = await supabase
      .from('business_context')
      // @ts-ignore - Supabase client types issue
      .insert(contextsToSave as any)

    if (insertError) {
      console.error('❌ Error al guardar contextos:', insertError)
      throw insertError
    }

    console.log(`✅ Contexto guardado exitosamente: ${contextsToSave.length} registros`)
    return {
      success: true,
      saved: contextsToSave.length,
      contexts: contextsToSave.map((c) => c.name),
    }
  } catch (error: any) {
    console.error('❌ Error en fetchCompanyContext:', error.message)
    return {
      success: false,
      error: error.message || 'Error desconocido',
    }
  }
}

