-- ============================================
-- FIX: Infinite Recursion en RLS Policies de onboarding_progress
-- ============================================
-- Este script corrige el problema de recursión infinita en las políticas RLS
-- El problema ocurre cuando las políticas consultan organization_members
-- que a su vez tiene políticas que consultan otras tablas
-- ============================================

-- SOLUCIÓN: Simplificar las políticas de onboarding_progress
-- Solo verificar si el usuario es owner de la organización
-- Para miembros del equipo, se puede agregar después si es necesario

-- Eliminar políticas existentes de onboarding_progress
DROP POLICY IF EXISTS "Users can view onboarding progress from their organizations" ON onboarding_progress;
DROP POLICY IF EXISTS "Users can insert onboarding progress for their organizations" ON onboarding_progress;
DROP POLICY IF EXISTS "Users can update onboarding progress from their organizations" ON onboarding_progress;

-- Crear políticas simplificadas que solo verifican ownership
-- Esto evita la recursión porque no consulta organization_members

CREATE POLICY "Users can view onboarding progress from their organizations"
ON onboarding_progress FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM organizations
    WHERE organizations.id = onboarding_progress.organization_id
    AND organizations.owner_id = auth.uid()
  )
);

CREATE POLICY "Users can insert onboarding progress for their organizations"
ON onboarding_progress FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM organizations
    WHERE organizations.id = onboarding_progress.organization_id
    AND organizations.owner_id = auth.uid()
  )
);

CREATE POLICY "Users can update onboarding progress from their organizations"
ON onboarding_progress FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM organizations
    WHERE organizations.id = onboarding_progress.organization_id
    AND organizations.owner_id = auth.uid()
  )
);

