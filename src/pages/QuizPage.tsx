import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAffiliateLinks } from "@/hooks/useAffiliateLinks";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import ProductCard from "@/components/ProductCard";
import {
  Scissors, Wind, Sofa, User, Zap, Palette, Sparkles, ShieldCheck,
  Euro, Star, ThumbsUp, Clock, RotateCcw, ArrowRight, Store,
} from "lucide-react";
import { SEOHead } from "@/components/seo/SEOHead";

/* ─── Types ─────────────────────────────────────── */
type SalonType = "barberia" | "peluqueria" | "mixto" | "personal";

interface Option {
  label: string;
  value: string;
  icon: React.ReactNode;
}

/* ─── Options map ───────────────────────────────── */
const salonOptions: Option[] = [
  { label: "Barbería hombre", value: "barberia", icon: <Scissors className="w-6 h-6" /> },
  { label: "Peluquería mujer", value: "peluqueria", icon: <Wind className="w-6 h-6" /> },
  { label: "Salón mixto", value: "mixto", icon: <Store className="w-6 h-6" /> },
  { label: "Uso personal", value: "personal", icon: <User className="w-6 h-6" /> },
];

const productOptionsBySalon: Record<SalonType, Option[]> = {
  barberia: [
    { label: "Cortapelos", value: "Clippers", icon: <Scissors className="w-6 h-6" /> },
    { label: "Trimmers", value: "Trimmers", icon: <Zap className="w-6 h-6" /> },
    { label: "Afeitadoras", value: "Shavers (afeitadoras)", icon: <Sparkles className="w-6 h-6" /> },
    { label: "Productos barba", value: "Productos para la barba", icon: <User className="w-6 h-6" /> },
  ],
  peluqueria: [
    { label: "Secadores", value: "Secadores profesionales", icon: <Wind className="w-6 h-6" /> },
    { label: "Planchas", value: "Planchas de pelo", icon: <Zap className="w-6 h-6" /> },
    { label: "Tintes", value: "Tintes", icon: <Palette className="w-6 h-6" /> },
    { label: "Tratamientos", value: "Tratamientos capilares profundos", icon: <Sparkles className="w-6 h-6" /> },
  ],
  mixto: [
    { label: "Mobiliario", value: "Sillones de tocador", icon: <Sofa className="w-6 h-6" /> },
    { label: "Tijeras", value: "Tijeras profesionales", icon: <Scissors className="w-6 h-6" /> },
    { label: "Desinfección", value: "Esterilizadores y desinfección", icon: <ShieldCheck className="w-6 h-6" /> },
    { label: "Consumibles", value: "Desechables", icon: <Sparkles className="w-6 h-6" /> },
  ],
  personal: [
    { label: "Cortapelos", value: "Clippers", icon: <Scissors className="w-6 h-6" /> },
    { label: "Afeitadoras", value: "Shavers (afeitadoras)", icon: <Zap className="w-6 h-6" /> },
    { label: "Productos barba", value: "Productos para la barba", icon: <User className="w-6 h-6" /> },
    { label: "Cuidado capilar", value: "Champús técnicos", icon: <Sparkles className="w-6 h-6" /> },
  ],
};

const budgetOptions: Option[] = [
  { label: "Hasta 50€", value: "0-50", icon: <Euro className="w-6 h-6" /> },
  { label: "50€ – 150€", value: "50-150", icon: <Euro className="w-6 h-6" /> },
  { label: "150€ – 400€", value: "150-400", icon: <Euro className="w-6 h-6" /> },
  { label: "+400€", value: "400-99999", icon: <Euro className="w-6 h-6" /> },
];

const priorityOptions: Option[] = [
  { label: "Mejor calidad-precio", value: "calidad-precio", icon: <ThumbsUp className="w-6 h-6" /> },
  { label: "Gama profesional top", value: "top", icon: <Star className="w-6 h-6" /> },
  { label: "Fácil de usar", value: "facil", icon: <Zap className="w-6 h-6" /> },
  { label: "Durabilidad", value: "durabilidad", icon: <Clock className="w-6 h-6" /> },
];

