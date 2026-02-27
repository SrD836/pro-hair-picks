/**
 * PasaporteCapilar.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * "Tu Pasaporte Capilar" – Resumen Ejecutivo de Diagnósticos
 *
 * Bento grid dashboard that aggregates results from:
 *   - Diagnóstico Capilar   → /diagnostico-capilar
 *   - Asesor de Color       → /asesor-color  (guiadelsalon.com/asesor-color)
 *   - Seguridad Química     → /inci-check
 *   - Plan de Recuperación  → /plan-recuperacion
 *
 * Props:
 *   - userId / passportId  →  for Supabase lookup
 *   - data                 →  pre-fetched data (optional; skips Supabase fetch)
 *
 * Supabase table reference:
 *   Table: diagnostic_results
 *   Cols:  user_id, passport_id, health_score, porosity, elasticity, note,
 *          color_name, color_hex, color_code, chemical_status,
 *          recovery_steps (jsonb), created_at
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Download, Share2, ShoppingCart, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// ── Design tokens ─────────────────────────────────────────────────────────────
// cream: #F5F0E8 | espresso: #2D2218 | gold: #C4A97D | gold-light: #D4C0A1
// card: bg-white rounded-3xl shadow-[0_4px_20px_-2px_rgba(45,34,24,0.05)]
// hover: -translate-y-0.5

// ── Types ─────────────────────────────────────────────────────────────────────
export interface RecoveryStep {
  label: string;
  description: string;
  completed?: boolean;
}

export interface PasaporteData {
  passportId: string;
  healthScore: number;            // 0–100
  porosity: string;               // e.g. "Media-Baja"
  elasticity: string;             // e.g. "Óptima"
  diagnosticNote?: string;
  colorName: string;              // e.g. "Warm Medium Brown"
  colorHex: string;               // e.g. "#5D4037"
  colorCode: string;              // e.g. "6.34 / GOLDEN COPPER"
  chemicalStatus: "safe" | "caution" | "danger";
  recoverySteps: RecoveryStep[];
  createdAt?: string;
}

interface PasaporteCapilarProps {
  /** Pass pre-fetched data to skip the Supabase query */
  data?: PasaporteData;
  /** Supabase user ID – triggers fetch if `data` is not provided */
  userId?: string;
  /** Passport ID to display in the header badge */
  passportId?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function CircularScore({ value }: { value: number }) {
  const r = 80;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 192 192">
        {/* Track */}
        <circle
          cx="96" cy="96" r={r}
          fill="transparent"
          stroke="#F5F0E8"
          strokeWidth="10"
        />
        {/* Progress */}
        <circle
          cx="96" cy="96" r={r}
          fill="transparent"
          stroke="#C4A97D"
          strokeWidth="13"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display font-bold text-[#2D2218] text-3xl">{value}%</span>
        <span className="text-[9px] uppercase tracking-[0.18em] text-[#2D2218]/50 mt-0.5">Salud Total</span>
      </div>
    </div>
  );
}

function ChemicalLight({ status }: { status: "safe" | "caution" | "danger" }) {
  const lights = [
    { key: "safe",    color: "bg-emerald-500", glow: "shadow-[0_0_14px_rgba(16,185,129,0.5)]" },
    { key: "caution", color: "bg-yellow-400",  glow: "shadow-[0_0_14px_rgba(250,204,21,0.5)]" },
    { key: "danger",  color: "bg-red-500",     glow: "shadow-[0_0_14px_rgba(239,68,68,0.5)]" },
  ];

  return (
    <div className="flex flex-col gap-2.5 items-center p-3 bg-[#F5F0E8]/60 rounded-full">
      {lights.map(({ key, color, glow }) => (
        <div
          key={key}
          className={`w-5 h-5 rounded-full transition-all duration-300 ${
            status === key ? `${color} ${glow}` : "bg-[#2D2218]/10"
          }`}
        />
      ))}
    </div>
  );
}

// ── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-[#2D2218]/8 rounded-2xl ${className}`} />
  );
}

