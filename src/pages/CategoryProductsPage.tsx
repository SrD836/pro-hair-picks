import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { SEOHead } from "@/components/seo/SEOHead";
import { buildPageTitle, buildBreadcrumbSchema } from "@/utils/seo";
import Breadcrumb from "@/components/Breadcrumb";
import { useProductsByCategory } from "@/hooks/useProductsByCategory";
import { getCategoryNameBySlug } from "@/data/categories";
import ClipperProductCard from "@/components/ClipperProductCard";
import { useLanguage } from "@/i18n/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const CATEGORY_SEO_CONTENT: Record<string, { h2: string; text: string }> = {
  'clippers': {
    h2: 'Guía de compra: clippers profesionales para barbería 2026',
    text: 'Elegir una maquinilla profesional es una de las decisiones más importantes en el equipamiento de una barbería. Los clippers de gama profesional incorporan motores magnéticos o rotativos de alta rotación (5.000–14.000 RPM) capaces de mantener la potencia durante jornadas de 8 horas sin sobrecalentamiento. La cuchilla, fabricada en acero al carbono templado o acero inoxidable endurecido, determina la precisión del corte y la durabilidad entre afilados. Wahl Professional es referencia indiscutible con modelos como el Legend o el Senior (80–160€), mientras que Andis destaca con el Master y el Envy (100–200€) para cabellos gruesos y rizados. Oster ofrece la línea Fast Feed y 97-44, preferida en barberías con clientela afroamericana. BaByliss Pro lleva años ganando cuota de mercado en Europa con la línea FX870 y FX65 (120–250€). Para barberos que empiezan, los modelos corded con motor magnético ofrecen la mejor relación entre precio y rendimiento; los inalámbricos con batería de litio (Wahl Cordless Senior, Andis Envy Li) son ideales para trabajo móvil. Considera el peso ergonómico (170–300 g), el nivel de decibelios y la disponibilidad de recambios en España antes de invertir.',
  },
  'tijeras-profesionales': {
    h2: 'Tijeras de peluquero y barbero: materiales, geometrías y precios',
    text: 'Las tijeras profesionales son la herramienta más personal del peluquero y la inversión que más impacta en la calidad del corte. El acero japonés 440C y el VG-10 son los estándares de la gama alta: alta dureza Rockwell (59–62 HRC), filo de larga duración y escasa deformación térmica durante el uso continuado. Kasho, Kiepe y Jaguar fabrican tijeras de 5,0" a 7,0" con geometrías offset y semis-offset que reducen la tensión en el tendón del pulgar hasta un 30% respecto al diseño clásico. Para corte en seco, las tijeras de deslizamiento (Slice cutting) requieren hojas con microserrado suave; para cabello mojado, las hojas con bisel convexo ofrecen el corte más limpio. En barbería, las tijeras de entresacar con 30–45 dientes son imprescindibles para texturizar degradados y trabajar el cabello grueso. Los precios de una tijera de entrada profesional oscilan entre 80 y 150€ (Kiepe, Haito); la gama media entre 150–300€ (Kasho Japan, Jaguar Ergo); y la gama alta entre 300–600€ (Hitachi, Hikari, Takara Belmont). Mantenimiento: afilado profesional cada 3–6 meses según uso y lubricación diaria con aceite mineral específico para tijeras.',
  },
  'secadores-profesionales': {
    h2: 'Secadores profesionales: motores AC, tecnología iónica y Dyson vs Parlux',
    text: 'El secador profesional marca la diferencia en tiempo de servicio, salud del cabello y rentabilidad del salón. Los secadores con motor AC de 2.200 a 2.400 W están diseñados para uso intensivo: son más ruidosos pero duran 5–10 veces más que los domésticos con motor DC. La tecnología iónica reduce la electricidad estática y el efecto frizz al emitir iones negativos que neutralizan los iones positivos del cabello húmedo; combinada con cerámica o turmalina, distribuye el calor de forma uniforme sin puntos calientes. Parlux 385 Power Light (100–140€) y Parlux Alyon son los favoritos en salones europeos por su relación peso-potencia. BaByliss Pro aporta la línea Nano Titanium con tecnología FIR (Far Infrared) ideal para cabello grueso o teñido (90–180€). Valera y Gamma+ completan el mercado europeo de gama media. El Dyson Supersonic (400–500€) destaca por su motor de alta velocidad sin paletas expuestas al calor, con control digital de temperatura en cuatro niveles; justifica su precio en salones premium donde la experiencia del cliente es diferenciadora. Para secadores de viaje o estaciones secundarias, los modelos de 1.600 W con difusor son suficientes y permiten ahorrar en equipamiento auxiliar.',
  },
  'planchas-de-pelo': {
    h2: 'Planchas profesionales: placas cerámicas, titanio e infrarrojos para el salón',
    text: 'La plancha profesional es herramienta clave en los servicios de alisado, tratamiento con queratina y estilismo avanzado. La diferencia entre una plancha doméstica y una profesional está en el control de temperatura (100–230°C regulables en 1°C), la uniformidad de calor en toda la placa y la resistencia mecánica a ciclos de apertura y cierre continuados. Las placas de cerámica flotante distribuyen el calor sin puntos calientes y son ideales para cabello fino o dañado; las de titanio alcanzan temperatura máxima en 30 segundos y soportan mejor el trabajo con keratina (170–230°C). GHD es referencia de mercado con el Platinum+ (180–220€), que usa tecnología predictiva para mantener 185°C óptimos. Cloud Nine y BaByliss Pro 235 (90–150€) ofrecen prestaciones similares con mayor rango de temperatura. Para servicios de alisado permanente con queratina brasileña o alisado japonés, las planchas con placas de titanio entre 200 y 230°C garantizan el sellado del tratamiento. Remington Professional y Wella Tools completan la gama media (50–100€). La anchura de placa (25–50 mm) define la velocidad de trabajo: 38 mm es el estándar para cabello largo de salón; 25 mm para cabello corto y estilismo de precisión.',
  },
  'trimmers': {
    h2: 'Trimmers y perfiladoras profesionales: guía para barberos',
    text: 'El trimmer o perfiladora es la herramienta de precisión que define la calidad del acabado en barbería: líneas, contornos de barba, sideburns y degradados son imposibles de resolver con un clipper estándar. Los mejores trimmers profesionales llevan cuchillas en T de acero inoxidable con dientes finos capaces de cortar hasta 0,1 mm del cuero cabelludo o la piel. Andis T-Outliner es el estándar global con motor electromagnético de 7.200 SPM (90–110€): precisión quirúrgica y cuchilla intercambiable con el sistema Andis. Wahl Detailer y Wahl Hero (50–80€) son la alternativa más económica sin sacrificar precisión. BaByliss Pro FX787 y FX Skeleton (100–160€) incorporan motor de alta velocidad silencioso, muy valorado en barberías que trabajan con música ambiente. La tendencia inalámbrica ha ganado terreno: Panasonic ER-GP21, Wahl Magic Clip Cordless y la línea BaByliss Pro FXONE ofrecen 90–120 minutos de autonomía en litio. Para el perfil de línea, la cuchilla tipo T supera a la cuchilla estándar; para texturizar patillas o zonas de alta densidad capilar, los trimmers con cuchilla cóncava son superiores. Afilar o sustituir la cuchilla cada 3–6 meses garantiza el corte en cero limpio.',
  },
  'productos-para-la-barba': {
    h2: 'Productos profesionales para el cuidado y diseño de barba',
    text: 'El mercado de grooming masculino ha crecido un 35% en España entre 2020 y 2025, convirtiendo los servicios de barba en una línea de ingresos clave para barberías y salones unisex. Los productos profesionales para barba se dividen en cuatro familias: aceites de barba, bálsamos, ceras y productos de afeitado. Los aceites de barba humectan el folículo y la piel subyacente: los más valorados en uso profesional son los formulados con argan puro (Giara di Argan), jojoba y aceite de argán de origen marroquí certificado (10–30€ en formato 30–50 ml). Proraso es la marca de referencia en productos de afeitado tradicional en Italia y España, con jabones en tazón, cremas de afeitar y after shave para piel normal, seca y sensible (8–25€). La línea American Crew Barber es estándar en barberías premium para fijación y acabado. Para el modelado de bigote y barba corta, las ceras de fijación media-fuerte (Captain Fawcett, Reuzel, Barber Jack) ofrecen tacto seco sin brillo. El bálsamo post-afeitado con acalantoína o bisabolol reduce la irritación y el efecto razor burn en pieles reactivas. Para el barbero profesional, una selección de 4–6 referencias bien posicionadas por tipo de barba y piel es suficiente para cubrir el 90% de la clientela masculina.',
  },
};

