import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, ArrowLeft } from "lucide-react";

const QUESTIONS = [
  {
    id: "experience",
    text: "¿Cuál es tu nivel de experiencia?",
    options: [
      { value: "beginner", label: "Principiante", icon: "🌱", description: "Empiezo en el sector" },
      { value: "intermediate", label: "Intermedio", icon: "💼", description: "Varios años de práctica" },
      { value: "professional", label: "Profesional", icon: "⚡", description: "Experto con salón propio" },
    ],
  },
  {
    id: "budget",
    text: "¿Cuánto quieres invertir?",
    options: [
      { value: "low", label: "Menos de 50€", icon: "💰" },
      { value: "medium", label: "50-150€", icon: "💳" },
      { value: "high", label: "Más de 150€", icon: "💎" },
    ],
  },
  {
    id: "usage",
    text: "¿Con qué frecuencia la usarás?",
    options: [
      { value: "occasional", label: "Ocasional", description: "1-2 días/semana" },
      { value: "frequent", label: "Frecuente", description: "3-5 días/semana" },
      { value: "daily", label: "Diario", description: "Uso profesional" },
    ],
  },
];

interface QuizProps {
  category: string;
  onComplete?: (products: QuizResult[]) => void;
}

interface QuizResult {
  id: string;
  name: string;
  brand: string;
  price: number;
  rating: number;
  affiliate_link: string;
  image_url: string;
  match_score: number;
}

export function ProductQuiz({ category, onComplete }: QuizProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<QuizResult[]>([]);

  const currentQuestion = QUESTIONS[step];
  const progress = ((step + 1) / QUESTIONS.length) * 100;

  const handleAnswer = async (value: string) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      setLoading(true);

      const { data, error } = await supabase.rpc("match_products_by_quiz", {
        p_category: category,
        p_budget: newAnswers.budget,
        p_experience: newAnswers.experience,
        p_usage: newAnswers.usage,
        p_limit: 3,
      });

      if (!error && data) {
        setResults(data as QuizResult[]);

        await supabase.from("quiz_responses").insert({
          session_id: crypto.randomUUID(),
          category,
          answers: newAnswers,
          recommended_products: (data as QuizResult[]).map((p) => p.id),
        });

        onComplete?.(data as QuizResult[]);
      }

      setLoading(false);
    }
  };

  const reset = () => {
    setStep(0);
    setAnswers({});
    setResults([]);
  };

  if (results.length > 0) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="font-display text-xl font-bold text-foreground">
            ¡Encontramos tus productos ideales!
          </h3>
          <p className="text-muted-foreground text-sm mt-1">Basado en tu perfil de uso</p>
        </div>

        <div className="space-y-4">
          {results.map((product, idx) => (
            <Card key={product.id} className="p-4 border-border relative overflow-hidden">
              {idx === 0 && (
                <span className="absolute top-2 right-2 bg-secondary text-secondary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                  Mejor para ti
                </span>
              )}
              <div className="flex items-center gap-4">
                <img
                  src={product.image_url || "/placeholder.svg"}
                  alt={product.name}
                  className="w-16 h-16 object-contain rounded-lg bg-muted"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">{product.brand}</p>
                  <p className="font-bold text-foreground text-sm truncate">{product.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="font-bold text-foreground">{product.price}€</span>
                    <span className="text-xs text-muted-foreground">★ {product.rating}</span>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => product.affiliate_link && window.open(product.affiliate_link, "_blank")}
                className="w-full mt-3 bg-secondary text-secondary-foreground hover:bg-secondary/90"
                size="sm"
              >
                Ver en Amazon <ArrowRight className="w-4 h-4" />
              </Button>
            </Card>
          ))}
        </div>

        <Button onClick={reset} variant="outline" className="w-full">
          Hacer el test de nuevo
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">
            Pregunta {step + 1} de {QUESTIONS.length}
          </span>
          <span className="text-muted-foreground">{progress.toFixed(0)}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-secondary" />
          <h3 className="font-display text-lg font-bold text-foreground">
            {currentQuestion.text}
          </h3>
        </div>
      </div>

      {/* Options */}
      <div className="grid gap-3">
        {currentQuestion.options.map((option) => (
          <Button
            key={option.value}
            onClick={() => handleAnswer(option.value)}
            disabled={loading}
            variant="outline"
            className="h-auto p-4 flex flex-col items-center gap-1 hover:border-primary hover:bg-accent transition-all"
          >
            {option.icon && <span className="text-2xl">{option.icon}</span>}
            <span className="font-bold text-foreground">{option.label}</span>
            {option.description && (
              <span className="text-xs text-muted-foreground">{option.description}</span>
            )}
          </Button>
        ))}
      </div>

      {step > 0 && (
        <Button onClick={() => setStep(step - 1)} variant="ghost" className="w-full">
          <ArrowLeft className="w-4 h-4 mr-1" /> Anterior
        </Button>
      )}
    </div>
  );
}
