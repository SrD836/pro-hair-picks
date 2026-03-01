// src/hooks/useWizardReturn.ts
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { ToolId, ModuleResult, WizardSession } from '@/types/tools.types';

const WIZARD_KEY = 'wizard_session';

export function useWizardReturn(toolId: ToolId) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isWizardMode = searchParams.get('wizard') === '1';

  const completeWizardModule = (result: Omit<ModuleResult, 'toolId' | 'completedAt'>) => {
    if (!isWizardMode) return;

    try {
      const raw = localStorage.getItem(WIZARD_KEY);
      const session: WizardSession = raw
        ? JSON.parse(raw)
        : { startedAt: new Date().toISOString(), completedModules: {} };

      session.completedModules[toolId] = {
        ...result,
        toolId,
        completedAt: new Date().toISOString(),
      };
      localStorage.setItem(WIZARD_KEY, JSON.stringify(session));
    } catch {
      // best-effort
    }
    navigate('/mi-pelo/diagnostico-completo');
  };

  return { isWizardMode, completeWizardModule };
}
