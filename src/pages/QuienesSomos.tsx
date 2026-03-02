import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { SEOHead } from "@/components/seo/SEOHead";
import { BookOpen, Wrench, Users, ShieldCheck, Heart, Target } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import aboutHero from "@/assets/about-hero.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

const QuienesSomos = () => {
  const { t, lang } = useLanguage();

  const trustPoints = [
    {
      icon: BookOpen,
      title: t("about.trust.expert"),
      desc: t("about.trust.expertDesc"),
    },
    {
      icon: Wrench,
      title: t("about.trust.freeTools"),
      desc: t("about.trust.freeToolsDesc"),
    },
    {
      icon: Users,
      title: t("about.trust.community"),
      desc: t("about.trust.communityDesc"),
    },
  ];

  return (
    <>
      <SEOHead
        title={t("about.metaTitle")}
        description={t("about.metaDesc")}
      />

      {/* ── Hero ──────────────────────────────── */}
      <section className="relative h-[60vh] min-h-[400px] flex items-end overflow-hidden">
        <img
          src={aboutHero}
          alt={t("about.heroAlt")}
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="container mx-auto px-4 relative z-10 pb-12">
          <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-muted-foreground mb-4"
          >
            <Link to="/" className="hover:text-foreground cta-underline">
              {t("category.home")}
            </Link>{" "}
            &gt; {t("about.breadcrumb")}
          </motion.nav>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground max-w-2xl"
          >
            {t("about.heroTitle")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-4 text-lg text-muted-foreground max-w-xl"
          >
            {t("about.heroSubtitle")}
          </motion.p>
        </div>
      </section>

      {/* ── Nuestra Misión ────────────────────── */}
      <section className="container mx-auto px-4 py-16 md:py-24 max-w-3xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="space-y-6"
        >
          <motion.div variants={fadeUp} custom={0} className="flex items-center gap-3">
            <Target className="w-6 h-6 text-secondary shrink-0" />
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              {t("about.missionTitle")}
            </h2>
          </motion.div>

          <motion.p variants={fadeUp} custom={1} className="text-foreground/85 leading-relaxed text-lg">
            {t("about.missionP1")}
          </motion.p>
          <motion.p variants={fadeUp} custom={2} className="text-foreground/85 leading-relaxed text-lg">
            {t("about.missionP2")}
          </motion.p>

          <motion.div
            variants={fadeUp}
            custom={3}
            className="border-l-2 border-secondary pl-5 py-2 mt-4"
          >
            <p className="text-muted-foreground italic text-base leading-relaxed">
              {t("about.missionQuote")}
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Separador ─────────────────────────── */}
      <div className="flex justify-center text-secondary/50 text-sm tracking-[0.5em] select-none">
        ─── ✦ ───
      </div>

      {/* ── Por qué confiar ───────────────────── */}
      <section className="container mx-auto px-4 py-16 md:py-24 max-w-4xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="text-center mb-12"
        >
          <motion.div variants={fadeUp} custom={0} className="flex items-center justify-center gap-3 mb-3">
            <ShieldCheck className="w-6 h-6 text-secondary" />
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              {t("about.trustTitle")}
            </h2>
          </motion.div>
          <motion.p variants={fadeUp} custom={1} className="text-muted-foreground max-w-lg mx-auto">
            {t("about.trustSubtitle")}
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {trustPoints.map((item, i) => (
            <motion.div
              key={item.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i + 2}
              className="group bg-card border border-border rounded-lg p-6 text-center glass-border-hover transition-shadow hover:shadow-gold"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-accent flex items-center justify-center">
                <item.icon className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Historia / Quién está detrás ──────── */}
      <section className="bg-card/50 border-y border-border">
        <div className="container mx-auto px-4 py-16 md:py-24 max-w-3xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="space-y-6"
          >
            <motion.div variants={fadeUp} custom={0} className="flex items-center gap-3">
              <Heart className="w-6 h-6 text-secondary shrink-0" />
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                {t("about.storyTitle")}
              </h2>
            </motion.div>
            <motion.p variants={fadeUp} custom={1} className="text-foreground/85 leading-relaxed text-lg">
              {t("about.storyP1")}
            </motion.p>
            <motion.p variants={fadeUp} custom={2} className="text-foreground/85 leading-relaxed text-lg">
              {t("about.storyP2")}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── CTA Contacto ──────────────────────── */}
      <section className="container mx-auto px-4 py-16 md:py-20 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.p variants={fadeUp} custom={0} className="text-muted-foreground mb-4 text-lg">
            {t("about.ctaText")}
          </motion.p>
          <motion.div variants={fadeUp} custom={1}>
            <Link
              to="/contacto"
              className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground font-bold px-8 py-3 rounded-md hover:bg-secondary/90 transition-colors"
            >
              {t("about.ctaButton")}
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </>
  );
};

export default QuienesSomos;
