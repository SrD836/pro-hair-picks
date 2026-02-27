import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
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
      <Helmet>
        <title>Tu Pasaporte Capilar · Guía del Salón</title>
        <meta
          name="description"
          content="Resumen ejecutivo de tus diagnósticos capilares, asesoría de color, seguridad química y plan de recuperación personalizado."
        />
        <meta name="robots" content="noindex" />
      </Helmet>

      <PasaporteCapilar userId={userId} />
    </>
  );
}
