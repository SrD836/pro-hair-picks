import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/seo/SEOHead';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, User, Microscope, Palette, FlaskConical, RefreshCw, Sparkles, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { useUserDiagnostics } from '@/hooks/useUserDiagnostics';

const TOOL_EMOJI: Record<string, string> = {
  'diagnostico-capilar': '🔬',
  'asesor-color': '🎨',
  'compatibilidad-quimica': '🧪',
  'recuperacion-capilar': '🌿',
  'analizador-canicie': '🦳',
  'analizador-alopecia': '💈',
};

const TOOLS = [
  { to: '/mi-pelo/asesor-color', icon: Palette, title: 'Asesor de Color', desc: 'Colorimetría personal y tono recomendado.', time: '~3 min' },
  { to: '/mi-pelo/inci-check', icon: FlaskConical, title: 'INCI Check', desc: 'Analiza ingredientes de tus productos.', time: '~2 min' },
  { to: '/mi-pelo/recuperacion-capilar', icon: RefreshCw, title: 'Recuperación Capilar', desc: 'Plan de recuperación personalizado por fases.', time: '~4 min' },
  { to: '/mi-pelo/analizador-canicie', icon: Sparkles, title: 'Analizador de Canas', desc: 'Tipo de canicie y opciones de coloración.', time: '~3 min' },
  { to: '/mi-pelo/analizador-alopecia', icon: Activity, title: 'Analizador de Alopecia', desc: 'Evaluación del patrón de pérdida capilar.', time: '~4 min' },
];

export default function MiPeloPage() {
  const { user } = useAuth();
  const { data: diagnostics } = useUserDiagnostics(user?.id);
  const recent = diagnostics?.slice(0, 5) ?? [];

  return (
    <>
      <SEOHead
        title="Mi Pelo · Diagnósticos Capilares · GuiaDelSalon.com"
        description="Diagnósticos y análisis profesionales para conocer tu cabello desde la ciencia. Asesor de Color, Diagnóstico Capilar, Compatibilidad Química y más."
      />

      {/* Hero */}
      <div className="relative min-h-[300px] w-full overflow-hidden bg-espresso">
        <div className="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/60 to-transparent" />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[300px] text-center px-6 py-16">
          <span className="text-accent-orange text-xs font-bold uppercase tracking-[0.3em] mb-4">
            Diagnóstico Profesional Gratuito
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-cream mb-4 font-display">
            Mi Pelo
          </h1>
          <p className="text-cream/60 max-w-lg text-lg">
            6 herramientas de diagnóstico capilar diseñadas por tricólogos profesionales
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-espresso px-6 pb-16">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Featured: Diagnóstico Capilar */}
          <Link to="/mi-pelo/diagnostico-capilar"
            className="md:col-span-2 group bg-mocha rounded-2xl p-6 border border-cocoa hover:border-accent-orange/50 transition-all flex items-center gap-6"
          >
            <div className="w-16 h-16 rounded-2xl bg-accent-orange/10 flex items-center justify-center shrink-0">
              <Microscope className="text-accent-orange w-8 h-8" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-cream font-bold text-xl">Diagnóstico Capilar</h3>
                <span className="bg-accent-orange text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Más completo
                </span>
              </div>
              <p className="text-cream/60 text-sm">Análisis completo de 12 factores. Tu Pasaporte Capilar personalizado.</p>
              <p className="text-accent-orange text-xs font-bold mt-2 uppercase tracking-wider">~8 min → Iniciar →</p>
            </div>
          </Link>

          {/* Rest of tools */}
          {TOOLS.map((tool) => (
            <Link key={tool.to} to={tool.to}
              className="group bg-mocha rounded-2xl p-6 border border-cocoa hover:border-accent-orange/50 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-accent-orange/10 flex items-center justify-center mb-4">
                <tool.icon className="text-accent-orange w-6 h-6" />
              </div>
              <h3 className="text-cream font-bold text-lg mb-2">{tool.title}</h3>
              <p className="text-cream/60 text-sm mb-3">{tool.desc}</p>
              <p className="text-accent-orange text-xs font-bold uppercase tracking-wider">{tool.time} → Iniciar →</p>
            </Link>
          ))}
        </div>

      </div>

      {/* Auth / History */}
      <div className="bg-espresso">
        <section className="py-16 md:py-20 px-4">
          <div className="max-w-3xl mx-auto bg-mocha rounded-3xl p-8 md:p-12 border border-cocoa">
            {user ? (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gold/15">
                    <User className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-cream font-semibold text-sm">Mis Diagnósticos</p>
                    <p className="text-cream/40 text-xs">{user.email}</p>
                  </div>
                </div>
                {recent.length === 0 ? (
                  <p className="text-cream/50 text-sm">Aún no tienes diagnósticos guardados.</p>
                ) : (
                  <div className="space-y-3 mb-6">
                    {recent.map((d) => (
                      <div key={d.id} className="flex items-center gap-3 p-3 rounded-xl bg-cream/5 border border-cream/[0.08]">
                        <span className="text-xl">{TOOL_EMOJI[d.tool_id] ?? '🔬'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-cream text-sm font-medium truncate">{d.result_summary}</p>
                          <p className="text-cream/40 text-xs flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {format(new Date(d.created_at), 'dd MMM yyyy')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <Link to="/mi-pelo/mis-resultados" className="inline-flex items-center gap-2 text-sm font-semibold text-gold hover:gap-3 transition-all">
                  Ver historial completo <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-4xl mb-4">📋</div>
                <h2 className="font-display font-bold text-cream text-xl md:text-2xl mb-3">
                  Guarda tus resultados. Consulta tu historial.
                </h2>
                <p className="text-cream/55 text-sm max-w-md mx-auto mb-8 leading-relaxed">
                  Crea tu cuenta gratuita para acceder a tu historial completo de diagnósticos.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link to="/mi-pelo/mis-resultados" className="px-6 py-2.5 rounded-full text-sm font-bold bg-gold text-espresso hover:bg-gold-light transition-opacity">
                    Crear cuenta gratuita
                  </Link>
                  <Link to="/mi-pelo/mis-resultados" className="px-6 py-2.5 rounded-full text-sm font-medium border border-gold/30 text-cream hover:bg-white/5 transition-colors">
                    Ya tengo cuenta
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
