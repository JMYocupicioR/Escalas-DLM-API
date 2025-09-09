import { useMemo, useState, useCallback } from 'react';
import type { GASGoal, GASEvaluation, SMARTStatus } from '@/types/gas';
import { computeTScoreDetails, clampRho as clamp, normalizeWeights as norm } from '@/utils/gasTScore';

function clampRho(r: number) { return Math.max(0, Math.min(0.7, r)); }

export function useGAS(goals: GASGoal[], evaluations: GASEvaluation[]) {
  const [rho, setRho] = useState<number>(0.3);

  const sumWeights = useMemo(() => goals.reduce((s, g) => s + (Number(g.weight) || 0), 0), [goals]);

  const normalizeWeights = useCallback((targetSum = 10) => {
    const { factor } = norm(goals, targetSum);
    return goals.map(g => ({ ...g, weight: Number((Math.max(0, Number(g.weight) || 0) * factor).toFixed(2)) }));
  }, [goals]);

  const calculateTScore = useCallback((customRho?: number) => {
    if (goals.length === 0) return 50;
    const r = clamp(customRho ?? rho);
    const d = computeTScoreDetails(
      goals.map(g => ({ id: g.id, weight: g.weight })),
      evaluations.map(e => ({ goalId: e.goalId, score: e.score })),
      r
    );
    return d.tScore;
  }, [goals, evaluations, rho]);

  const getTScoreDetails = useCallback(() => {
    const d = computeTScoreDetails(
      goals.map(g => ({ id: g.id, weight: g.weight })),
      evaluations.map(e => ({ goalId: e.goalId, score: e.score })),
      rho
    );
    return d;
  }, [goals, evaluations, rho]);

  const interpretation = useMemo(() => {
    const t = calculateTScore();
    if (t > 55) return 'El logro general fue considerablemente mejor de lo esperado.';
    if (t > 50) return 'El logro general fue mejor de lo esperado.';
    if (t === 50) return 'Los objetivos se lograron según lo esperado.';
    if (t >= 45) return 'El logro general fue algo peor de lo esperado.';
    return 'El logro general fue considerablemente peor de lo esperado.';
  }, [calculateTScore]);

  const areGoalsValid = useMemo(() => {
    if (goals.length === 0) return false;
    return goals.every(g => g.title.trim() && (Number(g.weight) || 0) > 0 && Object.values(g.levels).every(t => t.trim()));
  }, [goals]);

  const allEvaluated = useMemo(() => goals.length > 0 && goals.every(g => evaluations.some(e => e.goalId === g.id && e.score !== null)), [goals, evaluations]);

  // Basic SMART heuristics for level 0
  const getSMARTStatus = useCallback((level0: string, category?: string): SMARTStatus => {
    const text = (level0 || '').toLowerCase();
    const measurable = /(\d|%|cm|mm|m\b|ml|s\b|min\b|veces|repeticiones|metros|grados|k?g\b)/.test(text) || /[0-9]/.test(text);
    const timeBound = /(en\s+\d+\s*(d[ií]as|semanas|mes(es)?)|durante\s+\d+\s*(min|s|d[ií]as|semanas|mes(es)?)|al\s*menos\s*\d+\s*de\s*\d+\s*d[ií]as)/.test(text);
    const specific = text.length >= 12 && /\b(con|sin|durante|para|hasta|mantiene|realiza|alcanza|agarra|transfiere|camina|corta|abre|cierra)\b/.test(text);
    const achievable = text.length >= 20; // simple heuristic
    const relevant = !!category || /abvd|iadl|dolor|movilidad|agarre|transferenc/i.test(text);
    return { specific, measurable, achievable, relevant, timeBound };
  }, []);

  return {
    rho,
    setRho: (v: number) => setRho(clampRho(v)),
    sumWeights,
    normalizeWeights,
    calculateTScore,
    interpretation,
    areGoalsValid,
    allEvaluated,
    getSMARTStatus,
    getTScoreDetails,
  };
}
