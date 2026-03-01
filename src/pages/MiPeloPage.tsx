// src/pages/MiPeloPage.tsx
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import ToolCard from '@/components/ToolCard';
import { TOOLS_CONFIG } from '@/data/tools.config';
import { useAuth } from '@/hooks/useAuth';
import { useUserDiagnostics } from '@/hooks/useUserDiagnostics';

const TOOL_EMOJI: Record<string, string> = Object.fromEntries(
  TOOLS_CONFIG.map((t) => [t.id, t.emoji])
);

export default function MiPeloPage() {
  const { user } = useAuth();
  const { data: diagnostics } = useUserDiagnostics(user?.id);
  const recent = diagnostics?.slice(0, 5) ?? [];

  return (
    <>
      <Helmet>
        <title>Mi Pelo · Diagnósticos Capilares · GuiaDelSalon.com</title>
        <meta
          name="description"
          content="Diagnósticos y análisis profesionales para conocer tu cabello desde la ciencia. Asesor de Color, Diagnóstico Capilar, Compatibilidad Química y más."
        />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground">

        {/* ── HERO ──────────────────────────────────────── */}
        <section
          className="relative py-20 md:py-28 px-4 overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #1a1008 0%, #0f0a06 50%, #221508 100%)',
          }}
        >
          {/* Grid lines */}
          <div
            className="absolute inset-0 opacity-[0.025] pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(rgba(196,169,125,1) 1px, transparent 1px), linear-gradient(90deg, rgba(196,169,125,1) 1px, transparent 1px)',
              backgroundSize: '80px 80px',
            }}
          />

          <div className="max-w-3xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6"
                style={{ background: 'rgba(196,169,125,0.1)', border: '1px solid rgba(196,169,125,0.2)' }}
              >
                <Sparkles className="w-3 h-3 text-[#C4A97D]" />
                <span className="text-[#C4A97D] text-xs font-semibold uppercase tracking-widest">
                  Laboratorio Capilar
                </span>
              </div>

              <h1
                className="font-display font-bold text-[#F5F0E8] mb-4"
                style={{ fontSize: 'clamp(2.2rem, 6vw, 3.5rem)', lineHeight: 1.1 }}
              >
                Mi Pelo
              </h1>

              <p className="text-[#F5F0E8]/60 text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
                Diagnósticos y análisis profesionales para conocer tu cabello desde la ciencia
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/mi-pelo/diagnostico-completo"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-200 hover:opacity-90 hover:gap-3"
                  style={{ background: '#C4A97D', color: '#2D2218' }}
                >
                  Comenzar Diagnóstico Completo
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#herramientas"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium border transition-colors hover:bg-white/5"
                  style={{ border: '1px solid rgba(196,169,125,0.25)', color: '#F5F0E8' }}
                >
                  Explorar herramientas individuales
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── TOOL GRID ─────────────────────────────────── */}
        <section id="herramientas" className="py-16 md:py-20 px-4 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10"
          >
            <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-2">
              Herramientas individuales
            </h2>
            <p className="text-muted-foreground text-sm">
              Cada herramienta es independiente. Úsalas en cualquier orden.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TOOLS_CONFIG.map((tool, i) => (
              <ToolCard key={tool.id} tool={tool} index={i} />
            ))}
          </div>
        </section>

        {/* ── AUTH / HISTORIAL ──────────────────────────── */}
        <section className="py-16 md:py-20 px-4">
          <div
            className="max-w-3xl mx-auto rounded-3xl p-8 md:p-12"
            style={{ background: '#2D2218' }}
          >
            {user ? (
              /* ── Authenticated: show last 5 results ── */
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(196,169,125,0.15)' }}>
                    <User className="w-5 h-5 text-[#C4A97D]" />
                  </div>
                  <div>
                    <p className="text-[#F5F0E8] font-semibold text-sm">Mis Diagnósticos</p>
                    <p className="text-[#F5F0E8]/40 text-xs">{user.email}</p>
                  </div>
                </div>

                {recent.length === 0 ? (
                  <p className="text-[#F5F0E8]/50 text-sm">Aún no tienes diagnósticos guardados.</p>
                ) : (
                  <div className="space-y-3 mb-6">
                    {recent.map((d) => (
                      <div
                        key={d.id}
                        className="flex items-center gap-3 p-3 rounded-xl"
                        style={{ background: 'rgba(245,240,232,0.05)', border: '1px solid rgba(245,240,232,0.08)' }}
                      >
                        <span className="text-xl">{TOOL_EMOJI[d.tool_id] ?? '🔬'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[#F5F0E8] text-sm font-medium truncate">{d.result_summary}</p>
                          <p className="text-[#F5F0E8]/40 text-xs flex items-center gap-1 mt-0.5">
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
                  className="inline-flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all"
                  style={{ color: '#C4A97D' }}
                >
                  Ver historial completo <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              /* ── Unauthenticated: auth CTA ── */
              <div className="text-center">
                <div className="text-4xl mb-4">📋</div>
                <h2 className="font-display font-bold text-[#F5F0E8] text-xl md:text-2xl mb-3">
                  Guarda tus resultados. Consulta tu historial.
                </h2>
                <p className="text-[#F5F0E8]/55 text-sm max-w-md mx-auto mb-8 leading-relaxed">
                  Crea tu cuenta gratuita para acceder a tu historial completo de diagnósticos y ver cómo evoluciona la salud de tu cabello.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    to="/mi-pelo/mis-resultados"
                    className="px-6 py-2.5 rounded-full text-sm font-semibold transition-opacity hover:opacity-90"
                    style={{ background: '#C4A97D', color: '#2D2218' }}
                  >
                    Crear cuenta gratuita
                  </Link>
                  <Link
                    to="/mi-pelo/mis-resultados"
                    className="px-6 py-2.5 rounded-full text-sm font-medium border transition-colors hover:bg-white/5"
                    style={{ border: '1px solid rgba(196,169,125,0.3)', color: '#F5F0E8' }}
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
