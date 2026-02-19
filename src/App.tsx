import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CookieBanner } from "@/components/CookieBanner";
import { usePageMeta } from "@/hooks/usePageMeta";
import Index from "./pages/Index";
import CategoryProductsPage from "./pages/CategoryProductsPage";
import GenderRedirect from "./pages/GenderRedirect";
import NotFound from "./pages/NotFound";

// Lazy load non-critical pages
const PoliticaPrivacidad = lazy(() => import("./pages/PoliticaPrivacidad"));
const PoliticaCookies = lazy(() => import("./pages/PoliticaCookies"));
const Terminos = lazy(() => import("./pages/Terminos"));
const SobreNosotros = lazy(() => import("./pages/SobreNosotros"));
const Contacto = lazy(() => import("./pages/Contacto"));

const queryClient = new QueryClient();

function AppContent() {
  usePageMeta();
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Cargando...</div>}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/categorias/:categoria" element={<CategoryProductsPage />} />
            <Route path="/:gender/:slug" element={<GenderRedirect />} />
            <Route path="/politica-privacidad" element={<PoliticaPrivacidad />} />
            <Route path="/politica-cookies" element={<PoliticaCookies />} />
            <Route path="/terminos" element={<Terminos />} />
            <Route path="/sobre-nosotros" element={<SobreNosotros />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <CookieBanner />
    </div>
  );
}
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
