/**
 * Parser de Archivos en Memoria
 * 
 * Parsea archivos CSV/JSON directamente desde File objects (sin guardar en Storage)
 */

'use server'

import { NPSSurvey, CSATSurvey, Ticket } from '@/app/agents/kepler/types';

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
 * Convierte un File a texto
 */
async function fileToText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = (e) => {
      reject(new Error('Error leyendo archivo'));
    };
    reader.readAsText(file);
  });
}

/**
 * Parsea un archivo NPS desde un File object
 */
export async function parseNPSFile(file: File, sourceId: string): Promise<NPSSurvey[]> {
  try {
    const text = await fileToText(file);
    const surveys: NPSSurvey[] = [];
    const fileType = file.name.split('.').pop()?.toLowerCase() || '';
    
    if (fileType === 'csv' || fileType === 'txt') {
      const rows = parseCSV(text);
      
      rows.forEach((row, idx) => {
        const score = parseInt(row.score || row.nps || row.rating || '0');
        const comment = row.comment || row.comentario || row.feedback || row.text || '';
        const timestamp = row.timestamp || row.date || row.fecha || new Date().toISOString();
        
        if (score >= 0 && score <= 10) {
          surveys.push({
            id: `${sourceId}-nps-${idx}`,
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
            id: `${sourceId}-nps-${idx}`,
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
    console.error('Error parseando archivo NPS:', error);
    throw new Error(`Error parseando archivo NPS: ${error.message}`);
  }
}

/**
 * Parsea un archivo CSAT desde un File object
 */
export async function parseCSATFile(file: File, sourceId: string): Promise<CSATSurvey[]> {
  try {
    const text = await fileToText(file);
    const surveys: CSATSurvey[] = [];
    const fileType = file.name.split('.').pop()?.toLowerCase() || '';
    
    if (fileType === 'csv' || fileType === 'txt') {
      const rows = parseCSV(text);
      
      rows.forEach((row, idx) => {
        const score = parseInt(row.score || row.csat || row.rating || '0');
        const comment = row.comment || row.comentario || row.feedback || row.text || '';
        const timestamp = row.timestamp || row.date || row.fecha || new Date().toISOString();
        
        if (score >= 0 && score <= 5) {
          surveys.push({
            id: `${sourceId}-csat-${idx}`,
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
            id: `${sourceId}-csat-${idx}`,
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
    console.error('Error parseando archivo CSAT:', error);
    throw new Error(`Error parseando archivo CSAT: ${error.message}`);
  }
}

/**
 * Parsea un archivo de Tickets desde un File object
 */
export async function parseTicketsFile(file: File, sourceId: string): Promise<Ticket[]> {
  try {
    const text = await fileToText(file);
    const tickets: Ticket[] = [];
    const fileType = file.name.split('.').pop()?.toLowerCase() || '';
    
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
            id: `${sourceId}-ticket-${idx}`,
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
            id: `${sourceId}-ticket-${idx}`,
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
    console.error('Error parseando archivo de Tickets:', error);
    throw new Error(`Error parseando archivo de Tickets: ${error.message}`);
  }
}

