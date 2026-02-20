import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Send, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MAX_NAME = 100;
const MAX_EMAIL = 255;
const MAX_MESSAGE = 2000;

const Contacto = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      toast({ title: "Error", description: "Todos los campos son obligatorios.", variant: "destructive" });
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      toast({ title: "Error", description: "Introduce un email válido.", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: trimmedName.slice(0, MAX_NAME),
      email: trimmedEmail.slice(0, MAX_EMAIL),
      message: trimmedMessage.slice(0, MAX_MESSAGE),
    });
    setLoading(false);

    if (error) {
      toast({ title: "Error", description: "No se pudo enviar el mensaje. Inténtalo de nuevo.", variant: "destructive" });
    } else {
      setSent(true);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <nav className="text-sm text-muted-foreground mb-6">
        <Link to="/" className="hover:text-foreground">Inicio</Link> &gt; Contacto
      </nav>

      <h1 className="font-display text-3xl font-bold text-foreground mb-2">Contacto</h1>
      <p className="text-muted-foreground mb-8">¿Tienes alguna pregunta o sugerencia? Escríbenos y te responderemos en 24-48 horas.</p>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {sent ? (
            <Card className="p-8 text-center border-border">
              <CheckCircle className="w-12 h-12 text-secondary mx-auto mb-4" />
              <h2 className="font-display text-xl font-bold text-foreground mb-2">¡Mensaje enviado!</h2>
              <p className="text-muted-foreground">Gracias por contactarnos. Te responderemos en un plazo de 24-48 horas.</p>
              <Button onClick={() => { setSent(false); setName(""); setEmail(""); setMessage(""); }} variant="outline" className="mt-6">
                Enviar otro mensaje
              </Button>
            </Card>
          ) : (
            <Card className="p-6 border-border">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" maxLength={MAX_NAME} required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" maxLength={MAX_EMAIL} required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="message">Mensaje</Label>
                  <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="¿En qué podemos ayudarte?" maxLength={MAX_MESSAGE} rows={5} required className="mt-1" />
                  <p className="text-xs text-muted-foreground mt-1 text-right">{message.length}/{MAX_MESSAGE}</p>
                </div>
                <Button type="submit" disabled={loading} className="w-full gap-2">
                  <Send className="w-4 h-4" /> {loading ? "Enviando..." : "Enviar mensaje"}
                </Button>
              </form>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card className="p-5 border-border">
            <Mail className="w-6 h-6 text-secondary mb-2" />
            <h3 className="font-bold text-foreground text-sm">Email directo</h3>
            <a href="mailto:contacto@guiadelsalon.com" className="text-secondary text-sm hover:underline">contacto@guiadelsalon.com</a>
          </Card>
          <Card className="p-5 border-border">
            <p className="text-sm text-muted-foreground">⏱️ Tiempo de respuesta habitual: <strong className="text-foreground">24-48 horas</strong></p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Contacto;
