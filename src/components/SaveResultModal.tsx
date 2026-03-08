// src/components/SaveResultModal.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useSaveDiagnostic } from '@/hooks/useUserDiagnostics';
import { useAuth } from '@/hooks/useAuth';
import type { ToolId } from '@/types/tools.types';

interface SaveResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  toolId: ToolId;
  resultSummary: string;
  fullResult: Record<string, unknown>;
}

type Step = 'prompt' | 'auth' | 'saving' | 'done';

function friendlyError(msg: string): string {
  if (msg.includes('Invalid login')) return 'Email o contraseña incorrectos.';
  if (msg.includes('Email not confirmed')) return 'Revisa tu correo y confirma tu cuenta primero.';
  if (msg.includes('already registered') || msg.includes('already been registered'))
    return 'Este email ya está registrado. Inicia sesión.';
  if (msg.includes('Password should be at least'))
    return 'La contraseña debe tener al menos 6 caracteres.';
  if (msg.includes('rate limit') || msg.includes('too many'))
    return 'Demasiados intentos. Espera un momento.';
  return msg;
}

export default function SaveResultModal({
  isOpen,
  onClose,
  toolId,
  resultSummary,
  fullResult,
}: SaveResultModalProps) {
  const { user } = useAuth();
  const saveMutation = useSaveDiagnostic();
  const [step, setStep] = useState<Step>('prompt');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  const saveResult = async () => {
    setStep('saving');
    try {
      await saveMutation.mutateAsync({ toolId, resultSummary, fullResult });
      setStep('done');
    } catch {
      setStep('prompt');
    }
  };

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
        if (error) { setAuthError(friendlyError(error.message)); return; }
        setSignUpSuccess(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) { setAuthError(friendlyError(error.message)); return; }
        // Auto-save after login
        await saveResult();
      }
    } catch {
      setAuthError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handlePromptSave = () => {
    if (user) {
      saveResult();
    } else {
      setStep('auth');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="w-full max-w-md rounded-2xl p-6 relative"
          style={{ background: '#2D2218', border: '1px solid rgba(196,169,125,0.2)' }}
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4 text-[#F5F0E8]/50" />
          </button>

          {step === 'prompt' && (
            <div className="text-center">
              <div className="text-3xl mb-3">💾</div>
              <h3 className="font-display font-bold text-[#F5F0E8] text-lg mb-2">
                ¿Guardar resultado?
              </h3>
              <p className="text-[#F5F0E8]/55 text-sm mb-6 leading-relaxed">
                {resultSummary}
              </p>
              <div className="flex flex-col gap-2">
                <Button onClick={handlePromptSave} className="w-full">
                  {user ? 'Guardar resultado' : 'Guardar (crear cuenta o iniciar sesión)'}
                </Button>
                <Button variant="ghost" onClick={onClose} className="w-full text-[#F5F0E8]/50">
                  Continuar sin guardar
                </Button>
              </div>
            </div>
          )}

          {step === 'auth' && (
            <div>
              {signUpSuccess ? (
                <div className="text-center py-2">
                  <div className="text-3xl mb-3">✉️</div>
                  <h3 className="font-display font-bold text-[#F5F0E8] text-lg mb-2">¡Cuenta creada!</h3>
                  <p className="text-[#F5F0E8]/55 text-sm mb-4 leading-relaxed">
                    Hemos enviado un email de confirmación a <strong className="text-[#C4A97D]">{email}</strong>.
                    Confirma tu cuenta e inicia sesión para guardar tus resultados.
                  </p>
                  <Button
                    onClick={() => {
                      setIsSignUp(false);
                      setSignUpSuccess(false);
                      setAuthError('');
                    }}
                    className="w-full"
                  >
                    Ya confirmé, iniciar sesión
                  </Button>
                </div>
              ) : (
                <>
                  <h3 className="font-display font-bold text-[#F5F0E8] text-lg mb-1">
                    {isSignUp ? 'Crear cuenta gratuita' : 'Iniciar sesión'}
                  </h3>
                  <p className="text-[#F5F0E8]/50 text-sm mb-5">
                    {isSignUp
                      ? 'Solo necesitas un email y una contraseña sencilla.'
                      : 'Tu resultado se guardará automáticamente al entrar.'}
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
                        className="text-red-400 text-xs bg-red-400/10 rounded-lg px-3 py-2"
                      >
                        {authError}
                      </motion.p>
                    )}
                  </div>
                  <Button onClick={handleAuth} disabled={authLoading} className="w-full mb-3 gap-2">
                    {authLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isSignUp ? 'Crear cuenta' : 'Entrar y guardar'}
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
            </div>
          )}

          {step === 'saving' && (
            <div className="text-center py-4">
              <Loader2 className="w-8 h-8 text-[#C4A97D] animate-spin mx-auto mb-3" />
              <p className="text-[#F5F0E8]/70 text-sm">Guardando resultado…</p>
            </div>
          )}

          {step === 'done' && (
            <div className="text-center py-4">
              <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
              <h3 className="font-bold text-[#F5F0E8] text-lg mb-1">¡Guardado!</h3>
              <p className="text-[#F5F0E8]/55 text-sm mb-4">
                Tu resultado está disponible en "Mis diagnósticos".
              </p>
              <Button onClick={onClose} variant="outline" className="w-full">
                Cerrar
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