/* ─── Slug helper ───────────────────────────────── */
function nameToSlug(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[()]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/* ─── Component ─────────────────────────────────── */
const QuizPage = () => {
  const [step, setStep] = useState(0); // 0-3 = questions, 4 = results
  const [answers, setAnswers] = useState<string[]>([]);

  const salon = answers[0] as SalonType | undefined;
  const category = answers[1];
  const budget = answers[2];
  const priority = answers[3];

  const questions = [
    { title: "¿Para qué tipo de salón trabajas?", options: salonOptions },
    { title: "¿Qué tipo de producto buscas?", options: salon ? productOptionsBySalon[salon] : [] },
    { title: "¿Cuál es tu presupuesto?", options: budgetOptions },
    { title: "¿Qué priorizas más?", options: priorityOptions },
  ];

  const handleSelect = (value: string) => {
    const next = [...answers];
    next[step] = value;
    setAnswers(next);
    setStep((s) => s + 1);
  };

  const reset = () => {
    setStep(0);
    setAnswers([]);
  };

  /* ─── Supabase query with cascading fallback ── */
  const [minPrice, maxPrice] = useMemo(() => {
    if (!budget) return [0, 99999];
    const [a, b] = budget.split("-").map(Number);
    return [a, b];
  }, [budget]);

  // Related categories for fallback step 3
  const relatedCategories = useMemo(() => {
    if (!salon) return [];
    return (productOptionsBySalon[salon] || [])
      .map((o) => o.value)
      .filter((v) => v !== category);
  }, [salon, category]);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["quiz-results", category, budget, priority, salon],
    enabled: step === 4 && !!category && !!budget && !!priority,
    queryFn: async () => {
      const applySort = (q: any) => {
        if (priority === "top") {
          return q.order("classification", { ascending: true }).order("amazon_rating", { ascending: false });
        } else if (priority === "calidad-precio") {
          return q.order("amazon_rating", { ascending: false }).order("current_price", { ascending: true });
        }
        return q.order("amazon_rating", { ascending: false });
      };

      // Step 1: exact category + price range
      const { data: d1, error: e1 } = await applySort(
        supabase
          .from("products")
          .select("*")
          .ilike("category", category)
          .gte("current_price", minPrice)
          .lte("current_price", maxPrice)
      ).limit(3);
      if (e1) throw e1;
      if (d1 && d1.length >= 3) return d1;

      // Step 2: same category, no price filter
      const { data: d2, error: e2 } = await supabase
        .from("products")
        .select("*")
        .ilike("category", category)
        .order("amazon_rating", { ascending: false })
        .limit(3);
      if (e2) throw e2;
      if (d2 && d2.length >= 3) return d2;

      // Step 3: related categories from same salon type
      if (relatedCategories.length > 0) {
        const allCats = [category, ...relatedCategories];
        const { data: d3, error: e3 } = await supabase
          .from("products")
          .select("*")
          .in("category", allCats)
          .order("amazon_rating", { ascending: false })
          .limit(3);
        if (e3) throw e3;
        if (d3 && d3.length > 0) return d3;
      }

      // Final fallback: top rated products overall
      const { data: d4, error: e4 } = await supabase
        .from("products")
        .select("*")
        .order("amazon_rating", { ascending: false })
        .limit(3);
      if (e4) throw e4;
      return d4 || [];
    },
  });

  const productIds = products.map((p: any) => p.id);
  const { data: affiliateLinks = [] } = useAffiliateLinks(productIds);
  const affiliateMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (const l of affiliateLinks) {
      if (l.product_id && l.is_primary) m[l.product_id] = l.affiliate_url;
    }
    return m;
  }, [affiliateLinks]);

  const categorySlug = category ? nameToSlug(category) : "";

  /* ─── Render ──────────────────────────────────── */
  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl min-h-[60vh]">
      <SEOHead
        title="Recomendador de Productos | Guía del Salón"
        description="Encuentra el producto perfecto para tu salón con nuestro quiz personalizado. Responde 4 preguntas y obtén recomendaciones."
      />
      <h1 className="sr-only">Recomendador de Productos para Peluquería</h1>
      {/* Progress */}
      {step < 4 && (
        <div className="mb-8">
          <p className="text-sm text-muted-foreground mb-2 font-medium">
            Pregunta {step + 1} de 4
          </p>
          <Progress value={(step / 4) * 100} className="h-2" />
        </div>
      )}

      <AnimatePresence mode="wait">
        {step < 4 ? (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
          >
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
              {questions[step].title}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {questions[step].options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  className="flex items-center gap-4 p-5 rounded-xl border border-border bg-card text-foreground font-semibold text-left transition-all duration-200 hover:border-primary hover:shadow-card-hover hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                    {opt.icon}
                  </span>
                  {opt.label}
                </button>
              ))}
            </div>

            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Volver
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2 text-center">
              🎯 Tus recomendaciones
            </h2>
            <p className="text-muted-foreground text-center mb-8">
              Basadas en tus respuestas, estos son los mejores productos para ti
            </p>

            {isLoading ? (
              <p className="text-center text-muted-foreground py-12">Buscando los mejores productos…</p>
            ) : products.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">Cargando recomendaciones…</p>
            ) : (
              <div className="space-y-6">
                {products.map((p: any, i: number) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    index={i}
                    affiliateUrl={affiliateMap[p.id]}
                  />
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
              <Button onClick={reset} variant="outline" className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Repetir quiz
              </Button>
              {categorySlug && (
                <Button asChild variant="secondary" className="gap-2">
                  <Link to={`/categorias/${categorySlug}`}>
                    Ver todos los {category}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuizPage;
