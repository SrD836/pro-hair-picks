import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/seo/SEOHead';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { TOOLS_CONFIG } from '@/data/tools.config';
import { useAuth } from '@/hooks/useAuth';
import { useUserDiagnostics } from '@/hooks/useUserDiagnostics';
import { CizuraCTA } from '@/components/mi-pelo/shared/CizuraCTA';

const TOOL_EMOJI: Record<string, string> = Object.fromEntries(
  TOOLS_CONFIG.map((t) => [t.id, t.emoji])
);

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

      <div className="min-h-screen bg-background-light text-espresso">

        {/* ── HERO ─────────────────────────────────────────── */}
        <div className="relative w-full overflow-hidden">
          <div className="aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9] w-full bg-espresso relative flex items-end">
            <div className="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/60 to-espresso/30" />
            <div className="relative z-10 p-8 md:p-14">
              <span className="text-gold text-xs font-bold tracking-widest uppercase block mb-3">
                Laboratorio Capilar
              </span>
              <h1 className="text-cream text-4xl md:text-5xl font-display font-bold italic leading-tight mb-3">
                Descubre la salud<br />de tu cabello
              </h1>
              <p className="text-cream/70 text-base max-w-md mb-8 leading-relaxed">
                6 herramientas de diagnóstico profesional gratuitas
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/mi-pelo/diagnostico-completo"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold bg-gold text-espresso hover:bg-gold/90 transition-all"
                >
                  Comenzar Diagnóstico Completo
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#herramientas"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium border border-cream/20 text-cream hover:bg-white/5 transition-colors"
                >
                  Explorar herramientas
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ── TOOL BENTO GRID ──────────────────────────────── */}
        <section id="herramientas" className="py-16 md:py-20 px-4 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10"
          >
            <h2 className="font-display font-bold text-2xl md:text-3xl text-espresso mb-1">
              Herramientas individuales
            </h2>
            <p className="text-espresso/50 text-sm">
              Cada herramienta es independiente. Úsalas en cualquier orden.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TOOLS_CONFIG.map((tool, i) => {
              const isFeatured = tool.id === 'diagnostico-capilar';
              return (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className={isFeatured ? 'md:col-span-2' : ''}
                >
                  <div className="h-full bg-white rounded-2xl p-6 border border-gold/10 bento-card flex flex-col gap-4">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-3xl" role="img" aria-label={tool.title}>
                        {tool.emoji}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {isFeatured && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gold/10 text-gold">
                            Más completo
                          </span>
                        )}
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-espresso/5 text-espresso/50">
                          {tool.badge}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="font-bold text-espresso text-base mb-1">{tool.title}</h3>
                      <p className="text-espresso/60 text-sm leading-relaxed">{tool.description}</p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-gold/10">
                      <span className="text-[10px] uppercase tracking-wider text-espresso/40 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {tool.duration}
                      </span>
                      <Link
                        to={tool.href}
                        className="inline-flex items-center gap-1 text-sm font-bold text-gold hover:gap-2 transition-all"
                      >
                        Iniciar <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ── CIZURA CTA ───────────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-4 pb-4">
          <CizuraCTA />
        </div>

        {/* ── AUTH / HISTORIAL ─────────────────────────────── */}
        <section className="py-16 md:py-20 px-4">
          <div className="max-w-3xl mx-auto bg-espresso rounded-3xl p-8 md:p-12">
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
                      <div
                        key={d.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-cream/5 border border-cream/[0.08]"
                      >
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

                <Link
                  to="/mi-pelo/mis-resultados"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-gold hover:gap-3 transition-all"
                >
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
                  <Link
                    to="/mi-pelo/mis-resultados"
                    className="px-6 py-2.5 rounded-full text-sm font-bold bg-gold text-espresso hover:bg-gold/90 transition-opacity"
                  >
                    Crear cuenta gratuita
                  </Link>
                  <Link
                    to="/mi-pelo/mis-resultados"
                    className="px-6 py-2.5 rounded-full text-sm font-medium border border-gold/30 text-cream hover:bg-white/5 transition-colors"
                  >
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
