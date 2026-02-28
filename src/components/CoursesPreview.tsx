import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, GraduationCap, MapPin, Clock } from "lucide-react";
import { courses } from "@/data/coursesData";
import { useLanguage } from "@/i18n/LanguageContext";

const modalityColors = {
  online: "#8BAF7C",
  presencial: "#C4A97D",
};

export const CoursesPreviewSection = () => {
  const { t, lang } = useLanguage();
  const isEN = lang === "en";
  const featured = courses.slice(0, 3);

  return (
    <section
      className="py-16 md:py-24 px-4 md:px-8 relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #221508 0%, #1a1210 50%, #1a1410 100%)" }}
    >
      {/* Gold accent top */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px"
        style={{ background: "linear-gradient(90deg, transparent, #C4A97D, transparent)" }}
      />

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10"
        >
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3"
              style={{ background: "rgba(196,169,125,0.1)", border: "1px solid rgba(196,169,125,0.2)" }}
            >
              <GraduationCap className="w-3 h-3 text-[#C4A97D]" />
              <span className="text-[#C4A97D] text-xs font-semibold uppercase tracking-widest">
                {t("courses.badge")}
              </span>
            </div>
            <h2
              className="font-display font-bold"
              style={{ fontSize: "clamp(1.8rem, 5vw, 2.6rem)", color: "#F5F0E8" }}
            >
              {isEN ? "Featured Courses" : "Cursos Destacados"}
            </h2>
          </div>
          <Link
            to="/cursos"
            className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold transition-all group"
            style={{ color: "#C4A97D" }}
          >
            {isEN ? "See all courses" : "Ver todos los cursos"}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {featured.map((course, i) => {
            const name = isEN ? course.name.en : course.name.es;
            const accentColor = modalityColors[course.modality];
            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="group rounded-2xl overflow-hidden flex flex-col"
                style={{
                  background: "linear-gradient(145deg, #3a2a1a 0%, #2d2015 60%, #241a0e 100%)",
                  border: "1px solid rgba(196,169,125,0.15)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
                }}
              >
                {/* Image */}
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img
                    src={course.imageUrl}
                    alt={name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#241a0e]/80 to-transparent" />
                  {/* Modality badge */}
                  <div className="absolute bottom-3 left-3">
                    <span
                      className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                      style={{
                        background: `${accentColor}20`,
                        color: accentColor,
                        border: `1px solid ${accentColor}40`,
                        backdropFilter: "blur(8px)",
                      }}
                    >
                      {course.modality === "online"
                        ? "Online"
                        : isEN ? "In-person" : "Presencial"}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <h3
                    className="font-display font-bold text-base leading-snug line-clamp-2 mb-1"
                    style={{ color: "#F5F0E8" }}
                  >
                    {name}
                  </h3>
                  <p className="text-xs mb-4" style={{ color: "#F5F0E8", opacity: 0.45 }}>
                    {course.school}
                  </p>

                  <div className="flex flex-wrap gap-3 mb-4 mt-auto">
                    <span
                      className="flex items-center gap-1 text-[10px]"
                      style={{ color: "#F5F0E8", opacity: 0.5 }}
                    >
                      <MapPin className="w-3 h-3" />
                      {course.location}
                    </span>
                    <span
                      className="flex items-center gap-1 text-[10px]"
                      style={{ color: "#F5F0E8", opacity: 0.5 }}
                    >
                      <Clock className="w-3 h-3" />
                      {course.duration}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-sm" style={{ color: accentColor }}>
                      {course.price}
                    </span>
                    <a
                      href={course.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold group-hover:gap-2 transition-all"
                      style={{ color: "#C4A97D" }}
                    >
                      {t("courses.viewCourse")}
                      <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Mobile CTA */}
        <div className="text-center mt-8 md:hidden">
          <Link
            to="/cursos"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm transition-all active:scale-95"
            style={{
              background: "rgba(196,169,125,0.12)",
              color: "#C4A97D",
              border: "1px solid rgba(196,169,125,0.25)",
            }}
          >
            {isEN ? "See all courses" : "Ver todos los cursos"} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
