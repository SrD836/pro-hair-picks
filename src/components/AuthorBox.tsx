import { BadgeCheck } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export function AuthorBox() {
  const { t } = useLanguage();

  return (
    <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-5 mt-10">
      {/* Avatar */}
      <img
        src="https://ui-avatars.com/api/?name=David+G&background=b45309&color=fff&size=80&bold=true&rounded=true"
        alt={t("blog.authorName")}
        className="h-16 w-16 rounded-full object-cover flex-shrink-0"
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="font-semibold text-foreground text-base">{t("blog.authorName")}</span>
          <BadgeCheck className="h-4 w-4 text-secondary flex-shrink-0" aria-label="Verified expert" />
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t("blog.authorBio")}
        </p>
      </div>
    </div>
  );
}
