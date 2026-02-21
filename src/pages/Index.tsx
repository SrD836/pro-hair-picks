import { Helmet } from "react-helmet-async";
import Hero from "@/components/Hero";
import PhotoSections from "@/components/PhotoSections";
import HomeBentoGrid from "@/components/HomeBentoGrid";

const Index = () => (
  <>
    <Helmet>
      <title>Guía del Salón | Equipamiento profesional para peluquerías y barberías</title>
      <meta name="description" content="La guía definitiva de equipamiento para profesionales del salón. Compara clippers, secadores, planchas y más. Seleccionado por expertos." />
      <meta property="og:title" content="Guía del Salón" />
      <meta property="og:image" content="/logo-full.png" />
    </Helmet>
    <Hero />
    <PhotoSections />
    <HomeBentoGrid />
  </>
);

export default Index;
