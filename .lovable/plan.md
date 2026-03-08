

## Plan: Rediseno visual "Guia del Salon" para todas las herramientas Mi Pelo

### Problema 1: Dropdown "Mi Pelo" se cierra al instante
El bug persiste porque el `HairToolsDropdown` usa `onMouseLeave={onClose}` que llama a `scheduleClose` (150ms delay), pero cuando el usuario hace click para abrir, el mouse puede salir del area del dropdown momentaneamente. El fix real requiere que el dropdown permanezca abierto tras click explícito y solo se cierre al hacer click fuera o seleccionar un item.

**Fix**: Cambiar la logica en `Navbar.tsx` para que `onClick` haga toggle permanente (sin `scheduleClose` en `onMouseLeave` cuando fue abierto por click), y solo cerrar al navegar o al hacer click fuera (con un `useEffect` + document click listener).

### Problema 2: Rediseno visual de las 7 herramientas

Basandome en las capturas de referencia, el nuevo estilo es:
- **Fondo cream (#F5F0E8)** en vez de espresso oscuro para el wizard y resultados
- **Cards blancas** con bordes suaves y sombras leves
- **Circulos de color** grandes como selectores visuales (skin tones, hair levels)
- **Barra de progreso** con label "PASO X DE Y" + porcentaje + barra gruesa (h-2)
- **Header sticky** con nombre de la tool + boton X para cerrar/volver
- **Boton CTA** dorado ancho full-width en la parte inferior
- **Landing page** con fondo espresso, carrusel de circulos de color (para asesor de color), titulo Playfair Display centrado

#### Cambios por archivo:

**1. `ColorMatchPage.tsx`** (redisenar completo - 3 capas):
- **Landing**: Fondo espresso, titulo grande Playfair centrado, carrusel horizontal de circulos con muestras de color de la DB, boton "Iniciar Asesoria"
- **Wizard**: Fondo cream, header sticky con "EXPERT COLOR MATCHER" + X, barra de progreso gruesa naranja/gold, cards blancas con circulos de color grandes (skin tones con 56px circles), layout 2x2 grid, boton full-width "CONTINUAR →" dorado
- **Resultados**: Fondo espresso top hero + card cream con circulo de color grande, "MATCH 98%", codigo de tono, badges (Frio, Ceniza), panel "Analisis del Experto" + "Tu Paleta" side by side, botones dorados

**2. `DiagnosticoCapilarPage.tsx`**: Misma transformacion - landing espresso, wizard cream con cards blancas, resultados con cards cream

**3. `InciCheckerPage.tsx`**: Landing espresso → scanner en fondo cream 

**4. `RecoveryTimelinePage.tsx`**: Mismo patron

**5. `CanicieAnalyzerPage.tsx`**: Mismo patron

**6. `AlopeciaAnalyzerPage.tsx`**: Mismo patron

**7. `CompatibilidadQuimicaPage.tsx`**: Mismo patron

#### Componentes compartidos a actualizar:

- **`ToolHeader.tsx`**: Landing en espresso (se mantiene), pero ahora con carrusel opcional de color swatches
- **`WizardShell.tsx`**: Cambiar a fondo cream, header sticky con nombre + X, barra de progreso gold h-2 con "PASO X DE Y" y porcentaje
- **`OptionCard.tsx`**: Cards blancas (bg-white), border gris suave, circulos de color prominentes, estado selected con border-gold y checkmark
- **`QuestionCard.tsx`**: Titulo Playfair grande centrado, subtitulo gris, sobre fondo cream
- **`NavigationBar.tsx`**: Fixed bottom con boton "CONTINUAR →" full-width dorado + "Anterior" ghost

#### Tokens en `tailwind.config.ts`:
Verificar que `background-light: "#F5F0E8"` existe como token para el fondo del wizard.

### Archivos a modificar (estimacion ~12 archivos):
1. `src/components/Navbar.tsx` - fix dropdown permanente
2. `tailwind.config.ts` - token background-light si falta
3. `src/components/mi-pelo/shared/WizardShell.tsx` - fondo cream, header con X
4. `src/components/mi-pelo/shared/OptionCard.tsx` - cards blancas
5. `src/components/mi-pelo/shared/QuestionCard.tsx` - centrado, Playfair
6. `src/components/mi-pelo/shared/NavigationBar.tsx` - boton full-width dorado
7. `src/pages/ColorMatchPage.tsx` - rediseno completo 3 capas
8. `src/pages/DiagnosticoCapilarPage.tsx` - adaptar al nuevo estilo
9. `src/pages/InciCheckerPage.tsx` - adaptar
10. `src/pages/RecoveryTimelinePage.tsx` - adaptar
11. `src/pages/CanicieAnalyzerPage.tsx` - adaptar
12. `src/pages/AlopeciaAnalyzerPage.tsx` - adaptar
13. `src/pages/CompatibilidadQuimicaPage.tsx` - adaptar

### Reglas:
- NO tocar logica de negocio, scoring, queries Supabase
- NO cambiar URLs
- Solo Lucide React para iconos
- Mobile-first, Framer Motion para animaciones

