'use server'

import { ApifyClient } from 'apify-client';

const client = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

export interface PlayStoreReview {
  id: string;
  reviewText: string;
  rating: number;
  datePublished: string;
  userName: string;
  appId: string;
}

export async function scrapePlayStoreReviews(appUrl: string, maxReviews: number = 10) {
  console.log('\n🔍 ============================================');
  console.log('🔍 INICIANDO SCRAPING DE PLAY STORE');
  console.log('🔍 ============================================');
  console.log(`📱 URL recibida: ${appUrl}`);
  
  if (!appUrl || appUrl.trim().length === 0) {
    console.error('❌ Error: URL vacía');
    return { 
      success: false, 
      error: "La URL de la app no puede estar vacía.",
      data: [] 
    };
  }

  // Extraer appId de la URL o usar directamente
  let appId = appUrl.trim();
  console.log(`🔍 URL inicial: ${appId}`);
  
  if (appUrl.includes('play.google.com')) {
    try {
      const url = new URL(appUrl);
      const extractedId = url.searchParams.get('id');
      console.log(`🔍 ID extraído de URL: ${extractedId}`);
      appId = extractedId || appUrl;
    } catch (error: any) {
      console.log(`⚠️ Error al parsear URL: ${error.message}`);
      // Si falla, usar el valor tal cual
    }
  }

  // Limpiar appId (quitar com. si está duplicado o espacios)
  const originalAppId = appId;
  appId = appId.replace(/^https?:\/\/[^/]+/, '').replace(/^\//, '').trim();
  console.log(`🔍 AppId después de limpiar: ${appId}`);
  console.log(`🔍 AppId original: ${originalAppId}`);
  
  if (!appId) {
    console.error('❌ Error: No se pudo extraer appId');
    return { 
      success: false, 
      error: "No se pudo extraer el appId de la URL proporcionada.",
      data: [] 
    };
  }

  console.log(`✅ AppId final: ${appId}`);
  console.log(`📡 Token de Apify: ${process.env.APIFY_API_TOKEN ? '✅ Configurado' : '❌ No configurado'}`);
  console.log(`\n📡 Llamando al actor de Apify...`);
  console.log(`   Actor: neatrat/google-play-store-reviews-scraper`);
  console.log(`   Input: { appIdOrUrl: "${appId}", maxReviews: ${maxReviews}, sortBy: "newest", pagesToScrape: 1, reviewsPerPage: ${maxReviews}, maxItems: ${maxReviews} }`);

  try {
    const playStoreRun = await client.actor('neatrat/google-play-store-reviews-scraper').call({
      appIdOrUrl: appId, // El actor requiere appIdOrUrl como string, no array
      maxReviews: maxReviews,
      sortBy: 'newest',
      // Limitar scraping inicial para evitar descargar 100+ reseñas
      pagesToScrape: 1, // Solo 1 página
      reviewsPerPage: maxReviews, // 10 reviews por página
      maxItems: maxReviews // Límite total
    });
    
    console.log(`✅ Run iniciado: ${playStoreRun.id}`);
    console.log(`⏳ Esperando a que termine...`);

    // Esperar a que termine
    let runStatus = playStoreRun.status;
    let pollCount = 0;
    const maxPolls = 60;
    
    console.log(`📊 Estado inicial del run: ${runStatus}`);
    
    while (runStatus === 'RUNNING' || runStatus === 'READY') {
      pollCount++;
      if (pollCount > maxPolls) {
        console.error(`❌ Timeout después de ${pollCount} polls`);
        throw new Error(`Timeout: El run tardó más de ${maxPolls * 2} segundos`);
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
      const runInfo = await client.run(playStoreRun.id).get();
      if (!runInfo) {
        throw new Error('No se pudo obtener información del run');
      }
      runStatus = runInfo?.status || runStatus;
      
      if (pollCount % 5 === 0) {
        console.log(`   ⏳ Poll ${pollCount}: ${runStatus}`);
      }
    }

    console.log(`✅ Run completado con estado: ${runStatus}`);
    
    if (runStatus !== 'SUCCEEDED') {
      console.error(`❌ Run falló con estado: ${runStatus}`);
      throw new Error(`Run falló con estado: ${runStatus}`);
    }

    // Obtener datos
    console.log(`\n📥 Obteniendo datos del dataset...`);
    console.log(`   Dataset ID: ${playStoreRun.defaultDatasetId}`);
    
    const dataset = await client.dataset(playStoreRun.defaultDatasetId).listItems();
    const items = dataset.items || [];
    
    console.log(`📊 Total de items en el dataset: ${items.length}`);
    
    if (items.length > 0) {
      console.log(`🔍 Estructura del primer item:`);
      console.log(JSON.stringify(items[0], null, 2));
    }

    if (items.length === 0) {
      console.log('⚠️ No se encontraron items en el dataset');
      return { 
        success: true, 
        data: [], 
        message: "No se encontraron reseñas en la app de Play Store." 
      };
    }

    // Procesar reseñas (solo las primeras maxReviews)
    console.log(`\n🔄 Procesando ${items.length} reseñas, limitando a ${maxReviews}...`);
    
    const finalData: PlayStoreReview[] = items.slice(0, maxReviews).map((review: any, index: number) => {
      // Mapear campos según la estructura real del actor
      const processed = {
        id: review.reviewId || review.id || `review-${index}`,
        reviewText: review.body || review.reviewText || review.text || review.commentary || '',
        rating: review.rating || review.score || 0,
        datePublished: review.date || review.datePublished || (review.timestamp ? new Date(review.timestamp * 1000).toISOString() : new Date().toISOString()),
        userName: review.reviewer || review.userName || review.author || review.user || 'Anónimo',
        appId: review.appId || appId,
      };
      
      if (index < 3) {
        console.log(`   📝 Reseña ${index + 1}:`, processed);
      }
      
      return processed;
    });

    console.log(`\n✅ ===========================================`);
    console.log(`✅ SCRAPING COMPLETADO`);
    console.log(`✅ ===========================================`);
    console.log(`✅ Reseñas procesadas: ${finalData.length}`);
    console.log(`✅ ===========================================\n`);

    return { success: true, data: finalData };

  } catch (error: any) {
    console.error("\n❌ ============================================");
    console.error("❌ ERROR EN SCRAPING DE PLAY STORE");
    console.error("❌ ============================================");
    console.error("❌ Mensaje:", error.message);
    console.error("❌ Stack:", error.stack);
    console.error("❌ ============================================\n");
    
    return { 
      success: false, 
      error: error.message || "Error al procesar Play Store.",
      data: [] 
    };
  }
}

