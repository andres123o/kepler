# 🔄 Flujo Completo de Análisis - Kepler

## 📋 Flujo Ideal (Lo que debería ser)

```
1. Usuario hace clic en "Iniciar Análisis"
   ↓
2. Sistema verifica archivos faltantes (NPS, CSAT, Tickets con método "file")
   ↓
3. Si faltan archivos → Modal de subida de archivos
   ↓
4. Usuario sube archivos (CSV/JSON)
   ↓
5. Usuario hace clic en "Continuar con el análisis"
   ↓
6. PROCESAMIENTO:
   ├─ a) Procesar archivos subidos (parsear CSV/JSON)
   │   ├─ NPS: Extraer scores + comentarios
   │   ├─ CSAT: Extraer scores + comentarios
   │   └─ Tickets: Extraer tickets (subject, description, etc.)
   │
   ├─ b) Ejecutar scrapers (en paralelo si es posible)
   │   ├─ Instagram: scrapeInstagramWeekComments()
   │   ├─ LinkedIn: scrapeLinkedInPosts()
   │   └─ Play Store: scrapePlayStoreReviews()
   │
   └─ c) Combinar todos los datos en un solo objeto
   ↓
7. ANÁLISIS SEMÁNTICO:
   ├─ d) Generar embeddings para todos los textos
   ├─ e) Hacer clustering (similaridad coseno)
   └─ f) Priorizar clusters (volumen × riesgo)
   ↓
8. AGENTE KEPLER:
   ├─ g) Obtener contextos de negocio desde BD
   ├─ h) Obtener contextos de equipo desde BD
   ├─ i) Construir prompt con clusters + contextos
   ├─ j) Llamar a OpenAI (GPT-4o)
   └─ k) Parsear respuesta Markdown → estructura
   ↓
9. GUARDAR RESULTADO:
   ├─ l) Guardar insight en tabla `insights` (BD)
   └─ m) Actualizar estado de data_sources (processing_status)
   ↓
10. MOSTRAR RESULTADO:
    └─ n) Mostrar insight en panel del dashboard
```

---

## ✅ Lo que YA está implementado

### Frontend
- ✅ Modal de subida de archivos (`FileUploadModal.tsx`)
- ✅ Verificación de archivos faltantes
- ✅ Botón "Iniciar Análisis"
- ✅ Botón "Continuar con el análisis" en modal

### Scrapers
- ✅ `scrapeInstagramWeekComments()` - Funciona
- ✅ `scrapeLinkedInPosts()` - Funciona
- ✅ `scrapePlayStoreReviews()` - Funciona

### Agente Kepler
- ✅ `runKeplerAgent()` - Funciona
- ✅ Embeddings + Clustering - Implementado
- ✅ System prompt corregido
- ✅ Parsing de respuesta Markdown

### Base de Datos
- ✅ Tabla `insights` - Existe
- ✅ Tabla `data_sources` - Existe con campos necesarios
- ✅ Tabla `business_context` - Existe
- ✅ Tabla `team_context` - Existe

---

## ❌ Lo que FALTA implementar

### 1. Procesamiento de Archivos (PRIORIDAD ALTA)

**Archivo a crear:** `app/actions/process-files.ts`

```typescript
// Funciones necesarias:
- parseNPSCSV(file: File): Promise<NPSSurvey[]>
- parseCSATCSV(file: File): Promise<CSATSurvey[]>
- parseTicketsCSV(file: File): Promise<Ticket[]>
- parseNPSSJSON(file: File): Promise<NPSSurvey[]>
// ... etc para JSON

// Lógica:
1. Leer archivo desde Supabase Storage (usando file_path)
2. Detectar formato (CSV, JSON, XLSX)
3. Parsear según formato
4. Mapear a tipos TypeScript (NPSSurvey, CSATSurvey, Ticket)
5. Retornar array de datos
```

**Necesita:**
- Librería para parsear CSV (ej: `papaparse` o similar)
- Librería para parsear JSON
- Lógica de mapeo de columnas (flexible para diferentes formatos)

---

### 2. Orquestador Principal (PRIORIDAD ALTA)

**Archivo a crear:** `app/actions/run-analysis.ts`

```typescript
export async function runCompleteAnalysis(organizationId: string) {
  // 1. Obtener data_sources desde BD
  // 2. Procesar archivos (NPS, CSAT, Tickets con file_path)
  // 3. Ejecutar scrapers (Instagram, LinkedIn, Play Store)
  // 4. Combinar todos los datos
  // 5. Obtener contextos (business_context, team_context)
  // 6. Llamar a runKeplerAgent()
  // 7. Guardar insight en BD
  // 8. Retornar resultado
}
```

**Esta función debe:**
- Ser async 'use server'
- Manejar errores apropiadamente
- Retornar estado de progreso (opcional, para UI)
- Actualizar processing_status de data_sources

