/**
 * Server Action para enviar insights por email
 */

'use server'

import { Resend } from 'resend';
import { createClient } from '@/lib/supabase/server';
import { generateInsightEmail, generateInsightEmailText, SourceCounts } from '@/lib/email/templates';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendInsightEmailResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Envía un insight por email a los destinatarios configurados
 */
export async function sendInsightByEmail(
  insightId: string,
  organizationId: string
): Promise<SendInsightEmailResult> {
  
  try {
    const supabase = await createClient();
    
    // 1. Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'No estás autenticado' };
    }

    // 2. Obtener configuración de email
    const { data: reportSettings, error: settingsError } = await supabase
      .from('report_settings')
      .select('email_enabled, email_recipients, email_format')
      .eq('organization_id', organizationId)
      .single();

    if (settingsError || !reportSettings) {
      return { 
        success: false, 
        error: 'No se encontró la configuración de email. Por favor, configura tus preferencias de entrega primero.' 
      };
    }

    const settingsData = reportSettings as { email_enabled?: boolean; email_recipients?: string[]; email_format?: string; [key: string]: any };

    if (!settingsData.email_enabled) {
      return { 
        success: false, 
        error: 'El envío por email no está habilitado. Actívalo en la configuración de reportes.' 
      };
    }

    if (!settingsData.email_recipients || settingsData.email_recipients.length === 0) {
      return { 
        success: false, 
        error: 'No hay destinatarios de email configurados.' 
      };
    }

    // 3. Obtener el insight
    const { data: insight, error: insightError } = await supabase
      .from('insights')
      .select('*')
      .eq('id', insightId)
      .eq('organization_id', organizationId)
      .single();

    if (insightError || !insight) {
      return { success: false, error: 'No se encontró el insight' };
    }

    const insightData = insight as { detailed_analysis?: string; summary?: string; title?: string; priority?: string; generation_metadata?: any; [key: string]: any };

    // 4. Obtener información de la organización
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', organizationId)
      .single();

    if (orgError || !organization) {
      return { success: false, error: 'No se encontró la organización' };
    }

    const orgData = organization as { name: string; [key: string]: any };

    // 5. Extraer título del markdown
    const markdownContent = insightData.detailed_analysis || insightData.summary || '';
    const titleMatch = markdownContent.match(/(?:\*\*)?🎯\s*Foco del Día\s*\(P0\):\s*(.+?)(?:\*\*|$)/i);
    const title = titleMatch ? titleMatch[1].trim() : insightData.title || '';

    // 6. Extraer sourceCounts de generation_metadata
    const generationMetadata = insightData.generation_metadata as Record<string, any> | null;
    const sourceCounts: SourceCounts | undefined = generationMetadata?.sourceCounts;

    // 7. Formatear fecha
    const generatedAt = (insightData as { generated_at?: string | Date }).generated_at;
    const formattedDate = generatedAt ? new Date(generatedAt).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : new Date().toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // 8. Generar HTML y texto plano del email
    const emailHtml = generateInsightEmail({
      title,
      priority: (insightData.priority || 'medium') as 'low' | 'medium' | 'high' | 'critical',
      generatedAt: formattedDate,
      detailedAnalysis: markdownContent,
      organizationName: orgData.name,
      sourceCounts,
    });

    const emailText = generateInsightEmailText({
      title,
      priority: (insightData.priority || 'medium') as 'low' | 'medium' | 'high' | 'critical',
      generatedAt: formattedDate,
      detailedAnalysis: markdownContent,
      organizationName: orgData.name,
      sourceCounts,
    });

    // 9. Verificar que Resend esté configurado
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY no está configurada');
      return { 
        success: false, 
        error: 'API Key de Resend no configurada. Verifica tu archivo .env.local' 
      };
    }

    // 10. Obtener todos los correos del equipo desde la base de datos
    // Obtener emails de team_context
    const { data: teamContexts, error: teamContextsError } = await supabase
      .from('team_context')
      .select('email')
      .eq('organization_id', organizationId)
      .not('email', 'is', null);

    // Obtener emails de organization_members (a través de profiles)
    const { data: organizationMembers, error: membersError } = await supabase
      .from('organization_members')
      .select(`
        *,
        profiles:user_id (
          email
        )
      `)
      .eq('organization_id', organizationId);

    // Combinar todos los correos del equipo
    const teamEmails = new Set<string>();
    
    // Agregar emails de team_context
    if (teamContexts && !teamContextsError) {
      (teamContexts as any[]).forEach((tc: any) => {
        const email = tc.email?.trim().toLowerCase();
        if (email && email.includes('@')) {
          teamEmails.add(email);
        }
      });
    }

    // Agregar emails de organization_members
    if (organizationMembers && !membersError) {
      (organizationMembers as any[]).forEach((member: any) => {
        const email = member.profiles?.email?.trim().toLowerCase();
        if (email && email.includes('@')) {
          teamEmails.add(email);
        }
      });
    }

    // 11. Combinar correos del equipo con correos externos configurados
    const allRecipients = new Set<string>();
    
    // Agregar correos del equipo
    teamEmails.forEach(email => allRecipients.add(email));
    
    // Agregar correos externos configurados (que no sean del equipo)
    settingsData.email_recipients?.forEach((email: string) => {
      const emailLower = email.trim().toLowerCase();
      if (emailLower && emailLower.includes('@')) {
        allRecipients.add(emailLower);
      }
    });

    // Convertir a array y validar
    const validRecipients = Array.from(allRecipients).filter(email => {
      // Validar formato básico de email
      return email && email.includes('@') && email.length > 3;
    });

    if (validRecipients.length === 0) {
      return {
        success: false,
        error: 'No se encontraron destinatarios válidos. Asegúrate de tener miembros del equipo con correos configurados o agrega correos externos en la configuración de reportes.'
      };
    }

    // 12. Preparar configuración del email
    // IMPORTANTE: El dominio debe estar verificado en Resend (iskepler.com)
    // Formato: "Nombre <email@dominio-verificado.com>"
    // Si el dominio está verificado, puedes usar cualquier email@iskepler.com
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Kepler <hola@iskepler.com>';
    
    console.log('📧 Intentando enviar email...');
    console.log('   From:', fromEmail);
    console.log('   To (destinatarios):', validRecipients);
    console.log('   Total destinatarios:', validRecipients.length);
    console.log('   Subject:', `📊 Nuevo Insight: ${title}`);
    console.log('   HTML length:', emailHtml.length, 'chars');

    // 13. Enviar email usando formato oficial de Resend a todos los destinatarios
    try {
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: validRecipients, // Todos los correos del equipo y externos configurados
        subject: `📊 Nuevo Insight: ${title}`,
        html: emailHtml,
        text: emailText,
      });

      if (error) {
        console.error('❌ Error de Resend:', error);
        console.error('   Tipo:', typeof error);
        console.error('   Detalles:', JSON.stringify(error, null, 2));
        return { 
          success: false, 
          error: error.message || JSON.stringify(error) || 'Error al enviar el email' 
        };
      }

      if (!data) {
        console.error('❌ No se recibió data de Resend (pero tampoco hubo error)');
        return { 
          success: false, 
          error: 'No se recibió respuesta del servicio de email. Verifica los logs del servidor.' 
        };
      }

      console.log('✅ Email enviado exitosamente');
      console.log('📧 ID del email:', data.id);
      console.log('📬 Destinatarios:', validRecipients);
      
      const successMessage = `Reporte enviado exitosamente a ${validRecipients.length} destinatario(s): ${validRecipients.join(', ')}. ID: ${data.id}`;

      return { 
        success: true, 
        message: successMessage
      };

    } catch (error: any) {
      console.error('❌ Excepción al enviar email:', error);
      console.error('   Stack:', error.stack);
      return { 
        success: false, 
        error: error.message || 'Error inesperado al enviar el email' 
      };
    }

  } catch (error: any) {
    console.error('❌ Error enviando email:', error);
    return { 
      success: false, 
      error: error.message || 'Error al enviar el email' 
    };
  }
}

