import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, GitCompare, HelpCircle, Calculator } from "lucide-react";

/* ── Category data ─────────────────────────────── */
const menCats = [
  { name: "Clippers", slug: "clippers", icon: "✂️" },
  { name: "Trimmers", slug: "trimmers", icon: "🔧" },
  { name: "Ceras y pomadas", slug: "ceras-y-pomadas", icon: "🫙" },
  { name: "Sillones de barbero", slug: "sillones-de-barbero-hidraulico", icon: "💺" },
];

const womenCats = [
  { name: "Secadores profesionales", slug: "secadores-profesionales", icon: "💨" },
  { name: "Planchas de pelo", slug: "planchas-de-pelo", icon: "🔥" },
  { name: "Tintes", slug: "tintes", icon: "🎨" },
  { name: "Herramientas ondas y rizos", slug: "herramientas-ondas-y-rizos", icon: "🌀" },
];

const mixedCats = [
  { name: "Capas y delantales", slug: "capas-y-delantales", icon: "👔" },
  { name: "Maniquíes de práctica", slug: "maniquies-de-practica", icon: "👩" },
];

/* ── Tools data ─────────────────────────────────── */
const tools = [
  {
    icon: GitCompare,
    title: "Comparador",
    description: "Compara dos productos lado a lado: especificaciones, precio y valoración.",
    cta: "Comparar",
    href: "/comparar",
  },
  {
    icon: HelpCircle,
    title: "Quiz del Producto Ideal",
    description: "Responde 4 preguntas y te recomendamos la herramienta perfecta para ti.",
    cta: "Empezar quiz",
    href: "/quiz",
  },
  {
    icon: Calculator,
    title: "Calculadora ROI",
    description: "Calcula cuánto tardarás en amortizar tu próxima inversión en equipo.",
    cta: "Usar ahora",
    href: "/calculadora-roi",
  },
];

/* ── Ornamental separator ──────────────────────── */
const Separator = () => (
  <div className="flex items-center gap-4 my-10 md:my-14">
    <div className="flex-1 h-px bg-gradient-to-r from-transparent to-secondary/30" />
    <span className="text-secondary text-lg">✦</span>
    <div className="flex-1 h-px bg-gradient-to-l from-transparent to-secondary/30" />
  </div>
);

/* ── Small category card ───────────────────────── */
function CatCard({
  cat,
  index,
}: {
  cat: { name: string; slug: string; icon: string };
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.35, ease: "easeOut" }}
      whileHover={{
        y: -6,
        boxShadow: "0 20px 40px rgba(196,169,125,0.2)",
        borderColor: "rgba(196,169,125,0.5)",
        transition: { duration: 0.25, ease: "easeOut" },
      }}
      className="rounded-2xl border border-secondary/15 bg-card p-5 cursor-pointer"
    >
      <Link to={`/categorias/${cat.slug}`} className="block h-full">
        <motion.span
          initial={{ opacity: 0, scale: 0.6 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.08 + 0.1, duration: 0.3 }}
          className="block text-5xl mb-3"
        >
          {cat.icon}
        </motion.span>
        <span className="font-display text-sm font-semibold text-foreground block">
          {cat.name}
        </span>
      </Link>
    </motion.div>
  );
}

/* ── Large section header card ─────────────────── */
function SectionCard({
  title,
  description,
  href,
  index,
  colSpan = 2,
}: {
  title: string;
  description: string;
  href: string;
  index: number;
  colSpan?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      whileHover={{
        y: -6,
        boxShadow: "0 20px 40px rgba(196,169,125,0.2)",
        borderColor: "rgba(196,169,125,0.5)",
        transition: { duration: 0.25, ease: "easeOut" },
      }}
      className={`rounded-2xl border border-secondary/15 bg-accent p-6 flex flex-col justify-between cursor-pointer col-span-2 ${
        colSpan === 1 ? "md:col-span-1" : "md:col-span-2"
      }`}
    >
      <Link to={href} className="block h-full group">
        <h3 className="font-display text-2xl font-bold text-secondary mb-2">
          {title}
        </h3>
        <p className="text-muted-foreground text-sm mb-4">{description}</p>
        <span className="inline-flex items-center gap-1 text-secondary text-sm font-medium">
          Explorar
          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </Link>
    </motion.div>
  );
}

/* ── Floating widget for Comparador ────────────── */
const FloatingCompare = () => (
  <div className="absolute -top-5 right-4 hidden md:flex gap-2 bg-accent border border-secondary/30 rounded-lg p-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
    <div className="w-14 h-16 rounded bg-card flex flex-col gap-1.5 p-1.5">
      <div className="h-1.5 w-full rounded-full bg-secondary/40" />
      <div className="h-1.5 w-3/4 rounded-full bg-secondary/25" />
      <div className="h-1.5 w-1/2 rounded-full bg-secondary/20" />
      <div className="mt-auto h-1.5 w-full rounded-full bg-secondary/50" />
    </div>
    <div className="w-px bg-secondary/20 self-stretch" />
    <div className="w-14 h-16 rounded bg-card flex flex-col gap-1.5 p-1.5">
      <div className="h-1.5 w-full rounded-full bg-secondary/40" />
      <div className="h-1.5 w-2/3 rounded-full bg-secondary/25" />
      <div className="h-1.5 w-3/4 rounded-full bg-secondary/20" />
      <div className="mt-auto h-1.5 w-full rounded-full bg-secondary/50" />
    </div>
  </div>
);

