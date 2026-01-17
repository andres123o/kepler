/**
 * Procesador de Archivos
 * 
 * Parsea archivos CSV/JSON de NPS, CSAT y Tickets
 * desde Supabase Storage
 */

'use server'

import { createClient } from '@/lib/supabase/server';
import { NPSSurvey, CSATSurvey, Ticket } from '@/app/agents/kepler/types';

/**
 * Descarga un archivo desde Supabase Storage y lo parsea
 */
async function downloadAndParseFile(filePath: string, fileType: string): Promise<string> {
  const supabase = await createClient();
  
  const { data, error } = await supabase.storage
    .from('data-sources')
    .download(filePath);
  
  if (error) {
    throw new Error(`Error descargando archivo: ${error.message}`);
  }
  
  // Convertir a texto
  const text = await data.text();
  return text;
}

/**
 * Parsea un archivo CSV simple
 */
function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];
  
  // Primera línea es el header
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  // Resto son datos
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    if (values.length !== headers.length) continue;
    
    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header.toLowerCase()] = values[idx];
    });
    rows.push(row);
  }
  
  return rows;
}

/**
 * Procesa archivo NPS
 */
export async function processNPSFile(filePath: string, fileType: string): Promise<NPSSurvey[]> {
  try {
    const text = await downloadAndParseFile(filePath, fileType);
    const surveys: NPSSurvey[] = [];
    
    if (fileType === 'csv' || fileType === 'txt') {
      const rows = parseCSV(text);
      
      rows.forEach((row, idx) => {
        const score = parseInt(row.score || row.nps || row.rating || '0');
        const comment = row.comment || row.comentario || row.feedback || row.text || '';
        const timestamp = row.timestamp || row.date || row.fecha || new Date().toISOString();
        
        if (score >= 0 && score <= 10) {
          surveys.push({
            id: `nps-${idx}`,
            score,
            comment: comment || undefined,
            timestamp,
            source: 'file',
          });
        }
      });
    } else if (fileType === 'json') {
      const data = JSON.parse(text);
      const items = Array.isArray(data) ? data : [data];
      
      items.forEach((item: any, idx: number) => {
        const score = parseInt(item.score || item.nps || item.rating || '0');
        const comment = item.comment || item.comentario || item.feedback || item.text || '';
        const timestamp = item.timestamp || item.date || item.fecha || new Date().toISOString();
        
        if (score >= 0 && score <= 10) {
          surveys.push({
            id: `nps-${idx}`,
            score,
            comment: comment || undefined,
            timestamp,
            source: 'file',
          });
        }
      });
    }
    
    return surveys;
  } catch (error: any) {
    console.error('Error procesando archivo NPS:', error);
    throw new Error(`Error procesando archivo NPS: ${error.message}`);
  }
}

/**
 * Procesa archivo CSAT
 */
export async function processCSATFile(filePath: string, fileType: string): Promise<CSATSurvey[]> {
  try {
    const text = await downloadAndParseFile(filePath, fileType);
    const surveys: CSATSurvey[] = [];
    
    if (fileType === 'csv' || fileType === 'txt') {
      const rows = parseCSV(text);
      
      rows.forEach((row, idx) => {
        const score = parseInt(row.score || row.csat || row.rating || '0');
        const comment = row.comment || row.comentario || row.feedback || row.text || '';
        const timestamp = row.timestamp || row.date || row.fecha || new Date().toISOString();
        
        if (score >= 0 && score <= 5) {
          surveys.push({
            id: `csat-${idx}`,
            score,
            comment: comment || undefined,
            timestamp,
            source: 'file',
          });
        }
      });
    } else if (fileType === 'json') {
      const data = JSON.parse(text);
      const items = Array.isArray(data) ? data : [data];
      
      items.forEach((item: any, idx: number) => {
        const score = parseInt(item.score || item.csat || item.rating || '0');
        const comment = item.comment || item.comentario || item.feedback || item.text || '';
        const timestamp = item.timestamp || item.date || item.fecha || new Date().toISOString();
        
        if (score >= 0 && score <= 5) {
          surveys.push({
            id: `csat-${idx}`,
            score,
            comment: comment || undefined,
            timestamp,
            source: 'file',
          });
        }
      });
    }
    
    return surveys;
  } catch (error: any) {
    console.error('Error procesando archivo CSAT:', error);
    throw new Error(`Error procesando archivo CSAT: ${error.message}`);
  }
}

