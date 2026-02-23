import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { es } from "./es";
import { en } from "./en";

export type Lang = "es" | "en";

const translations = { es, en } as const;

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

function getNestedValue(obj: Record<string, any>, path: string): string {
  const val = path.split(".").reduce((acc, part) => acc?.[part], obj);
  return typeof val === "string" ? val : path;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = localStorage.getItem("lang");
    if (stored === "en" || stored === "es") return stored;
    // Auto-detect from browser
    const browserLang = navigator.language?.slice(0, 2);
    return browserLang === "es" ? "es" : "en";
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("lang", l);
    document.documentElement.lang = l;
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key: string) => getNestedValue(translations[lang], key);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