---

### 3. Integración en DashboardContent (PRIORIDAD ALTA)

**Modificar:** `components/dashboard/DashboardContent.tsx`

```typescript
// En handleComplete del FileUploadModal:
onComplete={() => {
  setShowFileUploadModal(false);
  // NO hacer reload, en su lugar:
  startCompleteAnalysis(); // Nueva función
}}

// Nueva función:
const startCompleteAnalysis = async () => {
  setStatus("🔄 Procesando archivos y recopilando datos...");
  
  // Llamar al orquestador
  const result = await runCompleteAnalysis(organization.id);
  
  if (result.success) {
    setStatus("✅ Análisis completado");
    // Refrescar insights para mostrar el nuevo
    router.refresh(); // O actualizar estado
  } else {
    setStatus(`❌ Error: ${result.error}`);
  }
}
```

---

### 4. Guardar Insight en BD (PRIORIDAD ALTA)

**Función a crear:** `app/actions/save-insight.ts`

```typescript
export async function saveInsightToDatabase(
  organizationId: string,
  agentOutput: KeplerAgentOutput,
  dataSourceIds: string[]
) {
  // Mapear ActionableInsight a estructura de tabla insights
  // Insertar en BD
  // Retornar ID del insight creado
}
```

**Mapeo:**
```typescript
ActionableInsight → insights table:
- title → title
- actions[0].description → summary
- rawOutput → detailed_analysis
- actions → recommendations (array)
- owner → assigned_to (buscar por name/email)
- deltaAnalysis.impact → summary adicional
- evidence.count → metadata
- metadata.clustersDetected → generation_metadata
```

---

### 5. Mostrar Insights en Dashboard (PRIORIDAD MEDIA)

**Modificar:** `components/dashboard/DashboardContent.tsx`

- Ya recibe `insights` como prop desde `dashboard/page.tsx`
- Falta: Componente para mostrar insights de forma bonita
- Mostrar el insight más reciente o todos en una lista

---

## 🔧 Orden de Implementación Recomendado

### Paso 1: Procesamiento de Archivos
1. Instalar librería para CSV (ej: `papaparse`)
2. Crear `app/actions/process-files.ts`
3. Implementar parsers básicos para CSV y JSON
4. Testear con archivos de ejemplo

### Paso 2: Orquestador Principal
1. Crear `app/actions/run-analysis.ts`
2. Integrar procesamiento de archivos
3. Integrar scrapers
4. Integrar agente Kepler
5. Testear flujo completo

### Paso 3: Guardar en BD
1. Crear `app/actions/save-insight.ts`
2. Mapear estructura de agente a tabla insights
3. Testear guardado

### Paso 4: Integración Frontend
1. Modificar `DashboardContent.tsx`
2. Conectar "Continuar con el análisis" con orquestador
3. Mostrar loading states
4. Mostrar resultado

### Paso 5: UI de Insights
1. Crear componente para mostrar insights
2. Integrar en dashboard
3. Testear visualización

---

## 📝 Notas Técnicas

### Procesamiento de Archivos
- **CSV:** Usar `papaparse` (npm install papaparse @types/papaparse)
- **JSON:** `JSON.parse()` es suficiente
- **XLSX:** Usar `xlsx` (npm install xlsx)

### Formato Esperado de Archivos

**NPS CSV:**
```csv
score,comment,timestamp
9,"Excelente producto",2024-01-15
6,"Podría mejorar",2024-01-16
```

**CSAT CSV:**
```csv
score,comment,timestamp
5,"Muy satisfecho",2024-01-15
2,"No funciona bien",2024-01-16
```

**Tickets CSV:**
```csv
id,subject,description,status,priority
T-001,"Error en login","No puedo iniciar sesión","open","high"
```

### Manejo de Errores
- Si un archivo falla al procesarse → Continuar con otros
- Si un scraper falla → Continuar con otros
- Si el agente falla → Mostrar error claro al usuario

### Performance
- Procesar archivos en paralelo si es posible
- Scrapers pueden ejecutarse en paralelo
- Embeddings se procesan en batch (ya implementado)

---

## ✅ Resumen

**Flujo actual:**
- ✅ Verificación de archivos → Modal
- ✅ Subida de archivos
- ⚠️ Solo scraping de Play Store (testing)
- ❌ No procesa archivos
- ❌ No llama al agente
- ❌ No guarda resultado
- ❌ No muestra resultado

**Flujo objetivo:**
- ✅ Verificación de archivos → Modal
- ✅ Subida de archivos
- ✅ Procesamiento de archivos
- ✅ Scraping de todas las fuentes
- ✅ Embeddings + Clustering
- ✅ Llamada al agente Kepler
- ✅ Guardado en BD
- ✅ Visualización en dashboard

**Próximo paso:** Implementar procesamiento de archivos y orquestador principal.


