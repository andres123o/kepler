-- ============================================
-- FIX: Infinite Recursion en RLS Policies de data_sources
-- ============================================
-- Este script corrige el problema de recursión infinita en las políticas RLS
-- El problema ocurre cuando las políticas consultan organization_members
-- que a su vez tiene políticas que consultan otras tablas
-- ============================================

-- SOLUCIÓN: Simplificar las políticas de data_sources
-- Solo verificar si el usuario es owner de la organización
-- Para miembros del equipo, se puede agregar después si es necesario

-- Eliminar políticas existentes de data_sources
DROP POLICY IF EXISTS "Users can view data sources from their organizations" ON data_sources;
DROP POLICY IF EXISTS "Users can insert data sources in their organizations" ON data_sources;
DROP POLICY IF EXISTS "Users can update data sources from their organizations" ON data_sources;
DROP POLICY IF EXISTS "Users can delete data sources from their organizations" ON data_sources;

-- Crear políticas simplificadas que solo verifican ownership
-- Esto evita la recursión porque no consulta organization_members

CREATE POLICY "Users can view data sources from their organizations"
ON data_sources FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM organizations
    WHERE organizations.id = data_sources.organization_id
    AND organizations.owner_id = auth.uid()
  )
);

CREATE POLICY "Users can insert data sources in their organizations"
ON data_sources FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM organizations
    WHERE organizations.id = data_sources.organization_id
    AND organizations.owner_id = auth.uid()
  )
);

CREATE POLICY "Users can update data sources from their organizations"
ON data_sources FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM organizations
    WHERE organizations.id = data_sources.organization_id
    AND organizations.owner_id = auth.uid()
  )
);

CREATE POLICY "Users can delete data sources from their organizations"
ON data_sources FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM organizations
    WHERE organizations.id = data_sources.organization_id
    AND organizations.owner_id = auth.uid()
  )
);

