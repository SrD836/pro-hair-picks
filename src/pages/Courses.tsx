import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, MapPin, Clock, BookOpen, Briefcase, Scissors, DollarSign, Timer } from "lucide-react";
import { courses, type CourseModality, type CourseLang } from "@/data/coursesData";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { Helmet } from "react-helmet-async";

const Courses = () => {
  const { lang, t } = useLanguage();
  const isES = lang === "es";

  const [filterModality, setFilterModality] = useState<string>("all");
  const [filterLang, setFilterLang] = useState<string>("all");

  const filtered = courses.filter((c) => {
    const modalityOk = filterModality === "all" || c.modality === filterModality;
    const langOk = filterLang === "all" || c.lang === filterLang || c.lang === "BOTH";
    return modalityOk && langOk;
  });

  const modalityLabel = (m: CourseModality) =>
    m === "online" ? "Online" : isES ? "Presencial" : "In-Person";

  const langBadgeColor = (l: CourseLang) => {
    if (l === "ES") return "bg-red-500/20 text-red-300 border-red-500/30";
    if (l === "EN") return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    return "bg-purple-500/20 text-purple-300 border-purple-500/30";
  };

  const modalityBadgeColor = (m: CourseModality) =>
    m === "online"
      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
      : "bg-amber-500/20 text-amber-300 border-amber-500/30";

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{isES ? "Cursos de Peluquería Profesional | GuiaDelSalon.com" : "Professional Hairdressing Courses | GuiaDelSalon.com"}</title>
        <meta name="description" content={isES
          ? "Los 15 mejores cursos de peluquería online y presenciales en España y EEUU. Formación profesional seleccionada por expertos."
          : "The 15 best online and in-person hairdressing courses in Spain and the US. Professional training curated by experts."
        } />
      </Helmet>

      {/* Hero */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm font-medium">
            ✂️ {t("courses.badge")}
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-6">
            {t("courses.title")}{" "}
            <span className="text-secondary">{t("courses.titleHighlight")}</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            {t("courses.subtitle")}
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="container mx-auto px-4 mb-10">
        <div className="flex flex-wrap items-center gap-3 justify-center">
          {(["all", "online", "presencial"] as const).map((m) => (
            <Button
              key={m}
              variant={filterModality === m ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterModality(m)}
              className="rounded-full"
            >
              {m === "all"
                ? t("courses.filterAll")
                : m === "online"
                ? "Online"
                : isES ? "Presencial" : "In-Person"}
            </Button>
          ))}

          <div className="w-px h-6 bg-border mx-1 hidden sm:block" />

          {(["all", "ES", "EN"] as const).map((l) => (
            <Button
              key={l}
              variant={filterLang === l ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterLang(l)}
              className="rounded-full"
            >
              {l === "all" ? t("courses.filterAllLangs") : l}
            </Button>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-4">
          {filtered.length} {t("courses.found")}
        </p>
      </section>

      {/* Grid */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => (
            <Card key={course.id} className="group overflow-hidden border-border/50 bg-card hover:border-secondary/30 transition-all duration-300 hover:shadow-lg flex flex-col">
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={course.imageUrl}
                  alt={isES ? course.name.es : course.name.en}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 flex gap-2">
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${modalityBadgeColor(course.modality)}`}>
                    {modalityLabel(course.modality)}
                  </span>
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${langBadgeColor(course.lang)}`}>
                    {course.lang}
                  </span>
                </div>
              </div>

              <CardHeader className="pb-2">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  {course.school}
                </p>
                <CardTitle className="text-lg leading-tight">
                  {isES ? course.name.es : course.name.en}
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col gap-4">
                {/* Meta */}
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-secondary" />
                    <span className="truncate">{course.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-secondary" />
                    <span className="truncate">{course.price}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Timer className="w-3.5 h-3.5 text-secondary" />
                    <span className="truncate">{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-secondary" />
                    <span className="truncate">{course.hours}</span>
                  </div>
                </div>

                {/* Curriculum */}
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                    {t("courses.curriculum")}
                  </p>
                  <ul className="space-y-1">
                    {(isES ? course.curriculum.es : course.curriculum.en).map((item, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-sm text-foreground/80">
                        <span className="text-secondary mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Professional Outlets */}
                <div>
                  <p className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                    <Briefcase className="w-3 h-3" />
                    {t("courses.careerPaths")}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(isES ? course.professionalOutlets.es : course.professionalOutlets.en).map((outlet, i) => (
                      <Badge key={i} variant="outline" className="text-xs font-normal">
                        {outlet}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-auto pt-3">
                  <Button asChild className="w-full gap-2" variant="secondary">
                    <a href={course.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                      {t("courses.viewCourse")}
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-16">
            {t("courses.noResults")}
          </p>
        )}
      </section>
    </div>
  );
};

export default Courses;
