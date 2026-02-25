import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useEffect } from "react";

// En la carga inicial, saltamos la animación opacity:0 para que Lighthouse
// detecte el LCP element inmediatamente. En cambios de ruta sí animamos.
let initialLoadDone = false;

const PageTransition = ({ children }: { children: ReactNode }) => {
  const skipInitialAnimation = !initialLoadDone;

  useEffect(() => {
    initialLoadDone = true;
  }, []);

  return (
    <motion.div
      initial={skipInitialAnimation ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