/**
 * Procesa archivo de Tickets
 */
export async function processTicketsFile(filePath: string, fileType: string): Promise<Ticket[]> {
  try {
    const text = await downloadAndParseFile(filePath, fileType);
    const tickets: Ticket[] = [];
    
    if (fileType === 'csv' || fileType === 'txt') {
      const rows = parseCSV(text);
      
      rows.forEach((row, idx) => {
        const ticketNumber = row.id || row.ticket_id || row.number || row.ticket_number || `TICKET-${idx}`;
        const subject = row.subject || row.asunto || row.title || row.titulo || '';
        const description = row.description || row.descripcion || row.body || row.content || '';
        const status = row.status || row.estado || 'open';
        const priority = row.priority || row.prioridad || undefined;
        const timestamp = row.timestamp || row.date || row.fecha || row.created_at || new Date().toISOString();
        
        if (subject || description) {
          tickets.push({
            id: `ticket-${idx}`,
            ticket_number: ticketNumber,
            subject: subject || 'Sin asunto',
            description: description || '',
            status,
            priority,
            created_at: timestamp,
            source: 'file',
          });
        }
      });
    } else if (fileType === 'json') {
      const data = JSON.parse(text);
      const items = Array.isArray(data) ? data : [data];
      
      items.forEach((item: any, idx: number) => {
        const ticketNumber = item.id || item.ticket_id || item.number || item.ticket_number || `TICKET-${idx}`;
        const subject = item.subject || item.asunto || item.title || item.titulo || '';
        const description = item.description || item.descripcion || item.body || item.content || '';
        const status = item.status || item.estado || 'open';
        const priority = item.priority || item.prioridad || undefined;
        const timestamp = item.timestamp || item.date || item.fecha || item.created_at || new Date().toISOString();
        
        if (subject || description) {
          tickets.push({
            id: `ticket-${idx}`,
            ticket_number: ticketNumber,
            subject: subject || 'Sin asunto',
            description: description || '',
            status,
            priority,
            created_at: timestamp,
            source: 'file',
          });
        }
      });
    }
    
    return tickets;
  } catch (error: any) {
    console.error('Error procesando archivo de Tickets:', error);
    throw new Error(`Error procesando archivo de Tickets: ${error.message}`);
  }
}

/**
 * Procesa todos los archivos de una organización según sus data_sources
 */
export async function processAllFiles(organizationId: string): Promise<{
  nps: NPSSurvey[];
  csat: CSATSurvey[];
  tickets: Ticket[];
}> {
  const supabase = await createClient();
  
  // Obtener data sources con archivos
  const { data: dataSources, error } = await supabase
    .from('data_sources')
    .select('*')
    .eq('organization_id', organizationId)
    .not('file_path', 'is', null);
  
  if (error) {
    throw new Error(`Error obteniendo data sources: ${error.message}`);
  }
  
  const result = {
    nps: [] as NPSSurvey[],
    csat: [] as CSATSurvey[],
    tickets: [] as Ticket[],
  };
  
  // Procesar cada archivo
  for (const source of dataSources || []) {
    if (!source.file_path || !source.file_type) continue;
    
    try {
      if (source.source_type === 'nps') {
        const surveys = await processNPSFile(source.file_path, source.file_type);
        result.nps.push(...surveys);
      } else if (source.source_type === 'csat') {
        const surveys = await processCSATFile(source.file_path, source.file_type);
        result.csat.push(...surveys);
      } else if (source.source_type === 'tickets' && source.tickets_method === 'file') {
        const tickets = await processTicketsFile(source.file_path, source.file_type);
        result.tickets.push(...tickets);
      }
    } catch (error: any) {
      console.error(`Error procesando archivo ${source.source_name}:`, error);
      // Continuar con otros archivos aunque uno falle
    }
  }
  
  return result;
}


