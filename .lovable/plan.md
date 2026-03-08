

## Plan: Rediseño visual exacto basado en las capturas de referencia

### Problema principal
El diseño actual usa iconos abstractos y cards genéricas. Las capturas de referencia muestran un diseño con **fotografías reales** (joyas, mujeres, ojos, texturas de pelo), **acento naranja** (no dorado), y una **navegación horizontal** (Anterior | Continuar lado a lado).

### Limitación crítica: Imágenes
Las capturas muestran fotos reales de stock (pulseras de plata/oro, mujeres con ropa fucsia/naranja, close-ups de ojos). **No disponemos de estos assets fotográficos.** El ZIP subido no pudo ser procesado.

Para replicar el diseño fielmente necesitamos que nos proporciones las imágenes individuales (las fotos de joyas, ojos, mujeres, texturas de pelo) como archivos separados. Sin ellas, puedo:

- Replicar **exactamente** el layout, la estructura, la tipografía, el color naranja y la navegación
- Usar **círculos CSS con gradientes** para simular las texturas de pelo (niveles 1-10)
- Usar **círculos de color sólido** para ojos (ya lo hacemos)
- Usar **cards con fondo de color** para joyería y reacción de color (en vez de fotos)

### Cambios que SÍ puedo implementar ahora (layout + UX exactos):

**1. Acento naranja** — Añadir token `accent-orange: "#ec5b13"` a tailwind.config.ts. Usarlo en:
- Barra de progreso del wizard
- Estado selected de cards (borde naranja + checkmark naranja)
- Botón "Continuar" (bg-accent-orange)
- Porcentaje de progreso

**2. WizardShell.tsx** — Rediseñar según capturas:
- Header: fondo espresso oscuro (no blanco), icono naranja + nombre tool + X
- Progress: "PASO X DE Y" izquierda, porcentaje naranja derecha, barra h-2 naranja

**3. NavigationBar.tsx** — Layout horizontal:
- Flex row: "Anterior" ghost button izquierda + "Continuar al Paso X →" naranja derecha
- NO stacked/full-width como ahora

**4. OptionCard.tsx** — Cards con foto overlay:
- Soporte para prop `image?: string` que renderiza la foto como fondo
- Label en la esquina inferior izquierda con texto blanco sobre gradiente oscuro
- Checkmark naranja (no dorado) en esquina superior derecha
- Sin imagen: fallback a color circle o icono (como ahora pero con borde naranja)

**5. ColorMatchPage.tsx** — Landing rediseñada:
- Página cream con card espresso grande centrada (como imagen 19)
- Dentro de la card: título Playfair, carrusel horizontal de círculos de pelo con labels (1.0 Negro, 4.0 Castaño...), flechas < >, botón "Iniciar Asesoría"
- Wizard: múltiples preguntas visibles por página con separador `<hr>`
- Círculos de pelo con gradientes CSS simulando texturas

**6. Aplicar el mismo patrón a las 6 herramientas restantes**

### Archivos a modificar (~10):
1. `tailwind.config.ts` — token accent-orange
2. `src/components/mi-pelo/shared/WizardShell.tsx` — header espresso + progress naranja
3. `src/components/mi-pelo/shared/NavigationBar.tsx` — layout horizontal
4. `src/components/mi-pelo/shared/OptionCard.tsx` — soporte imagen + acento naranja
5. `src/components/mi-pelo/shared/ToolHeader.tsx` — variante card dentro de cream
6. `src/pages/ColorMatchPage.tsx` — rediseño completo 3 capas
7. `src/pages/DiagnosticoCapilarPage.tsx` — adaptar
8. `src/pages/InciCheckerPage.tsx` — adaptar
9. `src/pages/RecoveryTimelinePage.tsx` — adaptar
10. `src/pages/CanicieAnalyzerPage.tsx` — adaptar
11. `src/pages/AlopeciaAnalyzerPage.tsx` — adaptar
12. `src/pages/CompatibilidadQuimicaPage.tsx` — adaptar

