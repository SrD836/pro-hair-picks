// src/pages/MisResultadosPage.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/seo/SEOHead';
import { motion } from 'framer-motion';
import { ArrowRight, LogOut, RotateCcw, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserDiagnostics } from '@/hooks/useUserDiagnostics';
import { TOOLS_CONFIG } from '@/data/tools.config';

const TOOL_MAP = Object.fromEntries(TOOLS_CONFIG.map((t) => [t.id, t]));

function friendlyError(msg: string): string {
  if (msg.includes('Invalid login')) return 'Email o contraseña incorrectos.';
  if (msg.includes('Email not confirmed')) return 'Tu cuenta aún no está confirmada. Revisa tu correo.';
  if (msg.includes('already registered') || msg.includes('already been registered'))
    return 'Este email ya está registrado. Inicia sesión.';
  if (msg.includes('Password should be at least'))
    return 'La contraseña debe tener al menos 6 caracteres.';
  if (msg.includes('rate limit') || msg.includes('too many'))
    return 'Demasiados intentos. Espera un momento.';
  if (msg.includes('network') || msg.includes('fetch'))
    return 'Error de conexión. Comprueba tu internet.';
  return msg;
}

export default function MisResultadosPage() {
  const { user, loading } = useAuth();
  const { data: diagnostics, isLoading: loadingDiag } = useUserDiagnostics(user?.id);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  const handleAuth = async () => {
    setAuthError('');
    if (!email.trim()) { setAuthError('Introduce tu email.'); return; }
    if (!password.trim() || password.length < 6) {
      setAuthError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setAuthLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + '/mi-pelo/mis-resultados' },
        });
        if (error) {
          setAuthError(friendlyError(error.message));
        } else {
          setSignUpSuccess(true);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setAuthError(friendlyError(error.message));
      }
    } catch {
      setAuthError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setAuthLoading(false);
    }
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
      <SEOHead title="Mis Diagnósticos · GuiaDelSalon.com" noIndex={true} />

      <div className="min-h-screen py-16 px-4 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link
            to="/mi-pelo"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 inline-block"
          >
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
          {user && <p className="text-muted-foreground text-sm mt-1">{user.email}</p>}
        </motion.div>

        {!user ? (
          /* ── Auth form ── */
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-6 md:p-8"
            style={{ background: '#2D2218', border: '1px solid rgba(196,169,125,0.2)' }}
          >
            {signUpSuccess ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-3">✉️</div>
                <h2 className="font-display font-bold text-[#F5F0E8] text-xl mb-2">¡Cuenta creada!</h2>
                <p className="text-[#F5F0E8]/60 text-sm mb-4 leading-relaxed">
                  Hemos enviado un email de confirmación a <strong className="text-[#C4A97D]">{email}</strong>. 
                  Haz clic en el enlace para activar tu cuenta.
                </p>
                <Button
                  onClick={() => {
                    setIsSignUp(false);
                    setSignUpSuccess(false);
                    setAuthError('');
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Ya confirmé, iniciar sesión
                </Button>
              </div>
            ) : (
              <>
                <h2 className="font-display font-bold text-[#F5F0E8] text-xl mb-1">
                  {isSignUp ? 'Crear cuenta gratuita' : 'Iniciar sesión'}
                </h2>
                <p className="text-[#F5F0E8]/50 text-sm mb-6">
                  {isSignUp
                    ? 'Solo necesitas un email y una contraseña de al menos 6 caracteres.'
                    : 'Accede a tu historial completo de diagnósticos.'}
                </p>
                <div className="space-y-3 mb-4">
                  <Input
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-[#1a1008] border-[#C4A97D]/20 text-[#F5F0E8] placeholder:text-[#F5F0E8]/30"
                  />
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Contraseña (mín. 6 caracteres)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                      className="bg-[#1a1008] border-[#C4A97D]/20 text-[#F5F0E8] placeholder:text-[#F5F0E8]/30 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F5F0E8]/40 hover:text-[#F5F0E8]/70 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {authError && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm bg-red-400/10 rounded-lg px-3 py-2"
                    >
                      {authError}
                    </motion.p>
                  )}
                </div>
                <Button onClick={handleAuth} disabled={authLoading} className="w-full mb-3 gap-2">
                  {authLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSignUp ? 'Crear cuenta' : 'Entrar'}
                </Button>
                <button
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setAuthError('');
                  }}
                  className="w-full text-center text-xs text-[#C4A97D] hover:underline"
                >
                  {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿Sin cuenta? Regístrate gratis'}
                </button>
              </>
            )}
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
                  Completa los 3 módulos y obtén tu informe personalizado.
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
                <p className="text-xs mt-1 text-muted-foreground/60">
                  Completa una herramienta de Mi Pelo y guarda el resultado.
                </p>
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
                  const date = new Date(d.created_at);
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
                        <p className="text-[11px] text-muted-foreground/60 mt-1">
                          📅 {date.toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          })}
                          {' · '}
                          {date.toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      {tool && (
                        <Link
                          to={tool.href}
                          className="shrink-0 p-2 rounded-xl hover:bg-muted/10 transition-colors text-muted-foreground hover:text-foreground"
                          title="Repetir diagnóstico"
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
