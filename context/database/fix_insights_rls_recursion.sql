-- ============================================
-- FIX: Infinite Recursion en RLS Policies para insights
-- ============================================
-- Este script corrige el problema de recursión infinita en las políticas RLS
-- El problema ocurre cuando las políticas de insights consultan organization_members
-- que a su vez tiene políticas que causan recursión circular
-- ============================================

-- SOLUCIÓN: Simplificar las políticas de insights
-- Solo verificar si el usuario es owner de la organización
-- Para miembros del equipo, se puede agregar después si es necesario

-- Eliminar políticas existentes de insights
DROP POLICY IF EXISTS "Users can view insights from their organizations" ON insights;
DROP POLICY IF EXISTS "Users can insert insights in their organizations" ON insights;
DROP POLICY IF EXISTS "Users can update insights from their organizations" ON insights;
DROP POLICY IF EXISTS "Users can delete insights from their organizations" ON insights;

-- Crear políticas simplificadas que solo verifican ownership
-- Esto evita la recursión porque no consulta organization_members
CREATE POLICY "Users can view insights from their organizations"
ON insights FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM organizations 
    WHERE organizations.id = insights.organization_id 
    AND organizations.owner_id = auth.uid()
  )
);

CREATE POLICY "Users can insert insights in their organizations"
ON insights FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM organizations 
    WHERE organizations.id = insights.organization_id 
    AND organizations.owner_id = auth.uid()
  )
);

CREATE POLICY "Users can update insights from their organizations"
ON insights FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM organizations 
    WHERE organizations.id = insights.organization_id 
    AND organizations.owner_id = auth.uid()
  )
);

CREATE POLICY "Users can delete insights from their organizations"
ON insights FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM organizations 
    WHERE organizations.id = insights.organization_id 
    AND organizations.owner_id = auth.uid()
  )
);













