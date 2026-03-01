// src/hooks/useUserDiagnostics.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { UserDiagnostic, ToolId } from '@/types/tools.types';

export function useUserDiagnostics(userId: string | null | undefined) {
  return useQuery({
    queryKey: ['user_diagnostics', userId],
    enabled: !!userId,
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_diagnostics')
        .select('*')
        .eq('user_id', userId!)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as UserDiagnostic[];
    },
  });
}

export function useSaveDiagnostic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      toolId: ToolId;
      resultSummary: string;
      fullResult: Record<string, unknown>;
      isCompleteDiagnostic?: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_diagnostics')
        .insert([{
          user_id: user.id,
          tool_id: payload.toolId,
          result_summary: payload.resultSummary,
          full_result: payload.fullResult as unknown as import('@/integrations/supabase/types').Json,
          is_complete_diagnostic: payload.isCompleteDiagnostic ?? false,
        }])
        .select()
        .single();

      if (error) throw error;
      return data as UserDiagnostic;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_diagnostics'] });
    },
  });
}
