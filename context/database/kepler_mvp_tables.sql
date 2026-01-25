-- ============================================
-- KEPLER MVP - TABLAS DE BASE DE DATOS
-- ============================================
-- Este archivo contiene todas las tablas creadas para el MVP de Kepler
-- Fecha de creación: 2024
-- Base de datos: Supabase (PostgreSQL)
-- ============================================

-- ============================================
-- TABLA 1: business_context
-- ============================================
-- Propósito: Almacenar contexto de negocio flexible definido por el usuario
-- Relación: Una organización puede tener múltiples contextos
-- Uso: Paso 1 del onboarding - El usuario puede crear múltiples entradas
--      con nombre y contenido personalizados (ej: "Misión", "Visión Q1 2024", "Métricas clave")
-- ============================================

CREATE TABLE IF NOT EXISTS business_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL, -- Nombre del contexto que el usuario define (ej: "Misión", "Visión Q1 2024", "Métricas clave")
  content TEXT NOT NULL, -- Contenido/texto del contexto
  metadata JSONB, -- Datos adicionales opcionales (métricas estructuradas, fechas, etc.)
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_business_context_org ON business_context(organization_id);
CREATE INDEX IF NOT EXISTS idx_business_context_created_by ON business_context(created_by);
CREATE INDEX IF NOT EXISTS idx_business_context_created_at ON business_context(created_at DESC);

