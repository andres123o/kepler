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

    // 10. Obtener el email del usuario autenticado (para validar restricción de Resend)
    // Con el plan gratuito de Resend, solo puedes enviar a tu propia dirección de email
    // Puedes configurar RESEND_TEST_EMAIL en .env.local si quieres usar otro email
    const allowedTestEmail = process.env.RESEND_TEST_EMAIL || user.email;
    
    if (!allowedTestEmail) {
      return {
        success: false,
        error: 'No se pudo determinar el email autorizado para pruebas. Por favor, configura RESEND_TEST_EMAIL en .env.local'
      };
    }
    
    // 11. Filtrar destinatarios: solo permitir emails válidos para pruebas
    // Resend plan gratuito solo permite enviar al email de la cuenta
    const validRecipients = settingsData.email_recipients?.filter((email: string) => {
      // Permitir si es el email autorizado o si está en modo producción (con dominio verificado)
      return email.toLowerCase() === allowedTestEmail.toLowerCase();
    });

    if (!validRecipients || validRecipients.length === 0) {
      const recipientsList = settingsData.email_recipients?.join(', ') || '';
      return {
        success: false,
        error: `⚠️ Limitación de prueba: Con el plan gratuito de Resend, solo puedes enviar emails a tu propia dirección de email (${allowedTestEmail}). Los destinatarios configurados (${recipientsList}) no coinciden. Para enviar a otros destinatarios, verifica un dominio en resend.com/domains`
      };
    }

    // 12. Preparar configuración del email
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Kepler <onboarding@resend.dev>';
    
    console.log('📧 Intentando enviar email...');
    console.log('   From:', fromEmail);
    console.log('   To (válidos):', validRecipients);
      console.log('   To (originales):', settingsData.email_recipients);
    console.log('   Subject:', `📊 Nuevo Insight: ${title}`);
    console.log('   HTML length:', emailHtml.length, 'chars');

    // 13. Enviar email usando formato oficial de Resend (solo a destinatarios válidos)
    try {
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: validRecipients, // Solo emails autorizados para pruebas
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
      console.log('📬 Destinatarios válidos:', validRecipients);
      
      // Si se filtraron algunos destinatarios, informar al usuario
      const filteredCount = (settingsData.email_recipients?.length || 0) - validRecipients.length;
      let successMessage = `Reporte enviado exitosamente a ${validRecipients.join(', ')}. ID: ${data.id}`;
      
      if (filteredCount > 0) {
        successMessage += `\n\n⚠️ Nota: ${filteredCount} destinatario(s) fueron omitidos porque con el plan gratuito de Resend solo puedes enviar a tu propia dirección de email. Para enviar a otros destinatarios, verifica un dominio en resend.com/domains`;
      }

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

