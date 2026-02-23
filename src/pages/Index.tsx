import { Helmet } from "react-helmet-async";
import Hero from "@/components/Hero";
import PhotoSections from "@/components/PhotoSections";
import HomeBlogPreview from "@/components/HomeBlogPreview";
import HomeBentoGrid from "@/components/HomeBentoGrid";
import { useLanguage } from "@/i18n/LanguageContext";

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

const Index = () => {
  const { t } = useLanguage();

  return (
    <>
      <Helmet>
        <title>{t("meta.homeTitle")}</title>
        <meta name="description" content={t("meta.homeDescription")} />
        <meta property="og:title" content="Guía del Salón" />
        <meta property="og:image" content="/logo-full.png" />
        <script type="application/ld+json">{websiteSchema}</script>
      </Helmet>
      <Hero />
      <PhotoSections />
      <HomeBlogPreview />
      <HomeBentoGrid />
    </>
  );
};

export default Index;
