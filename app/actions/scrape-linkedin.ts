'use server'

import { ApifyClient } from 'apify-client';

const client = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

export interface LinkedInPost {
  id: string;
  url: string;
  text: string;
  timestamp: string;
  commentsCount: number;
  latestComments: LinkedInComment[];
}

export interface LinkedInComment {
  id: string;
  text: string;
  ownerUsername: string;
  ownerName: string;
  timestamp: string;
}

export async function scrapeLinkedInPosts(profileUrl: string) {
  if (!profileUrl || profileUrl.trim().length === 0) {
    return { 
      success: false, 
      error: "La URL del perfil no puede estar vacía.",
      data: [] 
    };
  }

  // Limpiar URL
  let cleanUrl = profileUrl.trim();
  if (!cleanUrl.startsWith('http')) {
    cleanUrl = `https://www.linkedin.com/in/${cleanUrl.replace(/^\/+|\/+$/g, '')}/`;
  }

  try {
    const linkedInRun = await client.actor('harvestapi/linkedin-profile-posts').call({
      targetUrls: [cleanUrl],
      maxPosts: 5,
      scrapeComments: true,
      maxComments: 5
    });

    // Esperar a que termine
    let runStatus = linkedInRun.status;
    let pollCount = 0;
    const maxPolls = 60;
    
    while (runStatus === 'RUNNING' || runStatus === 'READY') {
      pollCount++;
      if (pollCount > maxPolls) {
        throw new Error(`Timeout: El run tardó más de ${maxPolls * 2} segundos`);
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
      const runInfo = await client.run(linkedInRun.id).get();
      runStatus = runInfo.status;
    }

    if (runStatus !== 'SUCCEEDED') {
      throw new Error(`Run falló con estado: ${runStatus}`);
    }

    // Obtener datos
    const dataset = await client.dataset(linkedInRun.defaultDatasetId).listItems();
    const items = dataset.items || [];

    if (items.length === 0) {
      return { 
        success: true, 
        data: [], 
        message: "No se encontraron posts en el perfil de LinkedIn." 
      };
    }

    // Procesar posts
    const finalData: LinkedInPost[] = items.slice(0, 5).map((post: any) => {
      const comments = (post.comments || []).slice(0, 5).map((comment: any) => ({
        id: comment.id || comment.linkedinUrl || Math.random().toString(),
        text: comment.commentary || comment.text || '',
        ownerUsername: comment.actor?.linkedinUrl?.split('/in/')[1]?.split('/')[0] || 'unknown',
        ownerName: comment.actor?.name || 'unknown',
        timestamp: comment.createdAtTimestamp 
          ? new Date(comment.createdAtTimestamp * 1000).toISOString()
          : comment.createdAt || new Date().toISOString(),
      }));

      return {
        id: post.id || post.linkedinUrl?.split('/activity-')[1] || Math.random().toString(),
        url: post.linkedinUrl || '',
        text: post.text || post.commentary || '',
        timestamp: post.createdAtTimestamp 
          ? new Date(post.createdAtTimestamp * 1000).toISOString()
          : post.createdAt || new Date().toISOString(),
        commentsCount: post.commentsCount || (post.comments?.length || 0),
        latestComments: comments,
      };
    });

    return { success: true, data: finalData };

  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || "Error al procesar LinkedIn.",
      data: [] 
    };
  }
}


