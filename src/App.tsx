import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CookieBanner } from "@/components/CookieBanner";
import SuggestionButton from "@/components/SuggestionButton";
import ScissorsCursor from "@/components/ScissorsCursor";
import PageTransition from "@/components/PageTransition";
import ScissorsSpinner from "@/components/ScissorsSpinner";
import { usePageMeta } from "@/hooks/usePageMeta";
import { CompareProvider } from "@/hooks/useCompare";
import CompareBar from "@/components/CompareBar";
import Index from "./pages/Index";
import CategoryProductsPage from "./pages/CategoryProductsPage";
import CompararPage from "./pages/CompararPage";
import GenderRedirect from "./pages/GenderRedirect";
import NotFound from "./pages/NotFound";

// Lazy load non-critical pages
const PoliticaPrivacidad = lazy(() => import("./pages/PoliticaPrivacidad"));
const PoliticaCookies = lazy(() => import("./pages/PoliticaCookies"));
const Terminos = lazy(() => import("./pages/Terminos"));
const SobreNosotros = lazy(() => import("./pages/SobreNosotros"));
const Contacto = lazy(() => import("./pages/Contacto"));
const GestionarMiLocal = lazy(() => import("./pages/GestionarMiLocal"));
const CalculadoraROI = lazy(() => import("./pages/CalculadoraROI"));
const QuizPage = lazy(() => import("./pages/QuizPage"));

const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <PageTransition key={location.pathname}>
        <Routes location={location}>
          <Route path="/" element={<Index />} />
          <Route path="/categorias/:categoria" element={<CategoryProductsPage />} />
          <Route path="/comparar" element={<CompararPage />} />
          <Route path="/gestionar-mi-local" element={<GestionarMiLocal />} />
          <Route path="/calculadora-roi" element={<CalculadoraROI />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/:gender/:slug" element={<GenderRedirect />} />
          <Route path="/politica-privacidad" element={<PoliticaPrivacidad />} />
          <Route path="/politica-cookies" element={<PoliticaCookies />} />
          <Route path="/terminos" element={<Terminos />} />
          <Route path="/sobre-nosotros" element={<SobreNosotros />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </PageTransition>
    </AnimatePresence>
  );
}

function AppContent() {
  usePageMeta();
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<div className="container mx-auto px-4 py-20 text-center"><ScissorsSpinner className="py-12" /></div>}>
          <AnimatedRoutes />
        </Suspense>
      </main>
      <Footer />
      <CompareBar />
      <SuggestionButton />
      <CookieBanner />
      <ScissorsCursor />
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <CompareProvider>
          <AppContent />
        </CompareProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
