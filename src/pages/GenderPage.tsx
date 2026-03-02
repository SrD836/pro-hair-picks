import { Link, useLocation } from "react-router-dom";
import { SEOHead } from "@/components/seo/SEOHead";
import { motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import { menGroups, womenGroups, mixedCategories } from "@/data/categories";

const genderConfig = {
  hombre: {
    title: { es: "Barbería & Hombre", en: "Barbershop & Men" },
    subtitle: {
      es: "Clippers, trimmers, tijeras y todo el equipamiento profesional",
      en: "Clippers, trimmers, scissors and all professional equipment",
    },
    accent: "#C4A97D",
    image: "/images/section-barber.webp",
    fallback: "/images/section-barber.jpg",
  },
  mujer: {
    title: { es: "Peluquería & Mujer", en: "Hair Salon & Women" },
    subtitle: {
      es: "Secadores, planchas, tintes y tratamientos profesionales",
      en: "Dryers, straighteners, colors and professional treatments",
    },
    accent: "#D4956A",
    image: "/images/section-salon.webp",
    fallback: "/images/section-salon.jpg",
  },
  mixto: {
    title: { es: "Salón Mixto", en: "Unisex Salon" },
    subtitle: {
      es: "Mobiliario, vaporizado y accesorios para salones completos",
      en: "Furniture, steaming and accessories for full salons",
    },
    accent: "#8BAF7C",
    image: "/images/section-mixto.webp",
    fallback: "/images/section-mixto.jpg",
  },
};

const GenderPage = () => {
  const location = useLocation();
  const gender = location.pathname.replace("/", "");
  const { lang, t } = useLanguage();

  const config = genderConfig[gender as keyof typeof genderConfig];
  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#F5F0E8]">
        Not found
      </div>
    );
  }

  const groups =
    gender === "hombre"
      ? menGroups
      : gender === "mujer"
      ? womenGroups
      : [{ section: lang === "es" ? "Todas" : "All", sectionKey: "todas", items: mixedCategories }];

  const title = config.title[lang as "es" | "en"] || config.title.es;
  const subtitle = config.subtitle[lang as "es" | "en"] || config.subtitle.es;

  return (
    <>
      <SEOHead
        title={`${title} | GuiaDelSalon.com`}
        description={subtitle}
      />

      <div className="min-h-screen" style={{ background: "#1a1008" }}>
        {/* Hero banner */}
        <div className="relative h-48 md:h-64 overflow-hidden">
          <picture>
            <source srcSet={config.image} type="image/webp" />
            <img
              src={config.fallback}
              alt={title}
              className="w-full h-full object-cover"
            />
          </picture>
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(26,16,8,0.4), rgba(26,16,8,0.85))",
            }}
          />
          <div className="absolute bottom-0 left-0 px-6 md:px-12 pb-8">
            <div
              className="w-8 h-0.5 rounded-full mb-3"
              style={{ background: config.accent }}
            />
            <h1 className="font-display font-bold text-[#F5F0E8] text-2xl md:text-4xl mb-1">
              {title}
            </h1>
            <p className="text-[#F5F0E8]/60 text-sm max-w-lg">{subtitle}</p>
          </div>
        </div>

        {/* Categories grid */}
        <div className="px-6 md:px-12 py-10 space-y-8">
          {groups.map((group, gi) => (
            <motion.div
              key={group.section}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: gi * 0.08 }}
            >
              <p
                className="text-[10px] font-bold uppercase tracking-[0.18em] mb-3"
                style={{ color: `${config.accent}90` }}
              >
                {t(`catSection.${group.sectionKey}`)}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {group.items.map((item) => (
                  <Link
                    key={item.slug}
                    to={`/categorias/${item.slug}`}
                    className="flex items-center gap-2.5 px-3 py-3.5 rounded-xl text-sm text-[#F5F0E8]/80 hover:text-[#F5F0E8] transition-all"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: `1px solid ${config.accent}15`,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = `${config.accent}12`;
                      (e.currentTarget as HTMLElement).style.borderColor = `${config.accent}40`;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background =
                        "rgba(255,255,255,0.04)";
                      (e.currentTarget as HTMLElement).style.borderColor = `${config.accent}15`;
                    }}
                  >
                    <span className="text-lg shrink-0">{item.icon}</span>
                    <span className="text-xs leading-tight font-medium">{t(`cat.${item.slug}`)}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
};

export default GenderPage;
