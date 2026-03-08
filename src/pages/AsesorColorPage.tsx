// src/pages/AsesorColorPage.tsx
// Diseño: Google AI Studio — Expert Color Matcher wizard

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Palette, X, ArrowRight, ArrowLeft, CheckCircle2, Check, AlertTriangle, Download, ShieldCheck, Sparkles } from 'lucide-react';
import { useWizardReturn } from '@/hooks/useWizardReturn';
import { generateMasterColorCardPDF } from '@/lib/pdfGenerators';

const STEPS = [
  { id: 1, title: 'Tono de piel' },
  { id: 2, title: 'Test de venas' },
  { id: 3, title: 'Metales' },
  { id: 4, title: 'Color iluminación' },
  { id: 5, title: 'Color de ojos' },
  { id: 6, title: 'Nivel natural' },
  { id: 7, title: 'Color actual' }
];

export default function AsesorColorPage() {
  const [step, setStep] = useState(1);
  const [selections, setSelections] = useState<Record<number, unknown>>({});
  const { isWizardMode, completeWizardModule } = useWizardReturn('asesor-color');

  const handleSelect = (stepId: number, value: unknown) => {
    setSelections(prev => ({ ...prev, [stepId]: value }));
  };

  const nextStep = () => setStep(s => Math.min(8, s + 1));
  const prevStep = () => setStep(s => Math.max(1, s - 1));

  const progress = ((step - 1) / 7) * 100;

  if (step === 8) {
    return <ResultsPage isWizardMode={isWizardMode} selections={selections} onWizardContinue={() => completeWizardModule({ summary: 'Colorimetría completada', score: 98, rawResult: { selections } })} />;
  }

  return (
    <div className="min-h-screen bg-[#2D2218] text-[#F5F0E8] font-sans flex flex-col">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-[#1a1208] border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Palette className="text-[#E85D04] w-8 h-8" />
          <h2 className="text-lg font-bold tracking-widest uppercase hidden sm:block">Expert Color Matcher</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[#E85D04] text-sm font-bold">Paso {step} de 7</p>
            <p className="text-xs text-[#F5F0E8]/60 uppercase tracking-wider">{STEPS[step-1]?.title}</p>
          </div>
          <Link
            to="/mi-pelo"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </Link>
        </div>
      </header>

      {/* BARRA DE PROGRESO */}
      <div className="w-full h-1.5 bg-[#1a1208]">
        <div className="h-full bg-[#E85D04] transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      {/* MAIN */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-12 pb-32">
        {step === 1 && <Step1 selection={selections[1]} onSelect={(v) => handleSelect(1, v)} />}
        {step === 2 && <Step2 selection={selections[2]} onSelect={(v) => handleSelect(2, v)} />}
        {step === 3 && <Step3 selection={selections[3]} onSelect={(v) => handleSelect(3, v)} />}
        {step === 4 && <Step4 selection={selections[4]} onSelect={(v) => handleSelect(4, v)} />}
        {step === 5 && <Step5 selection={selections[5]} onSelect={(v) => handleSelect(5, v)} />}
        {step === 6 && <Step6 selection={selections[6]} onSelect={(v) => handleSelect(6, v)} />}
        {step === 7 && <Step7 selection={selections[7]} onSelect={(v) => handleSelect(7, v)} />}
      </main>

      {/* FOOTER FIXED */}
      <footer className="fixed bottom-0 left-0 w-full bg-[#1a1208] border-t border-white/5 p-4 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className={`px-6 py-3 rounded-xl font-bold transition-colors flex items-center gap-2 ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-[#F5F0E8] hover:bg-white/5'}`}
          >
            <ArrowLeft className="w-5 h-5" /> Anterior
          </button>
          <button
            onClick={nextStep}
            disabled={!selections[step]}
            className="bg-[#E85D04] text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#E85D04]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step === 7 ? 'ANALIZAR RESULTADOS' : 'CONTINUAR'} <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </footer>
    </div>
  );
}

function Step1({ selection, onSelect }: { selection: unknown; onSelect: (v: string) => void }) {
  const options = [
    { id: 'porcelana', label: 'Porcelana', desc: 'Muy claro, se quema fácil', color: '#fff0e6' },
    { id: 'claro_frio', label: 'Claro Frío', desc: 'Subtono rosado/azulado', color: '#fcece4' },
    { id: 'claro_calido', label: 'Claro Cálido', desc: 'Subtono melocotón/dorado', color: '#f8d9c8' },
    { id: 'medio_frio', label: 'Medio Frío', desc: 'Subtono rosado/oliva', color: '#e0ac8f' },
    { id: 'medio_calido', label: 'Medio Cálido', desc: 'Subtono dorado/amarillo', color: '#dca381' },
    { id: 'oliva', label: 'Oliva', desc: 'Subtono verdoso/ceniza', color: '#c69a6b' },
    { id: 'oscuro', label: 'Oscuro', desc: 'Subtono cálido/rojizo', color: '#8d5524' },
    { id: 'muy_oscuro', label: 'Muy Oscuro', desc: 'Subtono frío/ébano', color: '#3d2210' },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">¿Cuál es tu tono de piel?</h1>
        <p className="text-[#F5F0E8]/60">Selecciona la opción que más se acerque a tu color natural.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
        {options.map(opt => (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            className={`flex flex-col items-center gap-4 p-6 rounded-xl bg-[#3a2d1e] transition-all ${selection === opt.id ? 'border-2 border-[#E85D04]' : 'border border-[#4a3a28] hover:border-[#E85D04]/50'}`}
          >
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-[#2D2218] shadow-inner" style={{ backgroundColor: opt.color }} />
            <div className="text-center">
              <p className="font-bold text-lg leading-tight">{opt.label}</p>
              <p className="text-xs text-[#F5F0E8]/60 mt-2">{opt.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Step2({ selection, onSelect }: { selection: unknown; onSelect: (v: string) => void }) {
  const options = [
    { id: 'azules', label: 'Azules o moradas', desc: 'Tono frío', icon: '❄️', color: '#3b82f6' },
    { id: 'verdes', label: 'Verdes o verdosas', desc: 'Tono cálido', icon: '☀️', color: '#22c55e' },
    { id: 'mixtas', label: 'Mezcla de ambas', desc: 'Tono neutro', icon: '✨', color: '#a855f7' },
    { id: 'indistinguibles', label: 'Difíciles de ver', desc: 'Tono oliva o neutro', icon: '🌿', color: '#65a30d' },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Test de venas</h1>
        <p className="text-[#F5F0E8]/60">Observa las venas de tu muñeca bajo luz natural.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
        {options.map(opt => (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            className={`flex items-center gap-6 p-6 rounded-xl bg-[#3a2d1e] transition-all text-left ${selection === opt.id ? 'border-2 border-[#E85D04]' : 'border border-[#4a3a28] hover:border-[#E85D04]/50'}`}
          >
            <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-[#2D2218] shrink-0 border-2 border-[#4a3a28]">
              <div className="absolute inset-0 rounded-full opacity-20" style={{ backgroundColor: opt.color }} />
              <span className="text-2xl relative z-10">{opt.icon}</span>
            </div>
            <div>
              <p className="font-bold text-lg mb-1">{opt.label}</p>
              <p className="text-xs text-[#F5F0E8]/60 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: opt.color }} />
                {opt.desc}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Step3({ selection, onSelect }: { selection: unknown; onSelect: (v: string) => void }) {
  const options = [
    {
      id: 'plata',
      label: 'Plata / Platino',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACmthmX53PmP9EHrKUk214fhcKS02rL7P1XlRTYlGtpKdXIANs-gScR5hyMamr34Xq6kVaVkGqvq87eBmEtaqZxeROwe0-bOxxBEn30DRO52jAlQewnCZw9pgt_fn2DhGW2S9ee1uxJxg8c50a0Rmg9bbqWyggqU78yrvkFo_caPuBY7JEar3Hc43Ie9eb9ceml9jSCkDEcjGpD2IptT9gGnSMaQ6tY3gi90Pe7XS1Uwjs7EvfmzX4W0a-Vs61mulMHI3Tt-dEX403'
    },
    {
      id: 'oro',
      label: 'Oro Amarillo',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDiQXW_q8a2ae8TEL6Nnuc3QJOnQvKstW3dxBzc99qx5kbHqykH4Tzzc-mbp6mAA_I0Xqbk5VXwdYwm7gWyt_cHtkSAsyi7iP8P4QyZNlsgDNxW0utU6JZtibJjNLWBfjW4yoGWVFFidLnQTkmiMnMXxqUt_iRrBTHW2lfk9DuY6WRvMBOmgv1yW5tES9jdBLPGXmQyYQUscaafNES_lNli3-IldfIEBG1aP4x_-68Q6GlgqMbjBV_K7B6OHCJXTNDPc93mR5T7rj1v'
    },
    {
      id: 'oro_rosa',
      label: 'Oro Rosa / Cobre',
      img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=500&q=80'
    },
    {
      id: 'ambos',
      label: 'Todos me quedan bien',
      img: '/images/wizard/jewelry-both.webp'
    },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">¿Qué metal te favorece más?</h1>
        <p className="text-[#F5F0E8]/60">Observa cómo reacciona el brillo en tu piel</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
        {options.map(opt => (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            className={`group relative overflow-hidden rounded-xl aspect-square bg-[#3a2d1e] transition-all ${selection === opt.id ? 'border-4 border-[#E85D04]' : 'border-4 border-transparent hover:border-[#E85D04]/50'}`}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
            <img
              src={opt.img}
              alt={opt.label}
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {selection === opt.id && (
              <div className="absolute top-4 right-4 z-20 bg-[#E85D04] text-white p-1 rounded-full">
                <Check className="w-4 h-4" />
              </div>
            )}
            <div className="absolute bottom-0 left-0 p-4 z-20 w-full flex justify-between items-center">
              <span className="text-white text-lg font-bold leading-tight text-left">{opt.label}</span>
              {selection === opt.id && <CheckCircle2 className="text-white w-6 h-6 shrink-0" />}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Step4({ selection, onSelect }: { selection: unknown; onSelect: (v: string) => void }) {
  const options = [
    {
      id: 'fucsia',
      label: 'Fucsia / Rosa',
      desc: 'Tono Frío / Invierno',
      color: '#D91656',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBDszs-zEa3389TOlM08mUHTa4lP3Almk6mvsMPIYB3u9GuE8MersembwZTOAnS-2osoKo6rAwgLB2pHf8lxXJV6m0L8N4QyBVc7F3SovncW5zOnkBV5xNAQM5Loik90HKsymP3Xg_bmew6o31hA6dzpfOXGrUM7EqLxbgceIcxgjUw1K_m7G9TA198Ud40tG8JoauYZaXZIVdYnuQrB1dR6g-tclXlpROPHkA8wgQho53nQKP_0fq7L2jukwN9BL0TT20OBUFHwqCU'
    },
    {
      id: 'naranja',
      label: 'Naranja / Coral',
      desc: 'Tono Cálido / Otoño',
      color: '#FF8C00',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDN8fsgm-ABvATODRouFs7xm6DqYbYHV9Nw5X6_60q6T_r2_zwo2KTdQ0VVu9NQz1_RHdznrBkZXP5wDvhruLQoxb6ByxK-hG21wyvQA7xwWMnLok5c4HoVJpQEPIVU4xOkNg40lKYRvphgEWUXvkbFTace1N_CIphyPlb9gJP8LuDj4i6siR4pHRLNye8SjK0GIERl1I2fZVtaQCSdE7P43n-Y6SC4AgsRZ4jqMp88xsh9i8CvPOFXK6YfUek9JTI3uoAsba8GUtUu'
    },
    {
      id: 'neutro',
      label: 'Ambos o Ninguno',
      desc: 'Tono Neutro',
      color: '#888888',
      img: ''
    }
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">¿Qué color te ilumina más el rostro?</h1>
        <p className="text-[#F5F0E8]/60">Prueba estos tonos cerca de tu cara con luz natural</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {options.map(opt => (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            className={`group flex flex-col items-center gap-4 p-4 rounded-2xl bg-[#3a2d1e] transition-all ${selection === opt.id ? 'border-2 border-[#E85D04]' : 'border border-[#4a3a28] hover:border-[#E85D04]/50'}`}
          >
            <div className="relative overflow-hidden rounded-xl aspect-[4/3] w-full bg-[#2D2218]">
              {opt.img ? (
                <>
                  <div className="absolute inset-0 flex items-center justify-center overflow-hidden" style={{ backgroundColor: opt.color }}>
                    <div className="w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
                  </div>
                  <img src={opt.img} alt={opt.label} referrerPolicy="no-referrer" className="absolute inset-0 w-full h-full object-cover" />
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[#F5F0E8]/40">
                  <span className="text-4xl">🤷‍♀️</span>
                </div>
              )}
              {selection === opt.id && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <div className="bg-white text-[#2D2218] px-6 py-2 rounded-full font-bold shadow-lg flex items-center gap-2">
                    <Check className="w-4 h-4" /> Seleccionado
                  </div>
                </div>
              )}
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold">{opt.label}</h3>
              <p className="text-[#F5F0E8]/60 text-sm italic mt-1">{opt.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Step5({ selection, onSelect }: { selection: unknown; onSelect: (v: string) => void }) {
  const options = [
    { id: 'azul_claro', label: 'Azul Claro', color: '#8bb8d0' },
    { id: 'azul_gris', label: 'Azul Grisáceo', color: '#6b7b8c' },
    { id: 'verde_claro', label: 'Verde Claro', color: '#8cb07d' },
    { id: 'verde_oscuro', label: 'Verde Oliva', color: '#556b2f' },
    { id: 'avellana', label: 'Avellana', color: '#8c734d' },
    { id: 'miel', label: 'Miel / Ámbar', color: '#b57b2a' },
    { id: 'castano_claro', label: 'Castaño Claro', color: '#8b5a2b' },
    { id: 'castano_oscuro', label: 'Castaño Oscuro', color: '#4a2e15' },
    { id: 'negro', label: 'Negro', color: '#1a110a' },
    { id: 'heterocromia', label: 'Dos Colores', color: 'linear-gradient(45deg, #8bb8d0 50%, #8b5a2b 50%)' },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">¿De qué color son tus ojos?</h1>
        <p className="text-[#F5F0E8]/60">Selecciona el tono más predominante.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
        {options.map(opt => (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            className={`group flex flex-col items-center gap-3 p-4 rounded-xl bg-[#3a2d1e] transition-all ${selection === opt.id ? 'border-2 border-[#E85D04]' : 'border border-[#4a3a28] hover:border-[#E85D04]/50'}`}
          >
            <div
              className="w-16 h-16 rounded-full border-4 border-[#2D2218] shadow-inner relative overflow-hidden"
              style={{ background: opt.color }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_30%,_rgba(0,0,0,0.6)_100%)]" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-black rounded-full" />
              <div className="absolute top-2 right-3 w-2 h-2 bg-white/40 rounded-full blur-[1px]" />
            </div>
            <span className={`font-medium text-sm text-center ${selection === opt.id ? 'text-[#E85D04] font-bold' : 'text-[#F5F0E8]'}`}>
              {opt.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Step6({ selection, onSelect }: { selection: unknown; onSelect: (v: string | number) => void }) {
  const levels = [
    { id: 1, color: '#1a1a1a' }, { id: 2, color: '#2c1e14' }, { id: 3, color: '#3d2b1f' },
    { id: 4, color: '#523a28' }, { id: 5, color: '#6b4c35' }, { id: 6, color: '#8c6a4e' },
    { id: 7, color: '#ab8b65' }, { id: 8, color: '#c9ae82' }, { id: 9, color: '#e3cd9d' },
    { id: 10, color: '#f5e4bd' },
  ];
  const extraNaturals = [
    { id: 'r1', color: '#7a3322', label: 'Caoba' },
    { id: 'r2', color: '#b35428', label: 'Cobrizo' },
    { id: 'r3', color: '#d68a59', label: 'Fresa' },
    { id: 'g1', color: '#9ca3af', label: 'Gris' },
    { id: 'g2', color: '#f3f4f6', label: 'Blanco' },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">¿Cuál es tu nivel natural de cabello?</h1>
        <p className="text-[#F5F0E8]/60 max-w-md mx-auto">Selecciona el número o tono que mejor represente tu color natural desde la raíz.</p>
      </div>
      <div className="flex flex-col gap-8 max-w-4xl mx-auto bg-[#3a2d1e] p-8 rounded-2xl border border-[#4a3a28]">
        <div>
          <p className="text-sm font-bold text-center mb-6 text-[#F5F0E8]/80 uppercase tracking-widest">Escala Base (1-10)</p>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
            {levels.map(lvl => (
              <button key={lvl.id} onClick={() => onSelect(lvl.id)} className="flex flex-col items-center gap-2 group">
                <div
                  className={`w-full aspect-square rounded-full ring-2 ring-offset-2 ring-offset-[#3a2d1e] transition-all ${selection === lvl.id ? 'ring-[#E85D04]' : 'ring-transparent group-hover:ring-[#E85D04]/50'}`}
                  style={{ backgroundColor: lvl.color }}
                />
                <span className={`text-xs font-bold ${selection === lvl.id ? 'text-[#E85D04]' : 'text-[#F5F0E8]/60'}`}>{lvl.id}</span>
              </button>
            ))}
          </div>
          <div className="flex justify-between px-2 mt-2 text-[10px] font-bold text-[#F5F0E8]/40 uppercase tracking-widest">
            <span>Más oscuro (1)</span>
            <span>Más claro (10)</span>
          </div>
        </div>
        <div className="pt-6 border-t border-[#4a3a28]">
          <p className="text-sm font-bold text-center mb-6 text-[#F5F0E8]/80 uppercase tracking-widest">Pelirrojos y Canas</p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            {extraNaturals.map(lvl => (
              <button key={lvl.id} onClick={() => onSelect(lvl.id)} className="flex flex-col items-center gap-2 group w-16">
                <div
                  className={`w-12 h-12 rounded-full ring-2 ring-offset-2 ring-offset-[#3a2d1e] transition-all ${selection === lvl.id ? 'ring-[#E85D04]' : 'ring-transparent group-hover:ring-[#E85D04]/50'}`}
                  style={{ backgroundColor: lvl.color }}
                />
                <span className={`text-xs font-bold text-center ${selection === lvl.id ? 'text-[#E85D04]' : 'text-[#F5F0E8]/60'}`}>{lvl.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Step7({ selection, onSelect }: { selection: unknown; onSelect: (v: string) => void }) {
  const natural = [
    { id: 'n1', label: 'Negro', color: '#000000' },
    { id: 'n3', label: 'Castaño Oscuro', color: '#2b1d16' },
    { id: 'n5', label: 'Castaño Claro', color: '#5d4037' },
    { id: 'n7', label: 'Rubio Medio', color: '#c6a664' },
    { id: 'n10', label: 'Rubio Platino', color: '#f9e4b7' },
    { id: 'nr1', label: 'Pelirrojo Oscuro', color: '#7a3322' },
    { id: 'nr2', label: 'Pelirrojo Cobrizo', color: '#b35428' },
    { id: 'nr3', label: 'Rubio Fresa', color: '#d68a59' },
    { id: 'ng1', label: 'Gris / Canas', color: '#9ca3af' },
    { id: 'ng2', label: 'Blanco', color: '#f3f4f6' },
  ];
  const fantasy = [
    { id: 'f1', label: 'Rojo Fuego', color: '#dc2626' },
    { id: 'f2', label: 'Azul', color: '#2563eb' },
    { id: 'f3', label: 'Rosa / Magenta', color: '#f472b6' },
    { id: 'f4', label: 'Naranja / Cobre', color: '#f97316' },
    { id: 'f5', label: 'Morado / Violeta', color: '#7e22ce' },
    { id: 'f6', label: 'Verde / Esmeralda', color: '#059669' },
    { id: 'f7', label: 'Amarillo / Neón', color: '#eab308' },
    { id: 'f8', label: 'Plata Fantasía', color: '#cbd5e1' },
    { id: 'f9', label: 'Pastel', color: '#fbcfe8' },
  ];
  const special = [
    { id: 's1', label: 'Mechas / Balayage', color: 'linear-gradient(90deg, #5d4037 30%, #e3cd9d 70%)' },
    { id: 's2', label: 'Bicolor / Split', color: 'linear-gradient(90deg, #000000 50%, #dc2626 50%)' },
    { id: 's3', label: 'Decolorado Base', color: '#fef08a' },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">¿Cuál es tu color actual de cabello?</h1>
        <p className="text-[#F5F0E8]/60 max-w-2xl mx-auto">Selecciona el tono que más se aproxime a tu base actual para obtener el mejor resultado en tu diagnóstico.</p>
      </div>
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-6 border-l-4 border-[#E85D04] pl-4">
          <h3 className="text-xl font-bold">Natural / Convencional</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {natural.map(opt => (
            <button key={opt.id} onClick={() => onSelect(opt.id)}
              className={`flex flex-col gap-3 p-2 rounded-xl border-2 bg-[#3a2d1e] transition-all ${selection === opt.id ? 'border-[#E85D04]' : 'border-transparent hover:border-[#E85D04]/50'}`}>
              <div className="w-full aspect-square rounded-lg shadow-inner" style={{ backgroundColor: opt.color }} />
              <p className="text-xs font-bold text-center">{opt.label}</p>
            </button>
          ))}
        </div>
      </section>
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-6 border-l-4 border-[#E85D04] pl-4">
          <h3 className="text-xl font-bold">Técnicas Especiales</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {special.map(opt => (
            <button key={opt.id} onClick={() => onSelect(opt.id)}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 bg-[#3a2d1e] transition-all ${selection === opt.id ? 'border-[#E85D04]' : 'border-transparent hover:border-[#E85D04]/50'}`}>
              <div className="w-12 h-12 rounded-full shadow-inner shrink-0" style={{ background: opt.color }} />
              <p className="text-sm font-bold text-left">{opt.label}</p>
            </button>
          ))}
        </div>
      </section>
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-6 border-l-4 border-[#E85D04] pl-4">
          <h3 className="text-xl font-bold">Fantasía / Colores Vivos</h3>
        </div>
        <div className="mb-6 flex items-start gap-4 p-4 rounded-xl bg-[#E85D04]/10 border border-[#E85D04]/20">
          <AlertTriangle className="text-[#E85D04] shrink-0 mt-0.5" />
          <p className="text-sm leading-relaxed text-[#F5F0E8]/80">
            <span className="font-bold text-[#E85D04]">Nota importante:</span> Los colores de fantasía suelen requerir una base previa de decoloración para alcanzar su máxima intensidad y durabilidad.
          </p>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-9 gap-4">
          {fantasy.map(opt => (
            <button key={opt.id} onClick={() => onSelect(opt.id)}
              className={`flex flex-col gap-3 p-2 rounded-xl border-2 bg-[#3a2d1e] transition-all ${selection === opt.id ? 'border-[#E85D04]' : 'border-transparent hover:border-[#E85D04]/50'}`}>
              <div className="w-full aspect-square rounded-lg shadow-inner" style={{ backgroundColor: opt.color }} />
              <p className="text-[10px] font-bold text-center leading-tight">{opt.label}</p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}


function ResultsPage({ isWizardMode, onWizardContinue, selections }: { isWizardMode?: boolean; onWizardContinue?: () => void; selections?: Record<number, unknown> }) {
  return (
    <div className="min-h-screen bg-[#2D2218] text-[#F5F0E8] font-sans flex flex-col items-center py-12 px-6">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#3a2d1e] mb-4 text-[#E85D04] ring-1 ring-[#E85D04]/20">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-3">Tu Master Color Card</h1>
        <p className="text-lg text-[#F5F0E8]/60">Diagnóstico de Colorimetría Profesional</p>
      </div>

      <div className="bg-[#F5F0E8] rounded-[2rem] p-6 md:p-10 shadow-2xl text-[#2D2218] w-full max-w-3xl">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative mb-6">
            <div className="w-40 h-40 md:w-56 md:h-56 rounded-full shadow-inner border-[12px] border-white bg-[#E8EBE0]" />
            <div className="absolute bottom-2 right-2 bg-[#E85D04] text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-lg">
              MATCH 98%
            </div>
          </div>
          <span className="text-[#E85D04] font-bold tracking-[0.2em] text-xs uppercase mb-2">Tono Recomendado</span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">10.1 Rubio Platino</h2>
          <div className="flex gap-3 justify-center">
            <span className="bg-white/50 px-4 py-1.5 rounded-full text-xs font-semibold border border-black/5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" /> Frío
            </span>
            <span className="bg-white/50 px-4 py-1.5 rounded-full text-xs font-semibold border border-black/5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gray-400" /> Ceniza
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/40 p-6 rounded-3xl border border-black/5">
            <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
              <ShieldCheck className="text-[#E85D04]" /> Análisis del Experto
            </h3>
            <p className="text-sm leading-relaxed opacity-90">
              "Al tener venas azuladas y piel clara, los tonos dorados excesivos podrían apagar tu luminosidad natural. El <span className="font-bold text-[#E85D04]">matiz ceniza</span> es tu mejor aliado para resaltar la profundidad de tus ojos y definir suavemente tus facciones."
            </p>
            <div className="mt-6 flex items-center gap-3 pt-4 border-t border-black/5">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWRaKEkuYx93l74hbzk1gksZvLgN9iMsD6XurtEl5FfPlID3d0GLmSsdxtYH70Dob2HGWuhGo7Bxl6q8vpV76Ray7hoqN7-CJ5Omj7wzXAUv3ykBdkh3lnHe4NKmr3_KuU6kOsOlrfdzPVsh9JEriArFKvpyaeNGHY5JICXy3jpLnp7fHKMPSJcX78PYK1uHEbXsieJy_BjYRRmUACjuqSkmj9psENo6m3_a4zCEhdwQl-sFLu3KFZiJNBxubeGdzvn6wWWN_SSJ9v"
                alt="Experto"
                className="w-12 h-12 rounded-full border-2 border-white"
                referrerPolicy="no-referrer"
              />
              <div>
                <p className="font-bold text-sm uppercase tracking-tighter">Ana García</p>
                <p className="text-xs opacity-60">Directora Técnica &amp; Colorista</p>
              </div>
            </div>
          </div>

          <div className="bg-white/40 p-6 rounded-3xl border border-black/5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-xl">Tu Paleta</h3>
              <span className="text-[10px] font-bold bg-[#E85D04]/10 text-[#E85D04] px-2 py-0.5 rounded border border-[#E85D04]/20 uppercase tracking-widest">Invierno</span>
            </div>
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-3">Moda &amp; Ropa</p>
                <div className="flex flex-wrap gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-blue-900 border border-black/5" />
                  <div className="w-9 h-9 rounded-full bg-gray-200 border border-black/5" />
                  <div className="w-9 h-9 rounded-full bg-black border border-black/5" />
                  <div className="w-9 h-9 rounded-full bg-pink-600 border border-black/5" />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-3">Maquillaje</p>
                <div className="flex flex-wrap gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-red-700 border border-black/5" />
                  <div className="w-9 h-9 rounded-full bg-purple-900 border border-black/5" />
                  <div className="w-9 h-9 rounded-full bg-pink-200 border border-black/5" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4">
          <button
            onClick={() => generateMasterColorCardPDF(selections ?? {})}
            className="w-full bg-[#E85D04] hover:bg-[#E85D04]/90 text-white font-bold py-4 px-8 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 text-lg"
          >
            Descargar Guía Completa PDF <Download className="w-5 h-5" />
          </button>
          <Link
            to="/categorias/tintes"
            className="w-full bg-transparent text-[#E85D04] border-2 border-[#E85D04]/30 hover:bg-[#E85D04]/5 font-bold py-4 px-8 rounded-2xl transition-all flex items-center justify-center gap-3"
          >
            Ver Productos Recomendados <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Wizard continue */}
      {isWizardMode && onWizardContinue && (
        <div className="w-full max-w-3xl mt-8">
          <button
            onClick={onWizardContinue}
            className="w-full flex items-center justify-center gap-2 h-14 rounded-xl bg-[#E85D04] text-white font-bold hover:bg-[#E85D04]/90 transition-all"
          >
            Continuar Diagnóstico <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
