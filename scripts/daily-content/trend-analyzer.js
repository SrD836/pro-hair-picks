'use strict';
/**
 * trend-analyzer.js — Detecta tendencias del día para el sector peluquería/barbería.
 * Usa Claude API directamente con web_search para buscar noticias actuales.
 * Requiere ANTHROPIC_API_KEY en .env.scripts.
 */

const TREND_PROMPT = `Search for today's top trending news in the professional hairdressing and barbershop industry. Search separately for:
- Spain/LATAM market (in Spanish): nuevas técnicas, productos, tendencias virales en peluquería y barbería en España hoy
- US market (in English): trending haircuts, barbershop news, new professional products, viral techniques in the US today

Return ONLY this JSON:
{
  "es_trending_keywords": ["keyword1", "keyword2", "keyword3"],
  "us_trending_keywords": ["keyword1", "keyword2", "keyword3"],
  "es_trend_context": "brief context for ES trends",
  "us_trend_context": "brief context for US trends"
}
Keywords must be search-intent phrases a professional would Google.`;

/**
 * Llama a Claude API con web_search y devuelve tendencias del día.
 * @returns {Promise<{es: string[], us: string[], es_context: string, us_context: string}>}
 */
async function getTrendingKeywords() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.log('  ⚠️  ANTHROPIC_API_KEY no configurado — sin análisis de tendencias');
    return {};
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{ role: 'user', content: TREND_PROMPT }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errText.slice(0, 200)}`);
    }

    const data = await response.json();

    // El último bloque de tipo 'text' contiene la síntesis con el JSON final
    const textBlock = (data.content || []).filter(b => b.type === 'text').pop();
    if (!textBlock?.text) throw new Error('Sin bloque de texto en la respuesta de tendencias');

    const raw      = textBlock.text;
    const jsonStart = raw.indexOf('{');
    const jsonEnd   = raw.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) throw new Error('Sin JSON en respuesta de tendencias');

    const parsed = JSON.parse(raw.slice(jsonStart, jsonEnd + 1));

    const result = {
      es:         Array.isArray(parsed.es_trending_keywords) ? parsed.es_trending_keywords : [],
      us:         Array.isArray(parsed.us_trending_keywords) ? parsed.us_trending_keywords : [],
      es_context: parsed.es_trend_context || '',
      us_context: parsed.us_trend_context || '',
    };

    console.log(`  ✓ Tendencias ES: ${result.es.slice(0, 2).join(', ')}${result.es.length > 2 ? '...' : ''}`);
    console.log(`  ✓ Tendencias US: ${result.us.slice(0, 2).join(', ')}${result.us.length > 2 ? '...' : ''}`);
    return result;
  } catch (err) {
    console.warn(`  ⚠️  Trend analyzer falló: ${err.message} — usando keywords del Excel`);
    return {};
  }
}

module.exports = { getTrendingKeywords };
