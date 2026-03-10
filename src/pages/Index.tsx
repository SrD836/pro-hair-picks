import { SEOHead } from "@/components/seo/SEOHead";
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

const organizationSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Guía del Salón",
  url: "https://guiadelsalon.com",
  logo: "https://guiadelsalon.com/logo.png",
  sameAs: [],
});

const Index = () => {
  const { t } = useLanguage();

  return (
    <>
      <SEOHead
        title={t("meta.homeTitle")}
        description={t("meta.homeDescription")}
        ogImage="https://guiadelsalon.com/logo-full.png"
      />
      <Helmet>
        <script type="application/ld+json">{websiteSchema}</script>
        <script type="application/ld+json">{organizationSchema}</script>
      </Helmet>
      <Hero />
      <PhotoSections />
      <HomeBlogPreview />
      <HomeBentoGrid />
    </>
  );
};

export default Index;
