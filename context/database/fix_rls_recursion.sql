-- ============================================
-- FIX: Infinite Recursion en RLS Policies
-- ============================================
-- Este script corrige el problema de recursión infinita en las políticas RLS
-- El problema ocurre cuando las políticas consultan organization_members
-- que a su vez tiene políticas que consultan otras tablas
-- ============================================

-- SOLUCIÓN: Simplificar las políticas de business_context
-- Solo verificar si el usuario es owner de la organización
-- Para miembros del equipo, se puede agregar después si es necesario

-- Eliminar políticas existentes de business_context
DROP POLICY IF EXISTS "Users can view business context from their organizations" ON business_context;
DROP POLICY IF EXISTS "Users can insert business context in their organizations" ON business_context;
DROP POLICY IF EXISTS "Users can update business context from their organizations" ON business_context;
DROP POLICY IF EXISTS "Users can delete business context from their organizations" ON business_context;

-- Crear políticas simplificadas que solo verifican ownership
-- Esto evita la recursión porque no consulta organization_members

CREATE POLICY "Users can view business context from their organizations"
ON business_context FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM organizations 
    WHERE organizations.id = business_context.organization_id 
    AND organizations.owner_id = auth.uid()
  )
);

CREATE POLICY "Users can insert business context in their organizations"
ON business_context FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM organizations 
    WHERE organizations.id = business_context.organization_id 
    AND organizations.owner_id = auth.uid()
  )
  AND created_by = auth.uid()
);

CREATE POLICY "Users can update business context from their organizations"
ON business_context FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM organizations 
    WHERE organizations.id = business_context.organization_id 
    AND organizations.owner_id = auth.uid()
  )
);

CREATE POLICY "Users can delete business context from their organizations"
ON business_context FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM organizations 
    WHERE organizations.id = business_context.organization_id 
    AND organizations.owner_id = auth.uid()
  )
);

