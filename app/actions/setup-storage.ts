/**
 * Setup de Supabase Storage
 * 
 * Helper para verificar y crear el bucket 'data-sources' si no existe
 */

'use server'

import { createClient } from '@/lib/supabase/server';

const BUCKET_NAME = 'data-sources';

/**
 * Verifica si el bucket existe y lo crea si no existe
 * Nota: Requiere permisos de service_role para crear buckets
 * Si falla, el usuario debe crearlo manualmente en Supabase Dashboard
 */
export async function ensureStorageBucket(): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  try {
    // Intentar listar buckets para verificar si existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      // Si no podemos listar buckets, intentar crear directamente
      console.warn('No se pudo listar buckets, intentando crear directamente:', listError.message);
    } else {
      // Verificar si el bucket ya existe
      const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
      if (bucketExists) {
        return { success: true };
      }
    }

    // Intentar crear el bucket
    // Nota: Esto puede fallar si se usa anon key en lugar de service_role
    const { data: createData, error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: false, // Bucket privado
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['text/csv', 'application/json', 'text/plain', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'],
    });

    if (createError) {
      // Si falla, probablemente es porque necesitamos service_role key
      // Retornamos un error específico para que el usuario pueda crear el bucket manualmente
      return {
        success: false,
        error: `No se pudo crear el bucket automáticamente: ${createError.message}. Por favor, crea el bucket '${BUCKET_NAME}' manualmente en Supabase Dashboard (Storage > New bucket).`,
      };
    }

    // Configurar políticas RLS para el bucket (si es necesario)
    // Esto también puede fallar con anon key, pero es opcional
    try {
      // Las políticas se configuran mejor desde el SQL Editor
      // Aquí solo verificamos que el bucket fue creado
    } catch (policyError) {
      console.warn('No se pudieron configurar políticas automáticamente:', policyError);
    }

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: `Error al verificar/crear bucket: ${error.message}`,
    };
  }
}

