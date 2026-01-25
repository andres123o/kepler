# 🚀 Mejoras Planeadas para V1 - Agente Orquestador Kepler

## 📋 Contexto

Este documento describe las mejoras que se implementarán en la **versión 1** del agente. Actualmente estamos en **v0 (MVP)** y estas optimizaciones están planificadas para reducir costos y mejorar eficiencia cuando escalemos.

---

## 🎯 Problema Actual (v0)

En v0, el agente:
- ✅ Recibe **TODOS** los contextos de negocio de la organización
- ✅ El agente (GPT-4) filtra y usa solo los relevantes
- ⚠️ **Desventaja:** Gasta tokens innecesariamente enviando contextos irrelevantes

Esto es **aceptable para MVP y primeros 3 clientes**, pero necesita optimización para escalar.

---

## 💡 Mejoras Planeadas para V1

### 1. Selección Inteligente de Contextos (Opción C + Embeddings)

#### Objetivo
Reducir tokens enviados a GPT-4 seleccionando solo los contextos relevantes antes de construir el prompt.

#### Implementación Propuesta

**Opción C: Selección por Metadata/Nombre + Embeddings**

**Paso 1: Clasificación por Metadata/Nombre (Rápido, sin costo)**
- Si un contexto tiene `metadata.category` o palabras clave en el nombre, clasificarlo automáticamente
- Ejemplo:
  - "Misión" → `category: "general"`
  - "Objetivos Q1 2024" → `category: "objetivos"`
  - "Funnel Onboarding" → `category: "onboarding"`

**Paso 2: Embeddings para Selección Semántica (Preciso, bajo costo)**
- Generar embedding del patrón detectado (después del clustering de datos)
- Generar embeddings de todos los contextos de negocio
- Calcular similitud coseno
- Seleccionar top 3-5 contextos más similares

**Paso 3: Combinación**
- Usar Opción C para pre-filtrar por categoría obvia
- Usar embeddings para casos donde no hay categoría clara
- Enviar solo contextos seleccionados a GPT-4

#### Ventajas
- ✅ Reduce tokens significativamente (solo 2-3 contextos vs todos)
- ✅ Más preciso que solo keywords
- ✅ Embeddings son baratos ($0.02-0.13 por 1M tokens)
- ✅ Escalable a organizaciones con muchos contextos

#### Costo Estimado
- Embeddings: ~$0.0001-0.001 por análisis (10-50 contextos)
- Ahorro en GPT-4: ~$0.05-0.20 por análisis (menos tokens)
- **ROI Positivo:** Ahorra más de lo que cuesta

#### Archivos a Crear/Modificar
- `app/agents/kepler/context-selector.ts` (nuevo)
- Modificar `context-builder.ts` para usar selector

---

### 2. Embeddings + Clustering para Datos de Fuentes

#### Objetivo
Agrupar datos similares (tickets, reviews, comentarios) antes de enviar a GPT-4 para:
- Reducir tokens enviados
- Mejor identificación de patrones
- Análisis más robusto

#### Implementación Propuesta

**Flujo:**

```
Datos Recopilados (Tickets, Reviews, etc.)
    ↓
Generar Embeddings (text-embedding-3-small)
    ↓
Clustering (K-means o Similaridad)
    ↓
Seleccionar Top Clusters (por tamaño + densidad)
    ↓
Representar cada cluster (centroide + ejemplos)
    ↓
Enviar clusters resumidos a GPT-4
```

#### Detalles Técnicos

**1. Generación de Embeddings:**
- Modelo: `text-embedding-3-small` (suficiente para MVP, más barato)
- Batch: Procesar en lotes de 100 para eficiencia
- Caché: Guardar embeddings en BD para evitar regenerar

**2. Clustering:**
- **Opción Simple (MVP):** Similaridad coseno + agrupación por umbral (ej: >0.75)
- **Opción Avanzada (V1):** K-means con número óptimo de clusters (elbow method)
- Tamaño mínimo de cluster: 3 elementos (evitar ruido)

**3. Representación de Clusters:**
- Centroide del cluster (embedding promedio)
- 3-5 ejemplos representativos (más cercanos al centroide)
- Estadísticas: tamaño, score promedio (si aplica), fechas

**4. Priorización:**
- Volumen × Riesgo estimado
- Clusters más grandes primero
- Clusters con scores bajos (NPS/CSAT/Reviews) primero

