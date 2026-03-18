import type { GASGoal, GASEvaluation } from '@/types/gas';
import type { TScoreResult } from '@/utils/gasCalculation';
import { calculateAdvancedTScore } from '@/utils/gasCalculation';

export interface GASSnapshotPayload {
  timestamp: string;
  tscore: TScoreResult;
  goalsCount: number;
  evaluatedCount: number;
  meta?: {
    patientId?: string | null;
    patientName?: string | null;
    cycleId?: string | null;
    notes?: string | null;
  };
}

export function buildGASSnapshot(goals: GASGoal[], evaluations: GASEvaluation[], meta?: GASSnapshotPayload['meta']): GASSnapshotPayload {
  const tscore = calculateAdvancedTScore(goals, evaluations, {});
  return {
    timestamp: new Date().toISOString(),
    tscore,
    goalsCount: goals.length,
    evaluatedCount: evaluations.filter(e => e.score !== null).length,
    meta,
  };
}

