import { Helmet } from "react-helmet-async";
import Hero from "@/components/Hero";
import PhotoSections from "@/components/PhotoSections";
import HomeBentoGrid from "@/components/HomeBentoGrid";

const websiteSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Guía del Salón",
  url: "https://guiadelsalon.com",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://guiadelsalon.com/blog?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
});

const Index = () => (
  <>
    <Helmet>
      <title>Guía del Salón | Equipamiento profesional para peluquerías y barberías</title>
      <meta name="description" content="La guía definitiva de equipamiento para profesionales del salón. Compara clippers, secadores, planchas y más. Seleccionado por expertos." />
      <meta property="og:title" content="Guía del Salón" />
      <meta property="og:image" content="/logo-full.png" />
      <script type="application/ld+json">{websiteSchema}</script>
    </Helmet>
    <Hero />
    <PhotoSections />
    <HomeBentoGrid />
  </>
);

export default Index;
