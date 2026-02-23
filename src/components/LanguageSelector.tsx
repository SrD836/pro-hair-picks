import { useLanguage, Lang } from "@/i18n/LanguageContext";

const LanguageSelector = () => {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex items-center bg-muted rounded-sm overflow-hidden border border-border text-xs font-semibold">
      <button
        onClick={() => setLang("es")}
        className={`px-2.5 py-1.5 transition-colors ${
          lang === "es"
            ? "bg-secondary text-secondary-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        ES
      </button>
      <button
        onClick={() => setLang("en")}
        className={`px-2.5 py-1.5 transition-colors ${
          lang === "en"
            ? "bg-secondary text-secondary-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        EN
      </button>
    </div>
  );
};

export default LanguageSelector;
