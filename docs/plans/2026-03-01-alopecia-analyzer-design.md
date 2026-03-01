# Analizador de Riesgo de Alopecia — Diseño

**Fecha:** 2026-03-01
**Proyecto:** GuiaDelSalon.com (pro-hair-picks)
**Ruta:** `/analizador-alopecia`

---

## Contexto

Módulo espejo de CanicieAnalyzer (src/components/CanicieAnalyzer.tsx, 1109 líneas).
Mismo patrón arquitectónico: Page wrapper → Analyzer component + ExpertVerdict + lib/algorithm.

## Archivos a crear

| Archivo | Propósito |
|---|---|
| `src/pages/AlopeciaAnalyzerPage.tsx` | Wrapper de página (Helmet + hero + layout) |
| `src/components/AlopeciaAnalyzer.tsx` | Componente principal — 3 secciones |
| `src/components/AlopeciaExpertVerdict.tsx` | Bloque espresso + citas APA |
| `src/lib/generateAlopeciaReport.ts` | Algoritmo TypeScript puro |
| `supabase/migrations/20260301000001_alopecia_tables.sql` | 4 tablas + RLS + índices |
| `data/alopecia_seed.json` | Factores, tratamientos, mitos (seed para Supabase) |
| `docs/alopecia_research.md` | Investigación con fuentes APA |

## Modificaciones a archivos existentes

- `src/App.tsx`: añadir lazy import + Route `/analizador-alopecia`
- `src/integrations/supabase/types.ts`: añadir tipos de las 4 tablas nuevas

## Algoritmo de riesgo (score 0-100)

```
Genética (50%):
  - padre calvo: +20
  - abuelo materno calvo: +12
  - hermanos calvos: +8
  - inicio < 25 años: +10
  - sexo femenino con síntomas androgénicos: flag hormonal

Inicio (25%):
  - onset_age < 25: 25 puntos
  - onset_age 25-35: 15 puntos
  - onset_age > 35: 8 puntos

Factores externos (25%):
  - estrés >= 8: +8; >= 6: +5; >= 4: +3
  - tabaco: +5
  - déficits >= 2: +6; >= 1: +3
  - dieta deficiente: +6; regular: +3
  - cuero cabelludo seborreico/psoriasis: +2
```

Umbrales: 0-30 bajo | 31-55 moderado | 56-75 alto | 76-100 muy_alto

## Reglas de negocio críticas

1. age < 25 + stage moderada/avanzada → recommended_action = "dermatologo_urgente"
2. sex = female + síntomas androgénicos → flag possible_hormonal_cause + recomendar analítica
3. sex = female + finasterida en current_treatments → BLOQUEAR formulario, mostrar alerta EMA
4. risk_level = muy_alto → CTA médico POR ENCIMA del informe (no al final)
5. Disclaimer médico visible en todo momento bajo el informe

## Estadios

**Hamilton-Norwood (hombres):**
- I: 🟢 Sin pérdida visible
- II: 🟡 Entradas leves en sienes
- III: ⚠️ Entradas profundas o inicio en coronilla
- IV: 🔴 Pérdida fronto-temporal + coronilla separadas
- V: 🔴 Banda fina entre zonas
- VI: 🔴 Zonas fusionadas, pérdida amplia
- VII: 🔴 Solo franja lateral restante

**Ludwig (mujeres):**
- I: 🟡 Ensanchamiento leve en la raya central
- II: ⚠️ Ensanchamiento marcado, pérdida de volumen
- III: 🔴 Pérdida severa en zona frontoparietal

## Base de datos — 4 tablas

1. `alopecia_factors` — factores biológicos/genéticos/externos (pública)
2. `alopecia_treatments` — tratamientos con evidencia por estadio (pública)
3. `alopecia_myths` — mitos vs. ciencia con veredicto (pública)
4. `alopecia_reports` — informes generados, solo owner vía RLS

## Estética

- Fondo: cream #F5F0E8, títulos Playfair Display
- Risk badge ALTO/MUY_ALTO: bg-red-50 border-red-800
- Risk badge MODERADO: bg-amber-50 border #C4A97D
- Risk badge BAJO: bg-green-50 border-green-700
- Score: círculo de progreso en gold con número central
- ExpertVerdict: fondo #2D2218, texto cream, detalles gold
- Mobile-first, md:grid-cols-2 para biblioteca de factores
- PDF: CSS @media print via botón "Descargar Informe"

## Decisiones

- Estadios Hamilton/Ludwig: descripción textual + emoji/badge de color (sin SVG)
- Web search para investigación: sí, ÚNICAMENTE fuentes listadas en spec
- Seed: aplicar a Supabase vía MCP tool tras la migración
