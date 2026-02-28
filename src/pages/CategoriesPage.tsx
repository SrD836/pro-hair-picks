import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import { menGroups, womenGroups, mixedCategories } from "@/data/categories";

const CategoriesPage = () => {
  const { lang } = useLanguage();

  const sections = [
    {
      title: lang === "es" ? "Barbería & Hombre" : "Barbershop & Men",
      accent: "#C4A97D",
      groups: menGroups,
    },
    {
      title: lang === "es" ? "Peluquería & Mujer" : "Hair Salon & Women",
      accent: "#D4956A",
      groups: womenGroups,
    },
    {
      title: lang === "es" ? "Salón Mixto" : "Unisex Salon",
      accent: "#8BAF7C",
      groups: [{ section: lang === "es" ? "Todas las categorías" : "All categories", items: mixedCategories }],
    },
  ];

  const totalCount =
    menGroups.flatMap((g) => g.items).length +
    womenGroups.flatMap((g) => g.items).length +
    mixedCategories.length;

  return (
    <>
      <Helmet>
        <title>
          {lang === "es"
            ? "Todas las Categorías | GuiaDelSalon.com"
            : "All Categories | GuiaDelSalon.com"}
        </title>
      </Helmet>

      <div className="min-h-screen" style={{ background: "#1a1008" }}>
        {/* Header */}
        <div className="px-6 md:px-12 pt-12 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-[#C4A97D] border border-[#C4A97D]/30 rounded-full px-3 py-1 mb-4">
              {lang === "es" ? "Catálogo Completo" : "Full Catalog"}
            </span>
            <h1
              className="font-display font-bold text-[#F5F0E8] mb-3"
              style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}
            >
              {lang === "es" ? "Todas las Categorías" : "All Categories"}
            </h1>
            <p className="text-[#F5F0E8]/50 text-sm">
              {lang === "es"
                ? `${totalCount}+ categorías disponibles`
                : `${totalCount}+ categories available`}
            </p>
          </motion.div>
        </div>

        {/* Sections */}
        <div className="px-6 md:px-12 pb-16 space-y-12">
          {sections.map((section, si) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: si * 0.1 }}
            >
              {/* Section title */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 rounded-full" style={{ background: section.accent }} />
                <h2 className="font-display font-bold text-[#F5F0E8] text-xl">{section.title}</h2>
              </div>

              {/* Groups */}
              {section.groups.map((group) => (
                <div key={group.section} className="mb-6">
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.15em] mb-3"
                    style={{ color: `${section.accent}80` }}
                  >
                    {group.section}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                    {group.items.map((item) => (
                      <Link
                        key={item.slug}
                        to={`/categorias/${item.slug}`}
                        className="flex items-center gap-2.5 px-3 py-3 rounded-xl text-sm text-[#F5F0E8]/80 hover:text-[#F5F0E8] transition-all"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: `1px solid ${section.accent}15`,
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.background = `${section.accent}10`;
                          (e.currentTarget as HTMLElement).style.borderColor = `${section.accent}35`;
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                          (e.currentTarget as HTMLElement).style.borderColor = `${section.accent}15`;
                        }}
                      >
                        <span className="text-base shrink-0">{item.icon}</span>
                        <span className="text-xs leading-tight">{item.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
};

export default CategoriesPage;
