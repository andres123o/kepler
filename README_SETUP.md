# Setup de Supabase para Kepler

## Paso 1: Crear proyecto en Supabase

1. Ve a [https://app.supabase.com](https://app.supabase.com)
2. Crea un nuevo proyecto
3. Anota tu **Project URL** y **anon key** (los encontrarás en Settings > API)

## Paso 2: Configurar variables de entorno

1. Copia `.env.local.example` a `.env.local`
2. Agrega tus credenciales de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

## Paso 3: Crear tablas y políticas en Supabase

**IMPORTANTE:** Si las tablas `profiles` y `organizations` ya existen, solo necesitas ejecutar el archivo `SUPABASE_SETUP_COMPLETE.sql` que contiene todas las políticas corregidas.

Ejecuta el archivo completo `SUPABASE_SETUP_COMPLETE.sql` en el SQL Editor de Supabase. Este archivo incluye:

1. ✅ Creación de tabla `organization_members` (si no existe)
2. ✅ Políticas RLS corregidas para `profiles`
3. ✅ Políticas RLS corregidas para `organizations`
4. ✅ Políticas RLS completas para `organization_members`
5. ✅ Función y trigger para crear perfil automáticamente

**Nota:** El archivo usa `CREATE POLICY IF NOT EXISTS` para evitar errores si las políticas ya existen.

## Paso 3.5: Crear bucket de Storage en Supabase

Para que la aplicación pueda subir archivos CSV, JSON y otros formatos, necesitas crear un bucket en Supabase Storage:

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **Storage** en el menú lateral
3. Haz clic en **"New bucket"** o **"Crear bucket"**
4. Configura el bucket con estos valores:
   - **Name:** `data-sources` (exactamente así, sin espacios)
   - **Public bucket:** NO (déjalo desmarcado, es un bucket privado)
   - **File size limit:** 10 MB
   - **Allowed MIME types:** (opcional) Puedes dejarlo vacío o agregar:
     - `text/csv`
     - `application/json`
     - `text/plain`
     - `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
     - `application/vnd.ms-excel`

5. Haz clic en **"Create bucket"**

**Nota:** La aplicación intentará crear el bucket automáticamente si no existe, pero esto puede fallar si no tienes configurada la `service_role` key. En ese caso, crea el bucket manualmente siguiendo los pasos anteriores.

### Configurar políticas RLS para el bucket (Opcional)

Si necesitas que los usuarios solo puedan subir archivos de sus propias organizaciones, ejecuta este SQL en el SQL Editor:

```sql
-- Permitir a los usuarios autenticados subir archivos al bucket
CREATE POLICY "Users can upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'data-sources');

-- Permitir a los usuarios autenticados leer sus propios archivos
CREATE POLICY "Users can read their files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'data-sources');

-- Permitir a los usuarios autenticados eliminar sus propios archivos
CREATE POLICY "Users can delete their files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'data-sources');
```

## Paso 4: Configurar OAuth (Google) - Opcional

1. En Supabase, ve a Authentication > Providers
2. Habilita Google
3. Agrega tus credenciales de Google OAuth (Client ID y Secret)
4. Agrega la URL de callback: `http://localhost:3000/auth/callback` (dev) y tu dominio en producción

## Paso 5: Instalar dependencias

```bash
npm install
```

## Paso 6: Ejecutar el proyecto

```bash
npm run dev
```

## Notas importantes

- El trigger `handle_new_user` crea automáticamente el perfil cuando un usuario se registra
- Las organizaciones se crean manualmente en el código después del registro
- RLS (Row Level Security) está habilitado para proteger los datos
- Para producción, asegúrate de actualizar las URLs de callback en OAuth

