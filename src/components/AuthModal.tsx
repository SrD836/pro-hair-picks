import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

type Tab = "login" | "register";

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const [tab, setTab] = useState<Tab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setError(null);
    setSuccessMsg(null);
  };

  const switchTab = (t: Tab) => {
    setTab(t);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (tab === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setError(error.message);
        } else {
          onClose();
        }
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
          setError(error.message);
        } else {
          setSuccessMsg("Revisa tu email para confirmar tu cuenta");
          setEmail("");
          setPassword("");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="p-0 border-0 bg-transparent shadow-none max-w-md w-full">
        <div className="bg-[#2D2218] rounded-2xl p-6 md:p-8 w-full">
          {/* Tab switcher */}
          <div className="flex gap-0 mb-8 border-b border-white/10">
            <button
              onClick={() => switchTab("login")}
              className={`pb-3 px-1 mr-6 text-sm font-semibold transition-colors relative ${
                tab === "login" ? "text-[#C4A97D]" : "text-white/40 hover:text-white/70"
              }`}
            >
              Iniciar sesión
              {tab === "login" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C4A97D] rounded-full" />
              )}
            </button>
            <button
              onClick={() => switchTab("register")}
              className={`pb-3 px-1 text-sm font-semibold transition-colors relative ${
                tab === "register" ? "text-[#C4A97D]" : "text-white/40 hover:text-white/70"
              }`}
            >
              Crear cuenta
              {tab === "register" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C4A97D] rounded-full" />
              )}
            </button>
          </div>

          {/* Success message */}
          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
              {successMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                autoComplete="email"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-[#C4A97D]/50 focus:ring-[#C4A97D]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
                Contraseña
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete={tab === "login" ? "current-password" : "new-password"}
                minLength={6}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-[#C4A97D]/50 focus:ring-[#C4A97D]/20"
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="bg-[#ec5b13] text-white rounded-xl px-6 py-3 w-full font-semibold text-sm hover:bg-[#d44f0f] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading && (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {tab === "login" ? "Iniciar sesión" : "Crear cuenta"}
            </button>
          </form>

          {/* Tab toggle link */}
          <p className="mt-5 text-center text-sm text-white/40">
            {tab === "login" ? (
              <>
                ¿Sin cuenta?{" "}
                <button
                  onClick={() => switchTab("register")}
                  className="text-[#C4A97D] hover:text-[#C4A97D]/80 font-medium transition-colors"
                >
                  Regístrate
                </button>
              </>
            ) : (
              <>
                ¿Ya tienes cuenta?{" "}
                <button
                  onClick={() => switchTab("login")}
                  className="text-[#C4A97D] hover:text-[#C4A97D]/80 font-medium transition-colors"
                >
                  Inicia sesión
                </button>
              </>
            )}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