#### Ventajas
- ✅ Detecta patrones semánticos reales (no keywords)
- ✅ Reduce tokens: En lugar de 100 tickets, enviar 5-10 clusters resumidos
- ✅ Mejor identificación del P0 (clusters ya agrupados)
- ✅ Escalable a miles de datos

#### Desventajas
- ⚠️ Requiere implementación de clustering
- ⚠️ Latencia adicional (generación de embeddings)
- ⚠️ Necesita almacenar embeddings (BD o caché)

#### Costo Estimado
Para 1000 tickets/reviews:
- Embeddings: ~$0.001-0.005
- GPT-4 (con datos agrupados): ~$0.10-0.30
- **Total:** ~$0.10-0.31 por análisis

**Sin clustering:** Enviar todo a GPT-4 podría costar $1-5 por análisis.

**Ahorro:** ~70-90% en costos de GPT-4

#### Archivos a Crear
- `app/agents/kepler/semantic-analyzer.ts` (nuevo)
  - `generateEmbeddings()`
  - `clusterData()`
  - `prioritizeClusters()`
  - `representCluster()`
- Modificar `agent.ts` para usar analizador semántico
- Crear tabla en BD para cachear embeddings (opcional para V1)

---

## 📊 Comparación v0 vs v1

| Aspecto | v0 (MVP) | v1 (Planeado) |
|---------|----------|---------------|
| Contextos enviados | Todos | Top 3-5 relevantes |
| Datos enviados | Todos (limitados a 30) | Clusters resumidos |
| Tokens promedio | ~3000-5000 | ~1000-2000 |
| Costo por análisis | ~$0.30-0.80 | ~$0.10-0.35 |
| Latencia | ~5-10s | ~8-15s (+ embeddings) |
| Precisión | Buena | Mejor (clustering previo) |
| Escalabilidad | Limitada | Excelente |

---

## 🛠️ Plan de Implementación V1

### Fase 1: Embeddings + Clustering para Datos (Prioridad Alta)
**Estimado:** 2-3 días

1. Crear `semantic-analyzer.ts`
2. Implementar generación de embeddings
3. Implementar clustering simple (similaridad coseno)
4. Integrar con `agent.ts`
5. Testear con datos reales

**Beneficio:** Reducción de costos inmediata

### Fase 2: Selección Inteligente de Contextos (Prioridad Media)
**Estimado:** 1-2 días

1. Crear `context-selector.ts`
2. Implementar clasificación por metadata/nombre
3. Implementar selección por embeddings
4. Integrar con `context-builder.ts`
5. Testear con múltiples organizaciones

**Beneficio:** Reducción adicional de tokens

### Fase 3: Optimizaciones y Caché (Prioridad Baja)
**Estimado:** 1 día

1. Cachear embeddings en BD
2. Optimizar batch processing
3. Agregar métricas y logging
4. Documentación

**Beneficio:** Mejor rendimiento y monitoreo

---

## 📚 Recursos y Referencias

### Librerías Necesarias
- `openai` (ya instalado) - Para embeddings
- `ml-distance` o `ml-matrix` - Para clustering (opcional, podemos hacer simple)
- O implementación simple de similaridad coseno

### Documentación OpenAI
- [Embeddings API](https://platform.openai.com/docs/guides/embeddings)
- [text-embedding-3-small](https://platform.openai.com/docs/models/embeddings)

### Algoritmos de Clustering
- Similaridad Coseno (simple, rápido)
- K-means (más preciso, requiere número de clusters)
- DBSCAN (auto-detecta número de clusters)

---

## ✅ Criterios de Éxito V1

- [ ] Reducción de tokens del 50%+
- [ ] Reducción de costos del 40%+
- [ ] Precisión igual o mejor que v0
- [ ] Latencia < 20s (aceptable con embeddings)
- [ ] Funciona con 100+ tickets/reviews
- [ ] Funciona con 10+ contextos de negocio

---

## 🎯 Conclusión

Estas mejoras son **necesarias para escalar** pero **no críticas para MVP**. 

**v0 es suficiente para:**
- Primeros 3-10 clientes
- Validar el producto
- Obtener feedback real

**v1 será necesario cuando:**
- Tengamos 10+ clientes activos
- Los costos se vuelvan significativos
- Necesitemos escalar a más datos

**Prioridad de implementación:**
1. Embeddings + Clustering para datos (mayor impacto en costos)
2. Selección inteligente de contextos (optimización adicional)

