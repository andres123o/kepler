# 🎨 Paleta de Colores - Kepler

Este documento define la paleta de colores oficial del proyecto Kepler, incluyendo los colores principales, gradientes y su uso en diferentes secciones de la aplicación.

---

## 📋 Índice

1. [Colores Principales](#colores-principales)
2. [Landing Page](#landing-page)
3. [Dashboard / Business Environment](#dashboard--business-environment)
4. [Uso de Colores](#uso-de-colores)
5. [Gradientes](#gradientes)

---

## 🎯 Colores Principales

### Negro Principal (CTAs y Elementos Destacados)
- **Color:** `#000000` / `neutral-900`
- **Uso:** Botones CTA, elementos destacados, texto principal
- **Aplicación:** 
  - Botones de acción principales
  - Texto de títulos importantes
  - Elementos que requieren máximo contraste

**Ejemplo en código:**
```tsx
className="bg-neutral-900 text-white"
// o
className="bg-black text-white"
```

---

## 🌐 Landing Page

### Gradiente Principal
El gradiente principal de la landing page se usa en secciones destacadas como "About" y "Contact".

**Gradiente Base:**
```css
linear-gradient(115deg, #4A0072 0%, #C2185B 50%, #FF8C00 100%)
```

**Gradientes Radiales (Overlay):**
```css
/* Naranja (esquina superior derecha) */
radial-gradient(
  ellipse 80% 80% at 100% 0%,
  rgba(255, 69, 0, 0.9) 0%,
  rgba(255, 140, 0, 0.7) 40%,
  transparent 80%
)

/* Azul oscuro (esquina inferior derecha) */
radial-gradient(
  ellipse 60% 60% at 90% 100%,
  rgba(25, 25, 112, 0.6) 0%,
  transparent 70%
)

/* Violeta (lado izquierdo) */
radial-gradient(
  ellipse 70% 90% at 10% 40%,
  rgba(138, 43, 226, 0.8) 0%,
  rgba(75, 0, 130, 0.5) 60%,
  transparent 90%
)
```

**Colores Individuales del Gradiente:**
- `#4A0072` - Púrpura oscuro (inicio)
- `#C2185B` - Rosa/Magenta (medio)
- `#FF8C00` - Naranja (final)
- `#FF4500` - Naranja rojizo (rgba(255, 69, 0))
- `#FF8C00` - Naranja (rgba(255, 140, 0))
- `#191970` - Azul oscuro (rgba(25, 25, 112))
- `#8A2BE2` - Violeta (rgba(138, 43, 226))
- `#4B0082` - Índigo oscuro (rgba(75, 0, 130))

**Fondo Base:**
- `#FFFEF7` - Beige/Crema claro (fondo general)
- `#2E003E` - Púrpura muy oscuro (fondo de cards destacadas)

### Uso en Landing
- **Fondo general:** `#FFFEF7`
- **Cards destacadas:** Gradiente completo con `#2E003E` como base
- **CTAs:** Negro (`neutral-900` / `#000000`)
- **Texto principal:** `neutral-900`

---

## 💼 Dashboard / Business Environment

### Colores Principales
- **Fondo general:** `#FFFEF7` (mismo que landing)
- **Fondo oscuro:** `neutral-900` / `#000000` (sidebar, elementos destacados)
- **CTAs:** Negro (`neutral-900` / `#000000`)

### Gradientes para Cards de Contextos
Los gradientes se rotan automáticamente entre estas 8 combinaciones:

1. **Púrpura → Violeta → Rosa Magenta**
   ```css
   from-[#4A0072]/15 via-[#8A2BE2]/15 to-[#C2185B]/15
   border-[#8A2BE2]/30
   ```

2. **Rosa Magenta → Naranja → Naranja Rojizo**
   ```css
   from-[#C2185B]/15 via-[#FF8C00]/15 to-[#FF4500]/15
   border-[#FF8C00]/30
   ```

3. **Violeta → Púrpura → Azul Oscuro**
   ```css
   from-[#8A2BE2]/15 via-[#4A0072]/15 to-[#191970]/15
   border-[#4A0072]/30
   ```

4. **Naranja → Rojo Coral → Rosa Magenta**
   ```css
   from-[#FF8C00]/15 via-[#FF6347]/15 to-[#C2185B]/15
   border-[#FF6347]/30
   ```

5. **Azul Oscuro → Púrpura → Violeta**
   ```css
   from-[#191970]/15 via-[#4A0072]/15 to-[#8A2BE2]/15
   border-[#191970]/30
   ```

6. **Rosa Magenta → Violeta → Púrpura**
   ```css
   from-[#C2185B]/15 via-[#8A2BE2]/15 to-[#4A0072]/15
   border-[#C2185B]/30
   ```

7. **Naranja → Naranja Claro → Rojo Coral**
   ```css
   from-[#FF8C00]/15 via-[#FFB347]/15 to-[#FF6347]/15
   border-[#FFB347]/30
   ```

8. **Púrpura → Rosa → Naranja**
   ```css
   from-[#4A0072]/15 via-[#C2185B]/15 to-[#FF8C00]/15
   border-[#8A2BE2]/30
   ```

### Widgets de Estadísticas
Cada widget usa un gradiente específico:

1. **Total de Contextos** (Púrpura/Violeta/Rosa)
   ```css
   from-[#4A0072]/10 via-[#8A2BE2]/10 to-[#C2185B]/10
   border-[#8A2BE2]/30
   Icon: from-[#8A2BE2] to-[#C2185B]
   ```

2. **Palabras Totales** (Naranja/Rojo/Rosa)
   ```css
   from-[#FF8C00]/10 via-[#FF6347]/10 to-[#C2185B]/10
   border-[#FF8C00]/30
   Icon: from-[#FF8C00] to-[#FF6347]
   ```

3. **Promedio por Contexto** (Azul/Púrpura/Violeta)
   ```css
   from-[#191970]/10 via-[#4A0072]/10 to-[#8A2BE2]/10
   border-[#191970]/30
   Icon: from-[#191970] to-[#4A0072]
   ```

### Botón "Agregar Nuevo Contexto"
```css
/* Fondo */
from-[#4A0072]/10 via-[#C2185B]/10 to-[#FF8C00]/10
border-[#8A2BE2]/20

/* Hover */
hover:border-[#C2185B]/40
hover:from-[#4A0072]/15 hover:via-[#C2185B]/15 hover:to-[#FF8C00]/15

/* Icono */
from-[#8A2BE2] to-[#C2185B]
```

### Badge "Nuevo"
```css
bg-gradient-to-r from-[#C2185B] to-[#FF8C00]
```

---

## 🎨 Uso de Colores

### Jerarquía de Colores

#### Landing Page
1. **Primario:** Gradiente principal (púrpura → rosa → naranja)
2. **Secundario:** Negro para CTAs
3. **Fondo:** `#FFFEF7`
4. **Texto:** `neutral-900` para títulos, `neutral-600` para texto secundario

#### Dashboard / Business
1. **Primario:** Gradientes de cards (rotación de 8 combinaciones)
2. **Secundario:** Negro para CTAs y sidebar
3. **Fondo:** `#FFFEF7` para contenido, `neutral-900` para sidebar
4. **Texto:** `neutral-900` para títulos, `neutral-600` para texto secundario

---

## 📐 Valores de Opacidad

Para mantener consistencia, se usan estas opacidades:

- **Gradientes de fondo (cards):** `/15` (15% opacidad)
- **Bordes:** `/30` (30% opacidad)
- **Hover states:** `/40` (40% opacidad)
- **Backdrop blur:** `backdrop-blur-sm` para profundidad

---

## 🔄 Rotación de Colores

Las cards de contextos rotan automáticamente entre los 8 gradientes usando:
```typescript
const gradient = gradients[index % gradients.length];
const borderColor = borderColors[index % borderColors.length];
```

Esto asegura que cada card tenga un color único mientras mantiene la coherencia visual.

---

## 📝 Notas de Implementación

### Tailwind CSS
Para usar estos colores en Tailwind, se pueden definir como colores personalizados en `tailwind.config.js`:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        'kepler-purple': '#4A0072',
        'kepler-magenta': '#C2185B',
        'kepler-orange': '#FF8C00',
        'kepler-violet': '#8A2BE2',
        'kepler-dark-blue': '#191970',
        'kepler-cream': '#FFFEF7',
        'kepler-dark-purple': '#2E003E',
      }
    }
  }
}
```

### CSS Variables (Alternativa)
```css
:root {
  --kepler-purple: #4A0072;
  --kepler-magenta: #C2185B;
  --kepler-orange: #FF8C00;
  --kepler-violet: #8A2BE2;
  --kepler-dark-blue: #191970;
  --kepler-cream: #FFFEF7;
  --kepler-dark-purple: #2E003E;
  --kepler-black: #000000;
}
```

---

## ✅ Reglas de Uso

1. **CTAs siempre en negro:** Todos los botones de acción principal deben usar `neutral-900` o `#000000`
2. **Gradientes solo en elementos decorativos:** Cards, widgets, badges
3. **Fondo consistente:** `#FFFEF7` en toda la aplicación
4. **Sidebar oscuro:** `neutral-900` para el sidebar del dashboard
5. **Texto legible:** Siempre usar suficiente contraste (negro sobre claro, blanco sobre oscuro)

---

**Última actualización:** 2024
**Versión:** 1.0