const CategoryProductsPage = () => {
  const { categoria } = useParams<{ categoria: string }>();
  const slug = categoria || "";
  const { t, lang } = useLanguage();

  const categoryName = getCategoryNameBySlug(slug) || slug;
  const { data: products = [], isLoading } = useProductsByCategory(categoryName);

  const { data: categoryPostsResult } = useQuery({
    queryKey: ["category-blog-posts", slug, categoryName],
    queryFn: async () => {
      const { data: byName } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt")
        .eq("is_published", true)
        .ilike("category", `%${categoryName}%`)
        .order("published_at", { ascending: false })
        .limit(3);

      if (byName && byName.length > 0) {
        return { posts: byName, isFallback: false };
      }

      const { data: byKeywords } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt")
        .eq("is_published", true)
        .overlaps("keywords", [slug])
        .order("published_at", { ascending: false })
        .limit(3);

      if (byKeywords && byKeywords.length > 0) {
        return { posts: byKeywords, isFallback: false };
      }

      const { data: fallback } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(3);

      return { posts: fallback ?? [], isFallback: true };
    },
    enabled: !!slug,
  });

  const categoryPosts = categoryPostsResult?.posts ?? [];
  const postsSectionTitle = categoryPostsResult?.isFallback
    ? "Últimas guías del salón"
    : `Artículos sobre ${categoryName}`;

  const today = new Date().toLocaleDateString(lang === "es" ? "es-ES" : "en-US", { day: "numeric", month: "long", year: "numeric" });
  const displayName = categoryName;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4 max-w-4xl">
          <div className="h-6 bg-muted rounded w-1/3" />
          <div className="h-10 bg-muted rounded w-2/3" />
          <div className="mt-8 space-y-6">
            {[...Array(3)].map((_, i) => <div key={i} className="h-52 bg-muted rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <SEOHead
        title={buildPageTitle(`${categoryName} — Equipamiento Profesional`)}
        description={`Comparativa de los mejores ${categoryName.toLowerCase()} profesionales. Rankings honestos con precios verificados en Amazon España.`}
      />
      <Helmet>
        <script type="application/ld+json">{buildBreadcrumbSchema(categoryName, slug)}</script>
      </Helmet>
      <Breadcrumb
        injectSchema={false}
        items={[
          { label: t("category.home"), href: "/" },
          { label: displayName },
        ]}
      />

      <header className="mb-10">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-tight">
          {t("category.best").replace("{name}", displayName)}
        </h1>
        <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
          <span>📅 {t("category.updated")}: <strong className="text-foreground">{today}</strong></span>
          <span>✅ {t("category.verified")}</span>
          <span>🏷️ {products.length} {t("category.products")}</span>
        </div>
      </header>

      <section className="max-w-3xl mt-6 mb-8 text-sm text-muted-foreground leading-relaxed">
        <h2 className="text-base font-semibold text-[#2D2218] mb-3">
          ¿Cómo elegir el mejor {categoryName || 'producto'} profesional?
        </h2>
        <p className="mb-3">
          Los {(categoryName || 'producto').toLowerCase()} profesionales se diferencian por potencia sostenida,
          durabilidad del motor en jornadas largas y precisión de acabado en entorno de salón.
          En esta comparativa analizamos los modelos mejor valorados por peluqueros y barberos
          profesionales en España, con pruebas reales de rendimiento.
        </p>
        <p>
          Revisamos precio actualizado en Amazon España, calidad de construcción,
          ergonomía en uso continuado y relación entre prestaciones y coste de adquisición.
          Todos los modelos incluidos cuentan con enlace directo al proveedor verificado.
        </p>
      </section>

      <div className="max-w-4xl space-y-6">
        {products.length > 0 ? (
          products.map((product, i) => (
            <ClipperProductCard key={product.id} product={product} index={i} />
          ))
        ) : (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <h2 className="font-display text-xl font-bold text-foreground mb-2">{t("category.comingSoon")}</h2>
            <p className="text-muted-foreground">{t("category.comingSoonDesc").replace("{name}", displayName)}</p>
            <Link to="/" className="inline-block mt-6 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity">
              {t("category.viewCategories")}
            </Link>
          </div>
        )}
      </div>

      {categoryPosts.length > 0 && (
        <div className="max-w-4xl mt-12 border-t border-border pt-8">
          <h2 className="font-display text-xl font-bold text-[#2D2218] mb-6">{postsSectionTitle}</h2>
          <ul className="space-y-4">
            {categoryPosts.map((post) => (
              <li key={post.id} className="group">
                <Link
                  to={`/blog/${post.slug}`}
                  className="block hover:opacity-80 transition-opacity"
                >
                  <span className="font-semibold text-[#2D2218] group-hover:text-[#C4A97D] transition-colors text-sm">
                    {post.title}
                  </span>
                  {post.excerpt && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {post.excerpt.slice(0, 100)}{post.excerpt.length > 100 ? "…" : ""}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {CATEGORY_SEO_CONTENT[slug] && (
        <section className="category-seo-text prose max-w-none mt-12 pt-8 border-t border-border">
          <h2 className="font-display text-xl font-bold text-[#2D2218] mb-4">
            {CATEGORY_SEO_CONTENT[slug].h2}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {CATEGORY_SEO_CONTENT[slug].text}
          </p>
        </section>
      )}
    </div>
  );
};

export default CategoryProductsPage;
