import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Cookie, Settings, X } from "lucide-react";

type CookieConsent = {
  necessary: boolean;
  analytics: boolean;
  advertising: boolean;
  timestamp: number;
};

const CONSENT_KEY = "cookie_consent";
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

function getStoredConsent(): CookieConsent | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CookieConsent;
    if (Date.now() - parsed.timestamp > ONE_YEAR_MS) {
      localStorage.removeItem(CONSENT_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [advertising, setAdvertising] = useState(true);

  useEffect(() => {
    const consent = getStoredConsent();
    if (!consent) {
      // Small delay so it doesn't flash on load
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const saveConsent = (consent: CookieConsent) => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    setVisible(false);
  };

  const acceptAll = () => {
    saveConsent({ necessary: true, analytics: true, advertising: true, timestamp: Date.now() });
  };

  const rejectAll = () => {
    saveConsent({ necessary: true, analytics: false, advertising: false, timestamp: Date.now() });
  };

  const saveConfig = () => {
    saveConsent({ necessary: true, analytics, advertising, timestamp: Date.now() });
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-4 duration-300">
      <div className="max-w-3xl mx-auto bg-card border border-border rounded-2xl shadow-lg p-5">
        {!showConfig ? (
          <>
            <div className="flex items-start gap-3">
              <Cookie className="w-6 h-6 text-secondary shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-display font-bold text-foreground text-sm">🍪 Utilizamos cookies</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Este sitio utiliza cookies propias y de terceros (Google AdSense, Google Analytics) para mejorar tu experiencia y mostrar anuncios personalizados. Puedes aceptar, rechazar o configurar tus preferencias.{" "}
                  <Link to="/politica-cookies" className="text-primary hover:underline">Más información</Link>.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <Button onClick={acceptAll} size="sm" className="bg-primary text-primary-foreground">
                Aceptar todas
              </Button>
              <Button onClick={rejectAll} size="sm" variant="outline">
                Rechazar
              </Button>
              <Button onClick={() => setShowConfig(true)} size="sm" variant="ghost" className="gap-1">
                <Settings className="w-3 h-3" /> Configurar
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-foreground text-sm">Configurar cookies</h3>
              <button onClick={() => setShowConfig(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-foreground">Cookies técnicas</p>
                  <p className="text-xs text-muted-foreground">Necesarias para el funcionamiento del sitio</p>
                </div>
                <input type="checkbox" checked disabled className="w-4 h-4 accent-primary" />
              </label>

              <label className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-foreground">Cookies analíticas</p>
                  <p className="text-xs text-muted-foreground">Google Analytics para mejorar el sitio</p>
                </div>
                <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} className="w-4 h-4 accent-primary" />
              </label>

              <label className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-foreground">Cookies publicitarias</p>
                  <p className="text-xs text-muted-foreground">Google AdSense y anuncios personalizados</p>
                </div>
                <input type="checkbox" checked={advertising} onChange={(e) => setAdvertising(e.target.checked)} className="w-4 h-4 accent-primary" />
              </label>
            </div>

            <div className="flex gap-2 mt-4">
              <Button onClick={saveConfig} size="sm" className="bg-primary text-primary-foreground">
                Guardar preferencias
              </Button>
              <Button onClick={acceptAll} size="sm" variant="outline">
                Aceptar todas
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
