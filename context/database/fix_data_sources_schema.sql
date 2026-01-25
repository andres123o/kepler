-- ============================================
-- MIGRACIÓN: Corrección de tabla data_sources
-- ============================================
-- Propósito: Ajustar la tabla para que NPS/CSAT y Tickets (archivo) 
--            solo guarden referencias, NO archivos
-- Fecha: 2024
-- ============================================

-- PASO 1: Agregar columna tickets_method (para diferenciar 'api' vs 'file' en tickets)
ALTER TABLE data_sources ADD COLUMN IF NOT EXISTS tickets_method TEXT CHECK (tickets_method IN ('api', 'file'));

-- PASO 2: Migrar registros existentes de tickets_api y tickets_file a tickets
-- Si hay registros con source_type = 'tickets_api', establecer tickets_method = 'api'
UPDATE data_sources 
SET tickets_method = 'api' 
WHERE source_type = 'tickets_api' AND tickets_method IS NULL;

-- Si hay registros con source_type = 'tickets_file', establecer tickets_method = 'file'
UPDATE data_sources 
SET tickets_method = 'file' 
WHERE source_type = 'tickets_file' AND tickets_method IS NULL;

-- PASO 3: Cambiar source_type de 'tickets_api' y 'tickets_file' a 'tickets'
UPDATE data_sources 
SET source_type = 'tickets' 
WHERE source_type IN ('tickets_api', 'tickets_file');

-- PASO 4: Agregar columna import_method_reference (para guardar referencia del método)
ALTER TABLE data_sources ADD COLUMN IF NOT EXISTS import_method_reference TEXT;

-- PASO 5: Eliminar constraints antiguos que requieren file_path
ALTER TABLE data_sources DROP CONSTRAINT IF EXISTS nps_csat_fields_check;
ALTER TABLE data_sources DROP CONSTRAINT IF EXISTS tickets_api_fields_check;
ALTER TABLE data_sources DROP CONSTRAINT IF EXISTS tickets_file_fields_check;
ALTER TABLE data_sources DROP CONSTRAINT IF EXISTS unique_nps_csat_per_org;

-- PASO 6: Eliminar el CHECK constraint del source_type para poder modificarlo
-- Intentar eliminar con el nombre exacto primero
ALTER TABLE data_sources DROP CONSTRAINT IF EXISTS data_sources_source_type_check;

-- También buscar y eliminar cualquier otro constraint de source_type
DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    -- Buscar el constraint de source_type (cualquier nombre)
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'data_sources'::regclass
    AND contype = 'c'
    AND (
        pg_get_constraintdef(oid) LIKE '%source_type%IN%'
        OR pg_get_constraintdef(oid) LIKE '%source_type%CHECK%'
    );
    
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE data_sources DROP CONSTRAINT IF EXISTS ' || quote_ident(constraint_name);
    END IF;
END $$;

-- PASO 7: Agregar nuevo CHECK constraint para source_type (sin tickets_api y tickets_file, ahora solo 'tickets')
ALTER TABLE data_sources ADD CONSTRAINT data_sources_source_type_check CHECK (
  source_type IN ('social', 'app_store', 'nps', 'csat', 'tickets')
);

-- PASO 8: Agregar constraint para tickets_method (debe existir cuando source_type = 'tickets')
ALTER TABLE data_sources DROP CONSTRAINT IF EXISTS tickets_method_required_check;
ALTER TABLE data_sources ADD CONSTRAINT tickets_method_required_check CHECK (
  (source_type = 'tickets' AND tickets_method IS NOT NULL) OR
  (source_type != 'tickets')
);

-- PASO 9: Nuevo constraint para NPS/CSAT (solo requiere import_method_reference, NO file_path)
-- Ya se eliminó en PASO 5, pero por si acaso
ALTER TABLE data_sources DROP CONSTRAINT IF EXISTS nps_csat_fields_check;
ALTER TABLE data_sources ADD CONSTRAINT nps_csat_fields_check CHECK (
  (source_type IN ('nps', 'csat') AND import_method_reference IS NOT NULL) OR
  (source_type NOT IN ('nps', 'csat'))
);

-- PASO 10: Nuevo constraint para Tickets (método archivo) - solo requiere import_method_reference, NO file_path
-- Ya se eliminó en PASO 5, pero por si acaso
ALTER TABLE data_sources DROP CONSTRAINT IF EXISTS tickets_file_fields_check;
ALTER TABLE data_sources ADD CONSTRAINT tickets_file_fields_check CHECK (
  (source_type = 'tickets' AND tickets_method = 'file' AND import_method_reference IS NOT NULL) OR
  (source_type != 'tickets' OR tickets_method != 'file')
);

-- PASO 11: Nuevo constraint para Tickets (método API) - requiere api_provider
-- Ya se eliminó en PASO 5, pero por si acaso
ALTER TABLE data_sources DROP CONSTRAINT IF EXISTS tickets_api_fields_check;
ALTER TABLE data_sources ADD CONSTRAINT tickets_api_fields_check CHECK (
  (source_type = 'tickets' AND tickets_method = 'api' AND api_provider IS NOT NULL) OR
  (source_type != 'tickets' OR tickets_method != 'api')
);

-- PASO 12: Comentarios para documentar los cambios
COMMENT ON COLUMN data_sources.tickets_method IS 'Método para tickets: "api" (conectar con API) o "file" (importar desde archivo)';
COMMENT ON COLUMN data_sources.import_method_reference IS 'Referencia del método de importación. Para NPS/CSAT: "Se subirá archivo cuando se genere el análisis". Para Tickets archivo: "Usuario importará data desde un archivo después"';
COMMENT ON COLUMN data_sources.nps_csat_type IS 'DEPRECATED: Ya no se usa. source_type ya indica si es "nps" o "csat"';

-- ============================================
-- RESUMEN DE CAMBIOS
-- ============================================
-- 1. Agregada columna tickets_method ('api' o 'file')
-- 2. source_type ahora usa 'tickets' en lugar de 'tickets_api' y 'tickets_file'
-- 3. Agregada columna import_method_reference para guardar referencia del método
-- 4. Eliminados constraints que requieren file_path para NPS/CSAT/Tickets archivo
-- 5. Nuevos constraints solo requieren import_method_reference (NO file_path)
-- 6. nps_csat_type se mantiene pero ya no es requerido (se puede eliminar después si se desea)
-- ============================================