-- RLS
ALTER TABLE business_context ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
DROP POLICY IF EXISTS "Users can view business context from their organizations" ON business_context;
CREATE POLICY "Users can view business context from their organizations"
ON business_context FOR SELECT
USING (
  organization_id IN (
    SELECT id FROM organizations WHERE owner_id = auth.uid()
    UNION
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can insert business context in their organizations" ON business_context;
CREATE POLICY "Users can insert business context in their organizations"
ON business_context FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT id FROM organizations WHERE owner_id = auth.uid()
    UNION
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
  AND created_by = auth.uid()
);

DROP POLICY IF EXISTS "Users can update business context from their organizations" ON business_context;
CREATE POLICY "Users can update business context from their organizations"
ON business_context FOR UPDATE
USING (
  organization_id IN (
    SELECT id FROM organizations WHERE owner_id = auth.uid()
    UNION
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can delete business context from their organizations" ON business_context;
CREATE POLICY "Users can delete business context from their organizations"
ON business_context FOR DELETE
USING (
  organization_id IN (
    SELECT id FROM organizations WHERE owner_id = auth.uid()
    UNION
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_business_context_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_business_context_updated_at ON business_context;
CREATE TRIGGER trigger_update_business_context_updated_at
  BEFORE UPDATE ON business_context
  FOR EACH ROW
  EXECUTE FUNCTION update_business_context_updated_at();

-- Comentarios
COMMENT ON TABLE business_context IS 'Almacena contexto de negocio flexible definido por el usuario';
COMMENT ON COLUMN business_context.name IS 'Nombre del contexto definido por el usuario (ej: "Misión", "Visión Q1 2024")';
COMMENT ON COLUMN business_context.content IS 'Contenido/texto del contexto de negocio';
COMMENT ON COLUMN business_context.metadata IS 'Datos adicionales opcionales en formato JSON (métricas, fechas, etc.)';

-- ============================================
-- TABLA 2: onboarding_progress
-- ============================================
-- Propósito: Trackear el progreso del onboarding de cada organización
-- Relación: Una organización tiene un único registro de progreso (1:1)
-- Uso: Controla qué pasos del onboarding están completados
--      Paso 1: business_context
--      Paso 2: organization_members (tabla existente)
--      Paso 3: data_sources
--      Paso 4: report_settings
-- ============================================

CREATE TABLE IF NOT EXISTS onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Progreso de cada paso
  step_1_completed BOOLEAN DEFAULT FALSE, -- business_context
  step_1_completed_at TIMESTAMPTZ,
  
  step_2_completed BOOLEAN DEFAULT FALSE, -- team (organization_members)
  step_2_completed_at TIMESTAMPTZ,
  
  step_3_completed BOOLEAN DEFAULT FALSE, -- data_sources
  step_3_completed_at TIMESTAMPTZ,
  
  step_4_completed BOOLEAN DEFAULT FALSE, -- report_settings
  step_4_completed_at TIMESTAMPTZ,
  
  all_steps_completed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_org ON onboarding_progress(organization_id);

-- RLS
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
DROP POLICY IF EXISTS "Users can view onboarding progress from their organizations" ON onboarding_progress;
CREATE POLICY "Users can view onboarding progress from their organizations"
ON onboarding_progress FOR SELECT
USING (
  organization_id IN (
    SELECT id FROM organizations WHERE owner_id = auth.uid()
    UNION
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can insert onboarding progress for their organizations" ON onboarding_progress;
CREATE POLICY "Users can insert onboarding progress for their organizations"
ON onboarding_progress FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT id FROM organizations WHERE owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can update onboarding progress from their organizations" ON onboarding_progress;
CREATE POLICY "Users can update onboarding progress from their organizations"
ON onboarding_progress FOR UPDATE
USING (
  organization_id IN (
    SELECT id FROM organizations WHERE owner_id = auth.uid()
    UNION
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Función para actualizar updated_at y all_steps_completed_at
CREATE OR REPLACE FUNCTION update_onboarding_progress()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  
  -- Si todos los pasos están completados, actualizar all_steps_completed_at
  IF NEW.step_1_completed = TRUE 
     AND NEW.step_2_completed = TRUE 
     AND NEW.step_3_completed = TRUE 
     AND NEW.step_4_completed = TRUE 
     AND OLD.all_steps_completed_at IS NULL THEN
    NEW.all_steps_completed_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
DROP TRIGGER IF EXISTS trigger_update_onboarding_progress ON onboarding_progress;
CREATE TRIGGER trigger_update_onboarding_progress
  BEFORE UPDATE ON onboarding_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_onboarding_progress();

-- Función helper para marcar paso como completado
CREATE OR REPLACE FUNCTION mark_onboarding_step_completed(
  p_organization_id UUID,
  p_step_number INTEGER
)
RETURNS VOID AS $$
BEGIN
  IF p_step_number = 1 THEN
    UPDATE onboarding_progress
    SET step_1_completed = TRUE, step_1_completed_at = NOW()
    WHERE organization_id = p_organization_id;
  ELSIF p_step_number = 2 THEN
    UPDATE onboarding_progress
    SET step_2_completed = TRUE, step_2_completed_at = NOW()
    WHERE organization_id = p_organization_id;
  ELSIF p_step_number = 3 THEN
    UPDATE onboarding_progress
    SET step_3_completed = TRUE, step_3_completed_at = NOW()
    WHERE organization_id = p_organization_id;
  ELSIF p_step_number = 4 THEN
    UPDATE onboarding_progress
    SET step_4_completed = TRUE, step_4_completed_at = NOW()
    WHERE organization_id = p_organization_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TABLA 3: data_sources
-- ============================================
-- Propósito: Almacenar referencias/configuración de fuentes de datos (NO los datos en sí)
-- Relación: Una organización puede tener múltiples fuentes de datos
-- Uso: Paso 3 del onboarding
--      Tipos de fuentes:
--        - social: Instagram, LinkedIn (guardamos usuario y URL, NO los datos de scraping)
--        - app_store: Play Store, App Store (guardamos URL, NO los comentarios)
--        - nps/csat: Archivos subidos (guardamos ruta, NO el contenido)
--        - tickets_api: Conexión a Zendesk, HubSpot (guardamos credenciales, NO los tickets)
--        - tickets_file: Archivo de tickets (guardamos ruta, NO el contenido)
-- ============================================

CREATE TABLE IF NOT EXISTS data_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('social', 'app_store', 'nps', 'csat', 'tickets_api', 'tickets_file')),
  source_name TEXT NOT NULL, -- "Instagram", "LinkedIn", "Play Store", "App Store", "NPS", "CSAT", "Zendesk", etc.
  
  -- Para REDES SOCIALES (Instagram, LinkedIn, etc.)
  social_platform TEXT CHECK (social_platform IN ('instagram', 'linkedin')), -- Extensible después
  social_username TEXT,
  social_profile_url TEXT,
  
  -- Para APP STORES (Play Store, App Store)
  app_store_type TEXT CHECK (app_store_type IN ('play_store', 'app_store')),
  app_url TEXT,
  
  -- Para NPS y CSAT (archivos)
  nps_csat_type TEXT CHECK (nps_csat_type IN ('nps', 'csat')),
  file_path TEXT, -- Ruta en Supabase Storage
  file_name TEXT,
  file_type TEXT, -- 'csv', 'json', 'txt', etc.
  file_size BIGINT,
  
  -- Para TICKETS (API o archivo)
  api_provider TEXT, -- 'zendesk', 'hubspot', 'custom', etc.
  api_endpoint TEXT,
  api_credentials_encrypted TEXT, -- Credenciales encriptadas
  api_config JSONB, -- Configuración adicional (filtros, etc.)
  
  -- Metadata común
  uploaded_by UUID REFERENCES profiles(id),
  last_processed_at TIMESTAMPTZ, -- Última vez que se procesó/trajo la data
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'error')),
  processing_error TEXT, -- Último error si falla
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints para validar que los campos correctos estén presentes según el tipo
  CONSTRAINT social_fields_check CHECK (
    (source_type = 'social' AND social_platform IS NOT NULL AND (social_username IS NOT NULL OR social_profile_url IS NOT NULL)) OR
    (source_type != 'social')
  ),
  CONSTRAINT app_store_fields_check CHECK (
    (source_type = 'app_store' AND app_store_type IS NOT NULL AND app_url IS NOT NULL) OR
    (source_type != 'app_store')
  ),
  CONSTRAINT nps_csat_fields_check CHECK (
    (source_type IN ('nps', 'csat') AND nps_csat_type IS NOT NULL AND file_path IS NOT NULL) OR
    (source_type NOT IN ('nps', 'csat'))
  ),
  CONSTRAINT tickets_api_fields_check CHECK (
    (source_type = 'tickets_api' AND api_provider IS NOT NULL) OR
    (source_type != 'tickets_api')
  ),
  CONSTRAINT tickets_file_fields_check CHECK (
    (source_type = 'tickets_file' AND file_path IS NOT NULL) OR
    (source_type != 'tickets_file')
  ),
  -- Constraint: Solo un NPS y un CSAT por organización
  CONSTRAINT unique_nps_csat_per_org UNIQUE (organization_id, nps_csat_type)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_data_sources_org ON data_sources(organization_id);
CREATE INDEX IF NOT EXISTS idx_data_sources_type ON data_sources(source_type);
CREATE INDEX IF NOT EXISTS idx_data_sources_processing_status ON data_sources(processing_status);
CREATE INDEX IF NOT EXISTS idx_data_sources_last_processed ON data_sources(last_processed_at DESC);
CREATE INDEX IF NOT EXISTS idx_data_sources_created_at ON data_sources(created_at DESC);

-- RLS
ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
DROP POLICY IF EXISTS "Users can view data sources from their organizations" ON data_sources;
CREATE POLICY "Users can view data sources from their organizations"
ON data_sources FOR SELECT
USING (
  organization_id IN (
    SELECT id FROM organizations WHERE owner_id = auth.uid()
    UNION
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can insert data sources in their organizations" ON data_sources;
CREATE POLICY "Users can insert data sources in their organizations"
ON data_sources FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT id FROM organizations WHERE owner_id = auth.uid()
    UNION
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can update data sources from their organizations" ON data_sources;
CREATE POLICY "Users can update data sources from their organizations"
ON data_sources FOR UPDATE
USING (
  organization_id IN (
    SELECT id FROM organizations WHERE owner_id = auth.uid()
    UNION
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can delete data sources from their organizations" ON data_sources;
CREATE POLICY "Users can delete data sources from their organizations"
ON data_sources FOR DELETE
USING (
  organization_id IN (
    SELECT id FROM organizations WHERE owner_id = auth.uid()
    UNION
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
  )
);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_data_sources_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_data_sources_updated_at ON data_sources;
CREATE TRIGGER trigger_update_data_sources_updated_at
  BEFORE UPDATE ON data_sources
  FOR EACH ROW
  EXECUTE FUNCTION update_data_sources_updated_at();

-- Comentarios
COMMENT ON TABLE data_sources IS 'Almacena referencias y configuración de fuentes de datos (NO los datos en sí)';
COMMENT ON COLUMN data_sources.source_type IS 'Tipo: social, app_store, nps, csat, tickets_api, tickets_file';
COMMENT ON COLUMN data_sources.last_processed_at IS 'Última vez que se procesó/trajo la data de esta fuente';
COMMENT ON COLUMN data_sources.processing_status IS 'Estado del procesamiento: pending, processing, completed, error';

-- ============================================
-- TABLA 4: report_settings
-- ============================================
-- Propósito: Configurar cómo la organización recibe reportes e insights
-- Relación: Una organización tiene una única configuración de reportes (1:1)
-- Uso: Paso 4 del onboarding
--      Canales disponibles: platform (siempre), slack, email, webhook
-- ============================================

CREATE TABLE IF NOT EXISTS report_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Canales de entrega (array de opciones)
  delivery_channels TEXT[] NOT NULL DEFAULT ARRAY['platform'], -- ['platform', 'slack', 'email', 'webhook']
  
  -- Configuración por canal
  -- Platform siempre está habilitado (no necesita config)
  
  -- Slack
  slack_enabled BOOLEAN DEFAULT FALSE,
  slack_webhook_url TEXT,
  slack_channel TEXT, -- '#insights' o canal personalizado
  slack_frequency TEXT DEFAULT 'daily' CHECK (slack_frequency IN ('realtime', 'hourly', 'daily', 'weekly')),
  
  -- Email
  email_enabled BOOLEAN DEFAULT FALSE,
  email_recipients TEXT[], -- Array de emails
  email_frequency TEXT DEFAULT 'weekly' CHECK (email_frequency IN ('daily', 'weekly', 'monthly')),
  email_format TEXT DEFAULT 'summary' CHECK (email_format IN ('summary', 'detailed')),
  
  -- Webhook
  webhook_enabled BOOLEAN DEFAULT FALSE,
  webhook_url TEXT,
  webhook_secret TEXT, -- Para validar requests
  webhook_events TEXT[], -- ['new_insight', 'critical_alert', 'weekly_report']
  
  -- Filtros globales
  min_priority TEXT DEFAULT 'medium' CHECK (min_priority IN ('low', 'medium', 'high', 'critical')),
  categories_filter TEXT[], -- Solo insights de estas categorías (opcional, si está vacío = todos)
  
  -- Frecuencia general (para platform)
  platform_frequency TEXT DEFAULT 'realtime' CHECK (platform_frequency IN ('realtime', 'hourly', 'daily')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT slack_config_check CHECK (
    (slack_enabled = TRUE AND slack_webhook_url IS NOT NULL) OR
    (slack_enabled = FALSE)
  ),
  CONSTRAINT email_config_check CHECK (
    (email_enabled = TRUE AND array_length(email_recipients, 1) > 0) OR
    (email_enabled = FALSE)
  ),
  CONSTRAINT webhook_config_check CHECK (
    (webhook_enabled = TRUE AND webhook_url IS NOT NULL) OR
    (webhook_enabled = FALSE)
  )
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_report_settings_org ON report_settings(organization_id);

-- RLS
ALTER TABLE report_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
DROP POLICY IF EXISTS "Users can view report settings from their organizations" ON report_settings;
CREATE POLICY "Users can view report settings from their organizations"
ON report_settings FOR SELECT
USING (
  organization_id IN (
    SELECT id FROM organizations WHERE owner_id = auth.uid()
    UNION
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can insert report settings for their organizations" ON report_settings;
CREATE POLICY "Users can insert report settings for their organizations"
ON report_settings FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT id FROM organizations WHERE owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can update report settings from their organizations" ON report_settings;
CREATE POLICY "Users can update report settings from their organizations"
ON report_settings FOR UPDATE
USING (
  organization_id IN (
    SELECT id FROM organizations WHERE owner_id = auth.uid()
    UNION
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
  )
);

DROP POLICY IF EXISTS "Users can delete report settings from their organizations" ON report_settings;
CREATE POLICY "Users can delete report settings from their organizations"
ON report_settings FOR DELETE
USING (
  organization_id IN (
    SELECT id FROM organizations WHERE owner_id = auth.uid()
  )
);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_report_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_report_settings_updated_at ON report_settings;
CREATE TRIGGER trigger_update_report_settings_updated_at
  BEFORE UPDATE ON report_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_report_settings_updated_at();

-- Comentarios
COMMENT ON TABLE report_settings IS 'Configuración de cómo la organización recibe reportes e insights';
COMMENT ON COLUMN report_settings.delivery_channels IS 'Array de canales activos: platform, slack, email, webhook';
COMMENT ON COLUMN report_settings.min_priority IS 'Prioridad mínima de insights para enviar (low, medium, high, critical)';
COMMENT ON COLUMN report_settings.categories_filter IS 'Array de categorías a filtrar (vacío = todas las categorías)';

-- ============================================
-- TABLA 5: insights
-- ============================================
-- Propósito: Almacenar insights generados por IA a partir de los datos de feedback
-- Relación: Una organización puede tener múltiples insights
-- Uso: Almacena los resultados del procesamiento de IA
--      Los insights se generan a partir de las fuentes de datos configuradas
--      NO guardamos los datos de feedback, solo los insights generados
-- ============================================

CREATE TABLE IF NOT EXISTS insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  
  -- Relación con fuentes de datos que generaron este insight
  -- NOTA: No podemos usar FOREIGN KEY en arrays, se valida a nivel de aplicación
  data_source_ids UUID[], -- Array de IDs de data_sources
  
  -- Tipo y categoría del insight
  insight_type TEXT NOT NULL CHECK (insight_type IN ('trend', 'action_item', 'sentiment', 'priority', 'opportunity', 'risk', 'recommendation')),
  categories TEXT[], -- Tags/categorías del insight
  
  -- Contenido del insight
  title TEXT NOT NULL,
  summary TEXT NOT NULL, -- Resumen corto
  detailed_analysis TEXT, -- Análisis detallado
  recommendations TEXT[], -- Array de recomendaciones accionables
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  
  -- Métricas y datos relacionados
  affected_metrics JSONB, -- Métricas afectadas (ej: {"nps": -5, "csat": 0.2})
  related_keywords TEXT[], -- Palabras clave relacionadas
  
  -- Asignación y estado
  assigned_to UUID REFERENCES profiles(id), -- Miembro del equipo asignado
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'in_progress', 'completed', 'dismissed')),
  status_notes TEXT, -- Notas sobre el estado (por qué se descartó, etc.)
  
  -- Metadata de IA
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1), -- 0.00 a 1.00
  model_version TEXT, -- Versión del modelo usado (ej: "gpt-4o-mini", "claude-3.5")
  generation_metadata JSONB, -- Metadata adicional de la generación (tokens, temperatura, etc.)
  
  -- Fechas
  generated_at TIMESTAMPTZ DEFAULT NOW(), -- Cuando se generó el insight
  reviewed_at TIMESTAMPTZ, -- Cuando se revisó
  completed_at TIMESTAMPTZ, -- Cuando se completó la acción
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_insights_org ON insights(organization_id);
CREATE INDEX IF NOT EXISTS idx_insights_type ON insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_insights_status ON insights(status);
CREATE INDEX IF NOT EXISTS idx_insights_priority ON insights(priority);
CREATE INDEX IF NOT EXISTS idx_insights_assigned_to ON insights(assigned_to);
CREATE INDEX IF NOT EXISTS idx_insights_generated_at ON insights(generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_insights_org_status ON insights(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_insights_org_priority ON insights(organization_id, priority);

-- RLS
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
DROP POLICY IF EXISTS "Users can view insights from their organizations" ON insights;
CREATE POLICY "Users can view insights from their organizations"
ON insights FOR SELECT
USING (
  organization_id IN (
    SELECT id FROM organizations WHERE owner_id = auth.uid()
    UNION
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can insert insights in their organizations" ON insights;
CREATE POLICY "Users can insert insights in their organizations"
ON insights FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT id FROM organizations WHERE owner_id = auth.uid()
    UNION
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can update insights from their organizations" ON insights;
CREATE POLICY "Users can update insights from their organizations"
ON insights FOR UPDATE
USING (
  organization_id IN (
    SELECT id FROM organizations WHERE owner_id = auth.uid()
    UNION
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can delete insights from their organizations" ON insights;
CREATE POLICY "Users can delete insights from their organizations"
ON insights FOR DELETE
USING (
  organization_id IN (
    SELECT id FROM organizations WHERE owner_id = auth.uid()
    UNION
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
  )
);

-- Función para actualizar updated_at y fechas de estado
CREATE OR REPLACE FUNCTION update_insights_metadata()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  
  -- Actualizar fechas según el estado
  IF NEW.status = 'reviewing' AND (OLD.status IS NULL OR OLD.status != 'reviewing') THEN
    NEW.reviewed_at = NOW();
  END IF;
  
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    NEW.completed_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
DROP TRIGGER IF EXISTS trigger_update_insights_metadata ON insights;
CREATE TRIGGER trigger_update_insights_metadata
  BEFORE UPDATE ON insights
  FOR EACH ROW
  EXECUTE FUNCTION update_insights_metadata();

-- Función para actualizar updated_at en inserts también
CREATE OR REPLACE FUNCTION update_insights_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para updated_at
DROP TRIGGER IF EXISTS trigger_update_insights_updated_at ON insights;
CREATE TRIGGER trigger_update_insights_updated_at
  BEFORE INSERT OR UPDATE ON insights
  FOR EACH ROW
  EXECUTE FUNCTION update_insights_updated_at();

-- Comentarios
COMMENT ON TABLE insights IS 'Almacena insights generados por IA a partir de datos de feedback';
COMMENT ON COLUMN insights.data_source_ids IS 'Array de IDs de data_sources que generaron este insight (sin FK, validar en aplicación)';
COMMENT ON COLUMN insights.insight_type IS 'Tipo: trend, action_item, sentiment, priority, opportunity, risk, recommendation';
COMMENT ON COLUMN insights.confidence_score IS 'Nivel de confianza de la IA (0.00 a 1.00)';
COMMENT ON COLUMN insights.status IS 'Estado: new, reviewing, in_progress, completed, dismissed';
COMMENT ON COLUMN insights.affected_metrics IS 'Métricas afectadas en formato JSON (ej: {"nps": -5, "csat": 0.2})';

-- ============================================
-- TABLA 6: team_context
-- ============================================
-- Propósito: Almacenar contexto del equipo para que la IA entienda quién es cada persona,
--            qué hace, de qué es responsable, para generar análisis personalizados
-- Relación: Una organización puede tener múltiples entradas de contexto de equipo
-- Uso: Paso 2 del onboarding - Define el contexto del equipo para análisis de IA
--      Ejemplo: "Andrés como encargado de X debería hacer Y porque la misión dice Z"
-- ============================================

CREATE TABLE IF NOT EXISTS team_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL, -- Nombre de la persona
  email TEXT, -- Correo (opcional, para contacto)
  expertise TEXT NOT NULL, -- Especialidad/Experto de (qué hace, quién es, para qué es bueno)
  responsible_for TEXT NOT NULL, -- Responsable de (dentro de la empresa)
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_team_context_org ON team_context(organization_id);
CREATE INDEX IF NOT EXISTS idx_team_context_created_by ON team_context(created_by);
CREATE INDEX IF NOT EXISTS idx_team_context_created_at ON team_context(created_at DESC);

-- RLS
ALTER TABLE team_context ENABLE ROW LEVEL SECURITY;

-- Políticas RLS (similares a business_context para evitar recursión)
DROP POLICY IF EXISTS "Users can view team context from their organizations" ON team_context;
CREATE POLICY "Users can view team context from their organizations"
ON team_context FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM organizations
    WHERE organizations.id = team_context.organization_id
    AND organizations.owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can insert team context in their organizations" ON team_context;
CREATE POLICY "Users can insert team context in their organizations"
ON team_context FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM organizations
    WHERE organizations.id = team_context.organization_id
    AND organizations.owner_id = auth.uid()
  )
  AND created_by = auth.uid()
);

DROP POLICY IF EXISTS "Users can update team context from their organizations" ON team_context;
CREATE POLICY "Users can update team context from their organizations"
ON team_context FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM organizations
    WHERE organizations.id = team_context.organization_id
    AND organizations.owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can delete team context from their organizations" ON team_context;
CREATE POLICY "Users can delete team context from their organizations"
ON team_context FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM organizations
    WHERE organizations.id = team_context.organization_id
    AND organizations.owner_id = auth.uid()
  )
);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_team_context_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_team_context_updated_at ON team_context;
CREATE TRIGGER trigger_update_team_context_updated_at
  BEFORE UPDATE ON team_context
  FOR EACH ROW
  EXECUTE FUNCTION update_team_context_updated_at();

-- Comentarios
COMMENT ON TABLE team_context IS 'Almacena contexto del equipo para análisis personalizados de IA';
COMMENT ON COLUMN team_context.name IS 'Nombre de la persona del equipo';
COMMENT ON COLUMN team_context.email IS 'Correo electrónico (opcional, para contacto)';
COMMENT ON COLUMN team_context.expertise IS 'Especialidad/Experto de: qué hace, quién es, para qué es bueno';
COMMENT ON COLUMN team_context.responsible_for IS 'Responsable de: qué área o función dentro de la empresa';

-- ============================================
-- RESUMEN DE TABLAS CREADAS
-- ============================================
-- 1. business_context: Contexto de negocio flexible (Paso 1)
-- 2. onboarding_progress: Tracking del progreso del onboarding
-- 3. data_sources: Fuentes de datos configuradas (Paso 3)
-- 4. report_settings: Configuración de reportes (Paso 4)
-- 5. insights: Insights generados por IA
-- 6. team_context: Contexto del equipo para análisis de IA (Paso 2)
-- ============================================
-- TABLAS EXISTENTES QUE SE USAN:
-- - profiles: Perfiles de usuarios
-- - organizations: Organizaciones
-- - organization_members: Miembros del equipo registrados (para invitaciones)
-- ============================================

