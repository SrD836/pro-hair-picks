import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Scissors, Sparkles, Users } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface FeaturedCat {
  name: string;
  slug: string;
  icon: string;
}

const menTop: FeaturedCat[] = [
  { name: "Clippers", slug: "clippers", icon: "✂️" },
  { name: "Trimmers", slug: "trimmers", icon: "🔧" },
  { name: "Ceras y pomadas", slug: "ceras-y-pomadas", icon: "🫙" },
  { name: "Navajas y cuchillas", slug: "navajas-y-cuchillas", icon: "🔪" },
  { name: "Sillones de barbero", slug: "sillones-de-barbero-hidraulico", icon: "💺" },
];

const womenTop: FeaturedCat[] = [
  { name: "Secadores profesionales", slug: "secadores-profesionales", icon: "💨" },
  { name: "Planchas de pelo", slug: "planchas-de-pelo", icon: "🔥" },
  { name: "Tijeras profesionales", slug: "tijeras-profesionales", icon: "✂️" },
  { name: "Tintes", slug: "tintes", icon: "🎨" },
  { name: "Tratamientos capilares", slug: "tratamientos-capilares-profundos", icon: "💆" },
];

const mixedTop: FeaturedCat[] = [
  { name: "Capas y delantales", slug: "capas-y-delantales", icon: "👔" },
  { name: "Maniquíes de práctica", slug: "maniquies-de-practica", icon: "👩" },
  { name: "Productos para el cabello", slug: "productos-para-el-cabello", icon: "💈" },
];

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

function CategoryBlock({
  title,
  icon: Icon,
  categories,
  delay = 0,
}: {
  title: string;
  icon: React.ElementType;
  categories: FeaturedCat[];
  delay?: number;
}) {
  const { t } = useLanguage();
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 rounded-sm bg-secondary/10 text-secondary">
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="font-display text-xl font-bold text-secondary">{title}</h3>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid grid-cols-1 gap-2"
      >
        {categories.map((cat) => (
          <motion.div key={cat.slug} variants={staggerItem}>
            <Link
              to={`/categorias/${cat.slug}`}
              className="group flex items-center gap-3 px-4 py-3 bg-card rounded-sm border border-border hover:border-l-[3px] hover:border-l-secondary hover:bg-accent hover:translate-x-1 transition-all duration-200"
            >
              <span className="text-xl text-secondary transition-transform duration-200 group-hover:scale-[1.2]">
                {cat.icon}
              </span>
              <span className="text-sm font-medium text-foreground group-hover:text-secondary transition-colors">
                {t(`cat.${cat.slug}`)}
              </span>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

const FeaturedCategories = () => (
  <section className="container mx-auto px-4 py-16 md:py-20">
    <div className="text-center mb-12">
      <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
        Categorías Destacadas
      </h2>
      <p className="text-muted-foreground max-w-lg mx-auto">
        Lo más consultado por profesionales del sector
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
      <CategoryBlock title="Hombre" icon={Scissors} categories={menTop} delay={0} />
      <CategoryBlock title="Mujer" icon={Sparkles} categories={womenTop} delay={0.1} />
      <CategoryBlock title="Mixto" icon={Users} categories={mixedTop} delay={0.2} />
    </div>
  </section>
);

export default FeaturedCategories;
