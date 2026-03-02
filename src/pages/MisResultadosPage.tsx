// src/pages/MisResultadosPage.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/seo/SEOHead';
import { motion } from 'framer-motion';
import { ArrowRight, LogOut, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserDiagnostics } from '@/hooks/useUserDiagnostics';
import { TOOLS_CONFIG } from '@/data/tools.config';

const TOOL_MAP = Object.fromEntries(TOOLS_CONFIG.map((t) => [t.id, t]));

export default function MisResultadosPage() {
  const { user, loading } = useAuth();
  const { data: diagnostics, isLoading: loadingDiag } = useUserDiagnostics(user?.id);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState('');

  const handleAuth = async () => {
    setAuthError('');
    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error.message);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C4A97D] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="Mis Diagnósticos · GuiaDelSalon.com"
        noIndex={true}
      />

      <div className="min-h-screen py-16 px-4 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link to="/mi-pelo" className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 inline-block">
            ← Mi Pelo
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="font-display font-bold text-2xl md:text-3xl text-foreground">
              Mis Diagnósticos
            </h1>
            {user && (
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Salir
              </button>
            )}
          </div>
          {user && (
            <p className="text-muted-foreground text-sm mt-1">{user.email}</p>
          )}
        </motion.div>

        {!user ? (
          /* ── Auth form ── */
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-6 md:p-8"
            style={{ background: '#2D2218', border: '1px solid rgba(196,169,125,0.2)' }}
          >
            <h2 className="font-display font-bold text-[#F5F0E8] text-xl mb-1">
              {isSignUp ? 'Crear cuenta gratuita' : 'Iniciar sesión'}
            </h2>
            <p className="text-[#F5F0E8]/50 text-sm mb-6">
              Accede a tu historial completo de diagnósticos.
            </p>
            <div className="space-y-3 mb-4">
              <Input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
              />
              {authError && <p className="text-red-400 text-sm">{authError}</p>}
            </div>
            <Button onClick={handleAuth} className="w-full mb-3">
              {isSignUp ? 'Crear cuenta' : 'Entrar'}
            </Button>
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="w-full text-center text-xs text-[#C4A97D] hover:underline"
            >
              {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿Sin cuenta? Regístrate gratis'}
            </button>
          </motion.div>
        ) : (
          /* ── Diagnostics list ── */
          <div>
            {/* Wizard CTA if no complete diagnostic */}
            {diagnostics && !diagnostics.some((d) => d.is_complete_diagnostic) && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-5 rounded-2xl"
                style={{ background: 'rgba(196,169,125,0.08)', border: '1px solid rgba(196,169,125,0.2)' }}
              >
                <p className="text-sm text-[#C4A97D] font-semibold mb-1">Diagnóstico Completo</p>
                <p className="text-xs text-muted-foreground mb-3">
                  Completa los 6 módulos y obtén tu informe personalizado.
                </p>
                <Link
                  to="/mi-pelo/diagnostico-completo"
                  className="inline-flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all"
                  style={{ color: '#C4A97D' }}
                >
                  Comenzar <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            )}

            {loadingDiag ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 rounded-xl bg-muted/20 animate-pulse" />
                ))}
              </div>
            ) : diagnostics?.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <div className="text-4xl mb-4">🔬</div>
                <p className="text-sm">Aún no tienes diagnósticos guardados.</p>
                <Link
                  to="/mi-pelo"
                  className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold"
                  style={{ color: '#C4A97D' }}
                >
                  Explorar herramientas <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {diagnostics?.map((d, i) => {
                  const tool = TOOL_MAP[d.tool_id];
                  return (
                    <motion.div
                      key={d.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-[#C4A97D]/30 transition-colors"
                    >
                      <span className="text-2xl shrink-0">{tool?.emoji ?? '🔬'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {tool?.title ?? d.tool_id}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {d.result_summary}
                        </p>
                        <p className="text-[10px] text-muted-foreground/50 mt-1">
                          {new Date(d.created_at).toLocaleDateString('es-ES', {
                            day: '2-digit', month: 'short', year: 'numeric',
                          })}
                        </p>
                      </div>
                      {tool && (
                        <Link
                          to={tool.href}
                          className="shrink-0 p-2 rounded-xl hover:bg-muted/10 transition-colors text-muted-foreground hover:text-foreground"
                          title="Repetir"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Link>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
