import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { GASGoal, GASEvaluation } from '@/types/gas';
import { calculateAdvancedTScore, type TScoreResult, compareGASEvaluations, type GASComparison } from '@/utils/gasCalculation';

export interface GASSnapshotMeta {
  patientId?: string | null;
  patientName?: string | null;
  cycleId?: string | null;
  notes?: string | null;
}

export interface GASSnapshot {
  id: string; // uuid
  createdAt: string; // ISO
  goalsCount: number;
  evaluatedCount: number;
  tscore: TScoreResult;
  meta?: GASSnapshotMeta;
}

interface GASComparisonState {
  snapshotsByPatient: Record<string, GASSnapshot[]>; // key by patientId or 'anonymous'
  addSnapshot: (patientKey: string, snapshot: GASSnapshot) => void;
  getSnapshots: (patientKey: string) => GASSnapshot[];
  compareLastTwo: (patientKey: string) => GASComparison | null;
  buildSnapshot: (goals: GASGoal[], evaluations: GASEvaluation[], meta?: GASSnapshotMeta) => GASSnapshot;
}

const patientKeyOrAnonymous = (k?: string | null) => (k && k.trim()) ? k : 'anonymous';

export const useGASComparisonStore = create<GASComparisonState>()(
  persist(
    (set, get) => ({
      snapshotsByPatient: {},

      addSnapshot: (patientKey: string, snapshot: GASSnapshot) => {
        set(state => {
          const key = patientKeyOrAnonymous(patientKey);
          const list = state.snapshotsByPatient[key] || [];
          const updated = [snapshot, ...list].slice(0, 20);
          return { snapshotsByPatient: { ...state.snapshotsByPatient, [key]: updated } };
        });
      },

      getSnapshots: (patientKey: string) => {
        const key = patientKeyOrAnonymous(patientKey);
        return get().snapshotsByPatient[key] || [];
      },

      compareLastTwo: (patientKey: string) => {
        const list = get().getSnapshots(patientKey);
        if (list.length < 2) return null;
        const [latest, prev] = list;
        return compareGASEvaluations(prev.tscore, latest.tscore);
      },

      buildSnapshot: (goals: GASGoal[], evaluations: GASEvaluation[], meta?: GASSnapshotMeta) => {
        const tscore = calculateAdvancedTScore(goals, evaluations, {});
        return {
          id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          createdAt: new Date().toISOString(),
          goalsCount: goals.length,
          evaluatedCount: evaluations.filter(e => e.score !== null).length,
          tscore,
          meta,
        };
      },
    }),
    {
      name: 'gas-comparison-storage',
      storage: createJSONStorage(() => ({
        getItem: (name: string) => {
          try { return localStorage.getItem(name); } catch { return null; }
        },
        setItem: (n: string, v: string) => { try { localStorage.setItem(n, v); } catch {} },
        removeItem: (n: string) => { try { localStorage.removeItem(n); } catch {} },
      })),
      version: 1,
    }
  )
);

// Helper selectors
export const usePatientSnapshots = (patientKey?: string | null) =>
  useGASComparisonStore(s => s.getSnapshots(patientKeyOrAnonymous(patientKey || 'anonymous')));

