-- ============================================
-- VERIFICAR Y CORREGIR: Políticas RLS de report_settings
-- ============================================
-- Este script verifica y corrige las políticas RLS para report_settings
-- Asegúrate de ejecutarlo en Supabase SQL Editor
-- ============================================

-- 1. Verificar políticas actuales
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'report_settings';

-- 2. Eliminar TODAS las políticas existentes de report_settings
DROP POLICY IF EXISTS "Users can view report settings from their organizations" ON report_settings;
DROP POLICY IF EXISTS "Users can insert report settings for their organizations" ON report_settings;
DROP POLICY IF EXISTS "Users can update report settings from their organizations" ON report_settings;
DROP POLICY IF EXISTS "Users can delete report settings from their organizations" ON report_settings;

-- 3. Crear políticas simplificadas que solo verifican ownership
-- Esto evita la recursión porque no consulta organization_members

CREATE POLICY "Users can view report settings from their organizations"
ON report_settings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM organizations
    WHERE organizations.id = report_settings.organization_id
    AND organizations.owner_id = auth.uid()
  )
);

CREATE POLICY "Users can insert report settings for their organizations"
ON report_settings FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM organizations
    WHERE organizations.id = report_settings.organization_id
    AND organizations.owner_id = auth.uid()
  )
);

CREATE POLICY "Users can update report settings from their organizations"
ON report_settings FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM organizations
    WHERE organizations.id = report_settings.organization_id
    AND organizations.owner_id = auth.uid()
  )
);

CREATE POLICY "Users can delete report settings from their organizations"
ON report_settings FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM organizations
    WHERE organizations.id = report_settings.organization_id
    AND organizations.owner_id = auth.uid()
  )
);

-- 4. Verificar que las políticas se crearon correctamente
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'report_settings';

