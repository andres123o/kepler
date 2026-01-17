'use server'

import { ApifyClient } from 'apify-client';
import type { InstagramPost, InstagramComment } from '../types/instagram';

const client = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

export async function scrapeInstagramWeekComments(username: string) {
  if (!username || username.trim().length === 0) {
    return { 
      success: false, 
      error: "El nombre de usuario no puede estar vacío.",
      data: [] 
    };
  }

  const cleanUsername = username.trim().replace(/^@/, '').replace(/\s+/g, '');

  try {
    // PASO 1: Obtener perfil con últimos posts
    const profileRun = await client.actor('apify/instagram-profile-scraper').call({
      usernames: [cleanUsername],
      resultsLimit: 50
    });

    // Esperar a que termine
    let runStatus = profileRun.status;
    let pollCount = 0;
    const maxPolls = 60;
    
    while (runStatus === 'RUNNING' || runStatus === 'READY') {
      pollCount++;
      if (pollCount > maxPolls) {
        throw new Error(`Timeout: El run tardó más de ${maxPolls * 2} segundos`);
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
      const runInfo = await client.run(profileRun.id).get();
      runStatus = runInfo.status;
    }

    if (runStatus !== 'SUCCEEDED') {
      throw new Error(`Run falló con estado: ${runStatus}`);
    }

    // Obtener datos del dataset
    const profileDataset = await client.dataset(profileRun.defaultDatasetId).listItems();
    const profileData = profileDataset.items || [];

    if (profileData.length === 0) {
      return { 
        success: true, 
        data: [], 
        message: "No se encontró información del perfil o el perfil es privado." 
      };
    }

    const profile = profileData[0];
    const latestPosts = profile.latestPosts || [];

    if (latestPosts.length === 0) {
      return { 
        success: true, 
        data: [], 
        message: "El perfil no tiene posts disponibles." 
      };
    }

    // Filtrar posts de la última semana (últimos 5)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentPosts = latestPosts
      .filter((post: any) => {
        const timestamp = post.timestamp || post.createdAt || post.takenAt;
        if (!timestamp) return false;
        return new Date(timestamp) >= sevenDaysAgo;
      })
      .slice(0, 5);

    if (recentPosts.length === 0) {
      return { 
        success: true, 
        data: [], 
        message: "No hay posts en la última semana." 
      };
    }

    // Extraer URLs de los posts
    const postUrls = recentPosts
      .map((post: any) => post.url)
      .filter(Boolean);

    if (postUrls.length === 0) {
      return { 
        success: false, 
        error: "No se pudieron obtener URLs válidas de los posts", 
        data: [] 
      };
    }

    // PASO 2: Obtener comentarios (5 por post)
    console.log(`📸 Obteniendo comentarios de ${postUrls.length} posts...`);
    // Limitar concurrencia para evitar rate limiting (los logs múltiples son de Apify manejando rate limits)
    const commentsRun = await client.actor('apify/instagram-comment-scraper').call({
      directUrls: postUrls,
      resultsLimit: postUrls.length * 5, // 5 comentarios por post
      maxConcurrency: 1, // Procesar una URL a la vez para reducir rate limiting
    });

    // Esperar a que termine
    let commentsRunStatus = commentsRun.status;
    let commentsPollCount = 0;
    
    while (commentsRunStatus === 'RUNNING' || commentsRunStatus === 'READY') {
      commentsPollCount++;
      if (commentsPollCount > maxPolls) {
        throw new Error(`Timeout: El run de comentarios tardó más de ${maxPolls * 2} segundos`);
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
      const runInfo = await client.run(commentsRun.id).get();
      commentsRunStatus = runInfo.status;
    }

    if (commentsRunStatus !== 'SUCCEEDED') {
      throw new Error(`Run de comentarios falló con estado: ${commentsRunStatus}`);
    }

    // Obtener comentarios
    const commentsDataset = await client.dataset(commentsRun.defaultDatasetId).listItems();
    const allComments = commentsDataset.items || [];

    // Unificar datos
    const finalData: InstagramPost[] = recentPosts.map((post: any) => {
      const postUrl = post.url;
      
      // Buscar comentarios de este post
      const postComments = allComments.filter((c: any) => {
        return c.postUrl === postUrl || 
               c.postUrl?.includes(post.shortCode) ||
               postUrl?.includes(c.postUrl);
      });

      // Ordenar por fecha y tomar los últimos 5
      const top5Comments: InstagramComment[] = postComments
        .sort((a: any, b: any) => {
          const dateA = new Date(a.timestamp || a.createdAt || 0).getTime();
          const dateB = new Date(b.timestamp || b.createdAt || 0).getTime();
          return dateB - dateA;
        })
        .slice(0, 5)
        .map((c: any) => ({
          id: c.id || c.commentId || Math.random().toString(),
          text: c.text || c.comment || '',
          ownerUsername: c.ownerUsername || c.username || 'unknown',
          timestamp: c.timestamp || c.createdAt || new Date().toISOString(),
        }));

      return {
        id: post.shortCode || post.id || Math.random().toString(),
        url: postUrl,
        caption: post.caption || post.text || '',
        timestamp: post.timestamp || post.createdAt || post.takenAt || new Date().toISOString(),
        commentsCount: post.commentsCount || post.commentCount || 0,
        latestComments: top5Comments,
      };
    });

    return { success: true, data: finalData };

  } catch (error: any) {
    console.error("\n❌ ============================================");
    console.error("❌ ERROR EN SCRAPING");
    console.error("❌ ============================================");
    console.error("❌ Mensaje:", error.message);
    console.error("❌ Stack:", error.stack);
    console.error("❌ ============================================\n");
    
    return { 
      success: false, 
      error: error.message || "Error al procesar la solicitud.",
      data: [] 
    };
  }
}
