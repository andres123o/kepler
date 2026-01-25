# 🚀 PRD: Kepler MVP (Fase: Validación de Valor)

## 1. Visión del Producto
Kepler es un "Growth & Product Assistant" que correlaciona automáticamente el **Feedback Público** (lo que dicen los usuarios) con la **Data Interna** (lo que hacen los usuarios) y el **Contexto del Negocio** (lo que importa a la empresa). Su objetivo es transformar el ruido de soporte en **Tickets de Corrección** o **Hipótesis de Growth** priorizadas.

**Propuesta de Valor Única:** Dejar de ser un tracker de quejas para convertirse en una máquina de hipótesis validadas con data.

---

## 2. Flujo de Usuario (The Happy Path)

1.  **Onboarding "Magia Pura":** El usuario ingresa URL de PlayStore + User de Instagram.
2.  **Instant Value:** El sistema muestra un reporte preliminar de "Sentimiento Público" (Scraping en tiempo real).
3.  **Deep Dive (El Hook):** Se le invita a subir sus CSVs de Data Interna para saber *por qué* pasan las cosas.
4.  **Ingesta:** Sube archivos (Tickets, Data Comportamiento, Contexto).
5.  **Resultado:** Dashboard con "Accionables" divididos en **Bugs (Fix)** y **Experimentos (Growth)**.

---

## 3. Arquitectura de Datos (Los 3 Inputs)

Para ingeniería, tratar todo como texto/documentos por ahora. No integraciones API complejas.

* **Fuente A (Pública/CX - El Síntoma):**
    * *Formato:* Scraping (JSON) o CSV subido manualmente.
    * *Datos:* Reviews PlayStore/AppStore, Comentarios Instagram/LinkedIn, Tickets de Soporte (Zendesk export), NPS.
* **Fuente B (Contexto - Las Reglas):**
    * *Formato:* Texto plano o PDF.
    * *Datos:* OKRs del Q1 (ej: Bajar CAC, Subir Retención), Estructura del equipo (Quién es Tech, quién es Producto), Misión/Visión.
* **Fuente C (Comportamiento - La Verdad):**
    * *Formato:* CSVs (Exports de Amplitude/BigQuery/SQL).
    * *Datos:* Funnel de conversión (paso a paso), Logs de errores (Error 500, Timeouts), Tasas de caída (Drop-off rates).

---

## 4. Requerimientos Funcionales (Fraccionados)

### Módulo 1: Ingesta & Scraping (El Gancho)
* **Input:** Campo de texto para URLs (Instagram, PlayStore, Web).
* **Proceso:** Script (Puppeteer/SerpApi) que extraiga los últimos 20-50 comentarios/reviews.
* **Output:** Un JSON unificado con `fecha`, `fuente`, `texto`, `rating`.

### Módulo 2: Gestor de Archivos (El Data Lake Simple)
* **Input:** Drag & Drop para subir archivos `.csv`, `.txt`, `.pdf`.
* **Lógica:**
    * Clasificar el archivo al subirlo: ¿Es "Data Interna", "Tickets" o "Contexto"?
    * Parsing básico: Convertir CSV a texto digerible para el LLM (limpieza de columnas vacías).

### Módulo 3: The Brain (El Core de IA)
Este es el prompt de ingeniería. Debe ejecutar el análisis en dos pasos:

* **Paso 1: Identificación de Patrones (Síntomas).**
    * Analiza Fuente A (CX). Agrupa quejas por tema (ej: "Lentitud", "Login fallido").
* **Paso 2: Validación Forense (Cruce).**
    * Toma el "Patrón X" y búscalo en Fuente C (Data Interna).
    * *Lógica:* "Si la queja es 'No puedo pagar' y el CSV de Errores muestra 'Error 404 en /checkout', CONFIRMA el problema."
* **Paso 3: Priorización (Contexto).**
    * Cruza el hallazgo con Fuente B (Contexto).
    * *Lógica:* "¿Este error afecta el OKR de 'Aumentar Ventas'? Sí -> Prioridad CRÍTICA."

### Módulo 4: Generador de Accionables (El Output)
El sistema debe generar dos tipos de tarjetas distintas:

#### **Tipo A: Ticket de Corrección (The Fix)**
* **Disparador:** Coincidencia entre Queja y Error Técnico en Data Interna.
* **Estructura:**
    * Título: [Bug Crítico] + Descripción.
    * Evidencia: "X quejas + Y% de error en logs".
    * Impacto: "Afecta el OKR: [Nombre del OKR]".
    * Asignado a: [Nombre/Rol del equipo Tech].

#### **Tipo B: Hipótesis de Growth (The Experiment)**
* **Disparador:** Queja de usuario SIN error técnico correlacionado (Problema de UX/Producto) o sugerencia de feature nueva.
* **Estructura:**
    * Hipótesis: "Creemos que cambiando X por Y..."
    * Insight: "Usuarios piden X pero la data muestra que abandonan en Y".
    * Experimento Sugerido: "A/B Testing en el copy del botón".
    * Asignado a: [Nombre/Rol de Producto/Growth].

---

## 5. UI/UX (Interfaz Simple)

1.  **Landing Page:** Input simple de URLs (Instagram/PlayStore).
2.  **Dashboard Principal:**
    * **Header:** "Salud del Producto" (Resumen de sentimiento).
    * **Sección Central (Accionables):** Dos columnas o pestañas: "Bugs a Corregir" (Rojo) vs. "Oportunidades de Growth" (Verde/Azul).
    * **Sidebar:** "Fuentes Conectadas" (Estado de los CSVs subidos).
3.  **Vista de Detalle:** Al dar clic en una tarjeta, mostrar la "Evidencia Forense" (El snippet del ticket original + la fila del CSV de data interna).

---

## 6. Constraints Técnicos (Para velocidad)

* **No Base de Datos compleja:** Usar almacenamiento temporal o local por sesión si es posible, o una BD simple (Supabase/Firebase) solo para guardar los reportes generados.
* **No Integraciones API Reales:** Todo por subida de archivos manual (CSV). Simular la "integración" en el UI.
* **LLM:** Usar modelo con ventana de contexto larga (GPT-4 Turbo o Claude 3 Opus) para poder leer los CSVs completos.

---

## 7. Plan de Ejecución Inmediata

1.  **Día 1:** Construir Módulo 1 (Scraping) + Módulo 3 (Prompt en Playground). Probar manualmente con data de Trii.
2.  **Día 2:** Construir UI mínima (Front-end) para mostrar los dos tipos de tarjetas (Fix vs. Experiment).
3.  **Día 3:** "Concierge Run". Pedir los CSVs a Trii, correrlos por el sistema, curar el resultado y presentar.