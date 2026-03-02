import { useEffect, useState } from "react";
import { SEOHead } from "@/components/seo/SEOHead";
// @ts-ignore — Supabase client import
import { supabase } from "@/integrations/supabase/client";
import PasaporteCapilar from "@/components/PasaporteCapilar";

export default function PasaporteCapilarPage() {
  const [userId, setUserId] = useState<string | undefined>();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data?.user?.id);
    });
  }, []);

  return (
    <>
      <SEOHead
        title="Tu Pasaporte Capilar · Guía del Salón"
        description="Resumen ejecutivo de tus diagnósticos capilares, asesoría de color, seguridad química y plan de recuperación personalizado."
        noIndex={true}
      />

      <PasaporteCapilar userId={userId} />
    </>
  );
}
