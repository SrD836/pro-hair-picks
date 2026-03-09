import { Info } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export function DisclaimerAI() {
  const { t } = useLanguage();

  return (
    <div className="flex items-start gap-3 rounded-r-lg border-l-4 border-secondary bg-accent/50 px-4 py-3 mt-4">
      <Info className="h-4 w-4 text-secondary flex-shrink-0 mt-0.5" aria-hidden="true" />
      <p className="text-sm text-muted-foreground leading-relaxed">
        <span className="font-medium text-foreground">{t("blog.disclaimerLabel")}</span> {t("blog.disclaimerText")}
      </p>
    </div>
  );
}