// ── Default data (for demo / unlogged state) ──────────────────────────────────
const DEFAULT_DATA: PasaporteData = {
  passportId: "GS-00000",
  healthScore: 0,
  porosity: "—",
  elasticity: "—",
  diagnosticNote: "Completa el diagnóstico para ver tus resultados.",
  colorName: "Sin analizar",
  colorHex: "#C4A97D",
  colorCode: "— / —",
  chemicalStatus: "safe",
  recoverySteps: [
    { label: "Hidratación", description: "Recuperación de niveles de agua internos." },
    { label: "Nutrición", description: "Reposición de lípidos y aceites esenciales." },
    { label: "Reconstrucción", description: "Refuerzo de la queratina cortical.", completed: false },
  ],
};

// ── Main component ────────────────────────────────────────────────────────────
export default function PasaporteCapilar({ data: propData, userId, passportId }: PasaporteCapilarProps) {
  const [data, setData] = useState<PasaporteData | null>(propData ?? null);
  const [loading, setLoading] = useState(!propData && !!userId);
  const [error, setError] = useState<string | null>(null);

  // Supabase fetch when userId is provided and no prop data
  useEffect(() => {
    if (propData || !userId) return;

    const fetchPassport = async () => {
      setLoading(true);
      setError(null);
      try {
        // diagnostic_results table may not exist yet — cast to bypass TS
        const { data: rows, error: err } = await (supabase as any)
          .from("diagnostic_results")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (err) throw err;

        const r = rows as any;
        setData({
          passportId: r.passport_id ?? passportId ?? "GS-00000",
          healthScore: r.health_score ?? 0,
          porosity: r.porosity ?? "—",
          elasticity: r.elasticity ?? "—",
          diagnosticNote: r.note,
          colorName: r.color_name ?? "—",
          colorHex: r.color_hex ?? "#C4A97D",
          colorCode: r.color_code ?? "—",
          chemicalStatus: r.chemical_status ?? "safe",
          recoverySteps: r.recovery_steps ?? DEFAULT_DATA.recoverySteps,
          createdAt: r.created_at,
        });
      } catch {
        setError("No se encontraron diagnósticos previos.");
        setData(DEFAULT_DATA);
      } finally {
        setLoading(false);
      }
    };

    fetchPassport();
  }, [userId, propData, passportId]);

  // Use DEFAULT_DATA when no userId + no data
  const d = data ?? DEFAULT_DATA;
  const pid = d.passportId || passportId || "GS-00000";

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" as const },
    }),
  };

  if (loading) {
    return (
      <section className="min-h-screen bg-[#F5F0E8] p-4 md:p-8">
        <div className="max-w-5xl mx-auto space-y-5">
          <Skeleton className="h-16 w-72" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Skeleton className="col-span-2 h-52" />
            <Skeleton className="h-52" />
            <Skeleton className="h-40" />
            <Skeleton className="col-span-2 h-40" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#F5F0E8] p-4 md:p-8 lg:p-12">
      <div className="max-w-5xl mx-auto space-y-5">

        {/* ── Header ── */}
        <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-2"
        >
          <div className="space-y-1">
            <h1 className="font-display font-bold text-[#2D2218] text-4xl md:text-5xl leading-none">
              Tu Pasaporte Capilar
            </h1>
            <p className="text-[#2D2218]/50 text-xs font-medium uppercase tracking-[0.18em]">
              Resumen Ejecutivo de Diagnósticos
            </p>
          </div>
          <span className="text-xs font-medium px-4 py-1.5 bg-[#C4A97D]/10 text-[#C4A97D] border border-[#C4A97D]/20 rounded-full w-fit">
            ID: #{pid}
          </span>
        </motion.header>

        {/* ── Error notice ── */}
        {error && (
          <div className="text-xs text-[#2D2218]/50 bg-white/60 rounded-2xl px-4 py-3 border border-[#2D2218]/8">
            {error}
          </div>
        )}

        {/* ── Bento Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">

          {/* ── Card 1: Diagnóstico Capilar (2/3 width) ── */}
          <motion.div
            custom={0}
            initial="hidden"
            animate="show"
            variants={cardVariants}
            className="md:col-span-2 bg-white rounded-3xl p-6 shadow-[0_4px_20px_-2px_rgba(45,34,24,0.05)] hover:-translate-y-0.5 transition-transform duration-200"
          >
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Circular score */}
              <CircularScore value={d.healthScore} />

              {/* Details */}
              <div className="flex-1 w-full space-y-4">
                <div className="flex items-start justify-between">
                  <h2 className="font-display font-bold text-[#2D2218] text-xl">Diagnóstico Capilar</h2>
                  <Link
                    to="/diagnostico-capilar"
                    className="text-[10px] font-bold text-[#C4A97D] uppercase tracking-wider hover:text-[#2D2218] transition-colors flex items-center gap-1 group"
                  >
                    Ver Informe
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>

                {/* Metric pills */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Porosidad", value: d.porosity },
                    { label: "Elasticidad", value: d.elasticity },
                  ].map(({ label, value }) => (
                    <div key={label} className="p-3.5 bg-[#F5F0E8] rounded-2xl">
                      <p className="text-[9px] uppercase tracking-[0.15em] text-[#2D2218]/50 mb-1">{label}</p>
                      <p className="font-semibold text-[#2D2218] text-sm">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Note */}
                {d.diagnosticNote && (
                  <p className="text-xs text-[#2D2218]/70 italic leading-relaxed">
                    "{d.diagnosticNote}"
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* ── Card 2: Asesor de Color (1/3 width) ── */}
          <motion.div
            custom={1}
            initial="hidden"
            animate="show"
            variants={cardVariants}
            className="bg-white rounded-3xl p-5 shadow-[0_4px_20px_-2px_rgba(45,34,24,0.05)] hover:-translate-y-0.5 transition-transform duration-200 flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <h2 className="font-display font-bold text-[#2D2218] text-lg">Asesor de Color</h2>
              {/* Link to the official asesor-color URL */}
              <a
                href="https://guiadelsalon.com/asesor-color"
                target="_self"
                rel="noopener"
                className="text-[9px] font-bold text-[#C4A97D] uppercase tracking-tighter hover:text-[#2D2218] transition-colors"
              >
                Detalles
              </a>
            </div>

            {/* Color swatch */}
            <div className="flex flex-col items-center py-5 gap-2">
              <div
                className="w-20 h-20 rounded-full shadow-inner ring-8 ring-[#F5F0E8] transition-all duration-500"
                style={{ backgroundColor: d.colorHex }}
              />
              <p className="text-sm font-semibold text-[#2D2218] mt-1">{d.colorName}</p>
              <p className="text-[10px] text-[#2D2218]/40 font-mono tracking-wider uppercase">
                CODE: {d.colorCode}
              </p>
            </div>

            {/* CTA button — links to official asesor-color page */}
            <Link
              to="/asesor-color"
              className="block bg-[#2D2218] text-[#F5F0E8] text-xs font-semibold text-center py-3 rounded-xl hover:bg-[#2D2218]/90 transition-colors"
            >
              Tono Ideal Recomendado
            </Link>
          </motion.div>

          {/* ── Card 3: Seguridad Química (1/3 width) ── */}
          <motion.div
            custom={2}
            initial="hidden"
            animate="show"
            variants={cardVariants}
            className="bg-white rounded-3xl p-5 shadow-[0_4px_20px_-2px_rgba(45,34,24,0.05)] hover:-translate-y-0.5 transition-transform duration-200 flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <h2 className="font-display font-bold text-[#2D2218] text-lg">Seguridad Química</h2>
              <ShieldCheck className="w-5 h-5 text-[#C4A97D]" />
            </div>

            <div className="flex flex-col items-center py-4 gap-3">
              <ChemicalLight status={d.chemicalStatus} />
              <p className={`text-xs font-bold uppercase tracking-widest ${
                d.chemicalStatus === "safe"
                  ? "text-emerald-600"
                  : d.chemicalStatus === "caution"
                  ? "text-yellow-500"
                  : "text-red-500"
              }`}>
                {d.chemicalStatus === "safe"
                  ? "Safe Status"
                  : d.chemicalStatus === "caution"
                  ? "Caution"
                  : "Warning"}
              </p>
            </div>

            <Link
              to="/inci-check"
              className="text-[9px] font-semibold text-[#2D2218]/35 hover:text-[#2D2218] transition-colors text-center uppercase tracking-wider"
            >
              Ver Informe Detallado
            </Link>
          </motion.div>

          {/* ── Card 4: Plan de Recuperación (2/3 width) ── */}
          <motion.div
            custom={3}
            initial="hidden"
            animate="show"
            variants={cardVariants}
            className="md:col-span-2 bg-white rounded-3xl p-6 shadow-[0_4px_20px_-2px_rgba(45,34,24,0.05)] hover:-translate-y-0.5 transition-transform duration-200"
          >
            <div className="flex items-start justify-between mb-6">
              <h2 className="font-display font-bold text-[#2D2218] text-xl">Plan de Recuperación</h2>
              <Link
                to="/plan-recuperacion"
                className="text-[10px] font-bold text-[#C4A97D] uppercase tracking-wider hover:text-[#2D2218] transition-colors flex items-center gap-1 group"
              >
                Ver Plan Completo
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Timeline */}
            <div className="relative flex justify-between items-start">
              {/* Connector line */}
              <div className="absolute top-5 left-0 right-0 h-px bg-[#F5F0E8] z-0" />

              {d.recoverySteps.map((step, i) => {
                const isActive = i === 0;
                const isPending = !isActive && !step.completed;
                return (
                  <div key={step.label} className="relative z-10 flex flex-col items-center text-center w-1/3 px-2">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 font-bold text-sm transition-all ${
                        isActive
                          ? "bg-[#C4A97D] text-white shadow-lg shadow-[#C4A97D]/30"
                          : step.completed
                          ? "bg-[#2D2218] text-white"
                          : "bg-white border-2 border-[#F5F0E8] text-[#2D2218]/30"
                      }`}
                    >
                      {step.completed && !isActive ? "✓" : i + 1}
                    </div>
                    <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isPending ? "opacity-40" : "text-[#2D2218]"}`}>
                      {step.label}
                    </p>
                    <p className={`text-[9px] leading-tight ${isPending ? "text-[#2D2218]/30" : "text-[#2D2218]/55"}`}>
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>

        </div>

        {/* ── Footer actions ── */}
        <motion.footer
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4"
        >
          {/* Download PDF */}
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 bg-[#2D2218] text-[#F5F0E8] rounded-full text-sm font-medium hover:bg-black transition-all group">
            <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            Descargar PDF Profesional
          </button>

          {/* Share */}
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 bg-white border border-[#2D2218]/10 text-[#2D2218] rounded-full text-sm font-medium hover:bg-[#F5F0E8] transition-all">
            <Share2 className="w-4 h-4" />
            Compartir con Estilista
          </button>

          {/* Buy kit — affiliate CTA */}
          <a
            href={`https://amzn.to/kit-capilar?tag=guiadelsalo09-21`}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 bg-[#C4A97D] text-[#2D2218] rounded-full text-sm font-bold hover:bg-[#D4C0A1] transition-all shadow-lg shadow-[#C4A97D]/20"
          >
            <ShoppingCart className="w-4 h-4" />
            Comprar Kit Recomendado
          </a>
        </motion.footer>

        {/* Copyright */}
        <p className="text-center text-[9px] uppercase tracking-[0.2em] text-[#2D2218]/30 pt-2 pb-4">
          © {new Date().getFullYear()} Guía del Salón · Luxury Hair Diagnostics
        </p>
      </div>
    </section>
  );
}