/* ── Floating widget for Quiz ──────────────────── */
const FloatingQuiz = () => (
  <div className="absolute -top-5 right-4 hidden md:flex flex-col gap-2 bg-accent border border-secondary/30 rounded-lg p-3 shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
    {[0, 1, 2, 3].map((i) => (
      <div key={i} className="flex items-center gap-2">
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, delay: i * 0.4, repeat: Infinity, ease: "easeInOut" }}
          className="w-2.5 h-2.5 rounded-full border-2 border-secondary"
        />
        <div className="h-1.5 rounded-full bg-secondary/25" style={{ width: 32 + i * 6 }} />
      </div>
    ))}
  </div>
);

/* ── Floating widget for ROI ───────────────────── */
const FloatingROI = () => (
  <div className="absolute -top-5 right-4 hidden md:block bg-accent border border-secondary/30 rounded-md p-3 shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
    <div className="text-[10px] text-muted-foreground mb-1 font-mono">Resultado</div>
    <div className="font-display text-lg font-bold text-emerald-400">
      ROI: +340%
    </div>
    <div className="text-[10px] text-secondary font-mono mt-0.5">6.2 meses</div>
  </div>
);

const floatingWidgets = [FloatingCompare, FloatingQuiz, FloatingROI];

/* ── Tool card ─────────────────────────────────── */
function ToolCard({
  tool,
  index,
}: {
  tool: (typeof tools)[number];
  index: number;
}) {
  const FloatingWidget = floatingWidgets[index];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{
        y: -6,
        boxShadow: "0 20px 40px rgba(196,169,125,0.2)",
        borderColor: "rgba(196,169,125,0.5)",
        transition: { duration: 0.25, ease: "easeOut" },
      }}
      className="relative overflow-visible rounded-2xl border border-secondary/15 border-t-2 border-t-secondary bg-card pt-12 p-5 flex flex-col group"
    >
      <FloatingWidget />
      <div className="p-2.5 rounded-lg bg-secondary/10 text-secondary w-fit mb-4">
        <tool.icon className="w-5 h-5" />
      </div>
      <h3 className="font-display text-lg font-bold text-foreground mb-2">
        {tool.title}
      </h3>
      <p className="text-sm text-muted-foreground mb-5 flex-1">
        {tool.description}
      </p>
      <Link
        to={tool.href}
        className="inline-flex items-center justify-center px-4 py-2 rounded bg-secondary text-secondary-foreground text-sm font-semibold hover:bg-secondary/90 transition-colors"
      >
        {tool.cta}
      </Link>
    </motion.div>
  );
}

/* ── Main Bento Grid ───────────────────────────── */
const HomeBentoGrid = () => {
  let catIndex = 0;

  return (
    <section className="container mx-auto px-4 py-16 md:py-20">
      {/* Section title */}
      <div className="text-center mb-12">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
          Categorías Destacadas
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Lo más consultado por profesionales del sector
        </p>
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 max-w-6xl mx-auto">
        {/* Row 1: Section headers */}
        <SectionCard
          title="Hombre"
          description="Barbería clásica y fade perfecto"
          href="/hombre"
          index={catIndex++}
        />
        <SectionCard
          title="Mujer"
          description="Herramientas de estilismo profesional"
          href="/mujer"
          index={catIndex++}
        />
        <SectionCard
          title="Mixto"
          description="Para salones completos"
          href="/mixto"
          index={catIndex++}
          colSpan={1}
        />

        {/* Row 2-3: Category cards */}
        {menCats.slice(0, 2).map((cat) => (
          <CatCard key={cat.slug} cat={cat} index={catIndex++} />
        ))}
        {womenCats.slice(0, 2).map((cat) => (
          <CatCard key={cat.slug} cat={cat} index={catIndex++} />
        ))}
        <CatCard cat={mixedCats[0]} index={catIndex++} />

        {menCats.slice(2).map((cat) => (
          <CatCard key={cat.slug} cat={cat} index={catIndex++} />
        ))}
        {womenCats.slice(2).map((cat) => (
          <CatCard key={cat.slug} cat={cat} index={catIndex++} />
        ))}
        <CatCard cat={mixedCats[1]} index={catIndex++} />
      </div>

      <Separator />

      {/* Tools section */}
      <div className="text-center mb-12">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
          Herramientas del Salón
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Recursos diseñados para que tomes mejores decisiones de compra
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-5xl mx-auto">
        {tools.map((tool, i) => (
          <ToolCard key={tool.title} tool={tool} index={i} />
        ))}
      </div>
    </section>
  );
};

export default HomeBentoGrid;
