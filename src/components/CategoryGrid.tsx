import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { menCategories, womenCategories } from "@/data/categories";

const CategoryGrid = () => {
  return (
    <section className="container mx-auto px-4 py-16">
      <CategorySection
        title="Categorías Hombre"
        subtitle="Productos profesionales de barbería y peluquería masculina"
        categories={menCategories}
        gender="hombre"
      />
      <CategorySection
        title="Categorías Mujer"
        subtitle="Herramientas y productos de peluquería femenina"
        categories={womenCategories}
        gender="mujer"
      />
    </section>
  );
};

function CategorySection({
  title,
  subtitle,
  categories,
  gender,
}: {
  title: string;
  subtitle: string;
  categories: { name: string; slug: string; icon: string }[];
  gender: string;
}) {
  return (
    <div className="mb-16">
      <div className="mb-8">
        <h2 className="font-display text-3xl font-bold text-foreground">{title}</h2>
        <p className="text-muted-foreground mt-2">{subtitle}</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.slug}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.03, duration: 0.3 }}
          >
            <Link
              to={`/${gender}/${cat.slug}`}
              className="group flex flex-col items-center gap-3 p-5 bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-card-hover transition-all duration-200"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform duration-200">
                {cat.icon}
              </span>
              <span className="text-sm font-medium text-foreground text-center leading-tight">
                {cat.name}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default CategoryGrid;
