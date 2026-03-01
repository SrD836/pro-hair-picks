// src/components/SaveResultModal.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Loader2 } from 'lucide-react';
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
  const [authError, setAuthError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

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
    try {
      const { error } = isSignUp
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

      if (error) { setAuthError(error.message); return; }
      await saveResult();
    } catch {
      setAuthError('Error de conexión. Inténtalo de nuevo.');
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
                  {user ? 'Guardar resultado' : 'Guardar (iniciar sesión)'}
                </Button>
                <Button variant="ghost" onClick={onClose} className="w-full text-[#F5F0E8]/50">
                  Continuar sin guardar
                </Button>
              </div>
            </div>
          )}

          {step === 'auth' && (
            <div>
              <h3 className="font-display font-bold text-[#F5F0E8] text-lg mb-1">
                {isSignUp ? 'Crear cuenta gratuita' : 'Iniciar sesión'}
              </h3>
              <p className="text-[#F5F0E8]/50 text-sm mb-5">
                Tu resultado se guardará automáticamente al entrar.
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
                {authError && <p className="text-red-400 text-xs">{authError}</p>}
              </div>
              <Button onClick={handleAuth} className="w-full mb-3">
                {isSignUp ? 'Crear cuenta y guardar' : 'Entrar y guardar'}
              </Button>
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="w-full text-center text-xs text-[#C4A97D] hover:underline"
              >
                {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿Sin cuenta? Regístrate gratis'}
              </button>
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
                Tu resultado está en "Mis diagnósticos".
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
