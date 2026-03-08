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
    <div className="max-w-2xl mx-auto px-6 py-10">
      {/* Question number */}
      <p className="text-espresso/25 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
        Paso {String(questionNumber).padStart(2, '0')} de {String(totalQuestions).padStart(2, '0')}
      </p>

      {/* Question text */}
      <motion.h2
        key={`q-${questionNumber}`}
        initial={{ opacity: 0, x: direction * 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: direction * -30 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="font-display text-2xl md:text-[2rem] text-espresso mb-10 leading-snug tracking-tight"
      >
        {title}
      </motion.h2>

      {/* Answer area */}
      {children}
    </div>
  );
}
