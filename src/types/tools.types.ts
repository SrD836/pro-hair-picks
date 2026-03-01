// src/types/tools.types.ts

export type ToolId =
  | 'asesor-color'
  | 'diagnostico-capilar'
  | 'compatibilidad-quimica'
  | 'recuperacion-capilar'
  | 'analizador-canicie'
  | 'analizador-alopecia';

export type BadgeType = 'IA' | 'CIENTÍFICO' | 'TÉCNICO';

export interface ToolConfig {
  id: ToolId;
  title: string;
  description: string;
  duration: string;
  questionsCount: number;
  badge: BadgeType;
  emoji: string;
  href: string;
  accentColor: string;
}

/** Generic result stored after any tool completes */
export interface ModuleResult {
  toolId: ToolId;
  completedAt: string;          // ISO timestamp
  summary: string;              // 1 sentence human-readable result
  score?: number;               // 0-100 if applicable
  rawResult: Record<string, unknown>; // tool-specific data
}

/** Wizard session saved to localStorage key 'wizard_session' */
export interface WizardSession {
  startedAt: string;
  completedModules: Partial<Record<ToolId, ModuleResult>>;
}

/** Row shape for Supabase user_diagnostics table */
export interface UserDiagnostic {
  id: string;
  user_id: string;
  tool_id: ToolId;
  result_summary: string;
  full_result: Record<string, unknown>;
  is_complete_diagnostic: boolean;
  share_token: string | null;
  created_at: string;
}

/** Props every result-screen component can accept to integrate with wizard */
export interface WizardResultProps {
  onWizardContinue?: () => void; // if provided, show "Continuar →" CTA
}

/** Stitch-compatible step props (Bloque 5) */
export interface StepProps {
  stepNumber: number;
  totalSteps: number;
  moduleTitle: string;
  question: string;
  questionSubtitle?: string;
  answerType: 'grid' | 'list' | 'slider' | 'color_picker' | 'dual_select';
  options?: Array<{ value: string; label: string }>;
  expertTip?: string;
  progressPercent: number;
  onAnswer: (value: unknown) => void;
  onBack: () => void;
}

/** Stitch-compatible result props (Bloque 5) */
export interface ToolResultProps {
  toolId: ToolId;
  resultTitle: string;
  resultScore?: number;
  resultBadge?: string;
  resultSummary: string;
  detailSections: Array<{ title: string; content: string }>;
  expertVerdict: string;
  ctaActions: Array<{ label: string; href?: string; onClick?: () => void }>;
}
