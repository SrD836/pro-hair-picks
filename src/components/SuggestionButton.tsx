import { useState } from "react";
import { Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const SuggestionButton = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setLoading(true);
    const { error } = await supabase.from("suggestions").insert({ message: message.trim() });
    setLoading(false);

    if (error) {
      toast({ title: "Error", description: "No se pudo enviar. Inténtalo de nuevo.", variant: "destructive" });
      return;
    }

    toast({ title: "¡Gracias!", description: "Tu sugerencia ha sido enviada." });
    setMessage("");
    setTimeout(() => setOpen(false), 2000);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DrawerTrigger asChild>
            <button
              className="fixed bottom-6 left-6 z-50 p-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors animate-suggestion-pulse"
              aria-label="Enviar sugerencia"
            >
              <Lightbulb className="w-5 h-5" />
            </button>
          </DrawerTrigger>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          <p>¿Tienes sugerencias?</p>
        </TooltipContent>
      </Tooltip>
      <DrawerContent>
        <div className="mx-auto w-full max-w-md px-4 pb-8">
          <DrawerHeader className="px-0">
            <DrawerTitle className="font-display">¿Qué categorías te gustaría ver?</DrawerTitle>
          </DrawerHeader>
          <Textarea
            placeholder="Cuéntanos qué productos o categorías echas en falta..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="mb-4"
          />
          <Button onClick={handleSubmit} disabled={loading || !message.trim()} className="w-full">
            {loading ? "Enviando..." : "Enviar sugerencia"}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default SuggestionButton;
