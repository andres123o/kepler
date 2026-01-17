-- ============================================
-- FIX: Infinite Recursion en RLS Policies de report_settings
-- ============================================
-- Este script corrige el problema de recursión infinita en las políticas RLS
-- El problema ocurre cuando las políticas consultan organization_members
-- que a su vez tiene políticas que consultan otras tablas
-- ============================================

-- SOLUCIÓN: Simplificar las políticas de report_settings
-- Solo verificar si el usuario es owner de la organización
-- Para miembros del equipo, se puede agregar después si es necesario

-- Eliminar políticas existentes de report_settings
DROP POLICY IF EXISTS "Users can view report settings from their organizations" ON report_settings;
DROP POLICY IF EXISTS "Users can insert report settings for their organizations" ON report_settings;
DROP POLICY IF EXISTS "Users can update report settings from their organizations" ON report_settings;
DROP POLICY IF EXISTS "Users can delete report settings from their organizations" ON report_settings;

-- Crear políticas simplificadas que solo verifican ownership
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

