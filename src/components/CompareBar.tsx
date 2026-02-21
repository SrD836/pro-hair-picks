import { X, GitCompare, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useCompare } from "@/hooks/useCompare";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const CompareBar = () => {
  const { items, remove, clear } = useCompare();

  if (items.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        className="fixed bottom-0 inset-x-0 z-50 bg-card border-t border-border shadow-lg"
      >
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2 flex-1 overflow-x-auto">
            {items.map((p) => (
              <div key={p.id} className="relative shrink-0 w-14 h-14 rounded-lg border border-border bg-muted/50 overflow-hidden">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-contain p-1" />
                ) : (
                  <span className="flex items-center justify-center w-full h-full text-lg opacity-30">✂️</span>
                )}
                <button
                  onClick={() => remove(p.id)}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <span className="text-sm text-muted-foreground whitespace-nowrap ml-2">
              {items.length}/4 productos
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button variant="ghost" size="sm" onClick={clear}>
              <Trash2 className="w-4 h-4" />
            </Button>
            {items.length >= 2 && (
              <Button asChild variant="secondary" size="sm">
                <Link to="/comparar">
                  <GitCompare className="w-4 h-4 mr-1" />
                  Comparar ahora
                </Link>
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CompareBar;
