import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface QuestionCardProps {
  questionNumber: number;
  totalQuestions: number;
  title: string;
  children: ReactNode;
  direction?: 1 | -1;
}

export function QuestionCard({
  questionNumber,
  totalQuestions,
  title,
  children,
  direction = 1,
}: QuestionCardProps) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Question number */}
      <p className="text-gold/40 text-xs font-mono mb-2 uppercase tracking-widest">
        PREGUNTA {String(questionNumber).padStart(2, '0')} / {String(totalQuestions).padStart(2, '0')}
      </p>

      {/* Question text */}
      <motion.h2
        key={`q-${questionNumber}`}
        initial={{ opacity: 0, x: direction * 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: direction * -40 }}
        transition={{ duration: 0.25 }}
        className="font-display text-2xl md:text-3xl text-cream mb-8 leading-snug"
      >
        {title}
      </motion.h2>

      {/* Answer area */}
      {children}
    </div>
  );
}
