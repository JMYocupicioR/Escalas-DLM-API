import type { GASGoal, GASEvaluation } from '@/types/gas';

export interface TScorePerGoalContribution {
  goalId: string;
  weight: number;
  score: -2 | -1 | 0 | 1 | 2 | null;
  wX: number; // weight * score (0 if score null)
  contribution: number; // additive contribution to T (10 * wX / denominator)
  weightShare: number; // weight / sumW (0 if sumW=0)
}

export interface TScoreDetails {
  rho: number;
  sumWX: number;
  sumW2: number;
  sumW: number;
  denominator: number;
  tScore: number;
  perGoal: TScorePerGoalContribution[];
  bounds: { minT: number; maxT: number };
  warnings: string[];
  notes: string[];
}

export function clampRho(r: number) {
  // Typical literature uses 0.3; keep in [0, 0.7]
  return Math.max(0, Math.min(0.7, Number.isFinite(r) ? r : 0.3));
}

export function normalizeWeights(goals: Pick<GASGoal, 'id' | 'weight'>[], targetSum = 10) {
  const w = goals.map(g => Math.max(0, Number(g.weight) || 0));
  const sum = w.reduce((s, x) => s + x, 0);
  if (sum === 0) return { factor: 1, weights: goals.map(g => g.weight) };
  const factor = targetSum / sum;
  const weights = goals.map(g => Number((Math.max(0, Number(g.weight) || 0) * factor).toFixed(6)));
  return { factor, weights };
}

export function computeTScoreDetails(
  goals: Pick<GASGoal, 'id' | 'weight'>[],
  evaluations: Pick<GASEvaluation, 'goalId' | 'score'>[],
  rhoInput: number
): TScoreDetails {
  const rho = clampRho(rhoInput);
  const map = new Map(goals.map(g => [g.id, Math.max(0, Number(g.weight) || 0)]));
  let sumWX = 0;
  let sumW2 = 0;
  let sumW = 0;
  const warnings: string[] = [];
  const notes: string[] = [];

  const perGoal: TScorePerGoalContribution[] = goals.map(g => {
    const w = map.get(g.id) || 0;
    const ev = evaluations.find(e => e.goalId === g.id);
    const score = (ev?.score ?? null) as -2 | -1 | 0 | 1 | 2 | null;
    const x = score ?? 0;
    sumWX += w * x;
    sumW2 += w * w;
    sumW += w;
    return { goalId: g.id, weight: w, score, wX: w * x, contribution: 0, weightShare: 0 };
  });

  if (sumW === 0) {
    warnings.push('La suma de pesos es 0; el T-score se fija en 50.');
  }
  // denominator
  const denominator = Math.sqrt((1 - rho) * sumW2 + rho * (sumW * sumW));
  if (denominator === 0) {
    warnings.push('El denominador es 0 por vector de pesos degenerado; el T-score se fija en 50.');
  }
  const tScore = denominator === 0 ? 50 : Number((50 + (10 * sumWX) / denominator).toFixed(2));

  // per-goal contributions
  perGoal.forEach(p => {
    p.weightShare = sumW === 0 ? 0 : p.weight / sumW;
    p.contribution = denominator === 0 ? 0 : Number(((10 * p.wX) / denominator).toFixed(4));
  });

  // theoretical bounds for current weights
  const sumW_minWX = goals.reduce((s, g) => s + (Math.max(0, Number(g.weight) || 0) * -2), 0);
  const sumW_maxWX = goals.reduce((s, g) => s + (Math.max(0, Number(g.weight) || 0) * 2), 0);
  const minT = denominator === 0 ? 50 : Number((50 + (10 * sumW_minWX) / denominator).toFixed(2));
  const maxT = denominator === 0 ? 50 : Number((50 + (10 * sumW_maxWX) / denominator).toFixed(2));

  // warnings / notes heuristics
  if (rho !== rhoInput) notes.push(`ρ ajustado a ${rho.toFixed(2)} (rango permitido 0–0.7).`);
  if (goals.length < 3) notes.push('Menos de 3 objetivos; la varianza del T-score puede ser mayor.');
  if (perGoal.some(p => p.score === null)) warnings.push('Hay objetivos sin evaluar; se consideran como 0 para el cálculo.');
  if (perGoal.some(p => p.weight === 0)) warnings.push('Hay objetivos con peso 0; no aportan al T-score.');
  const maxShare = Math.max(0, ...perGoal.map(p => p.weightShare));
  if (maxShare > 0.5) warnings.push('Un objetivo pesa más del 50% del total; revisa la ponderación.');

  return {
    rho,
    sumWX,
    sumW2,
    sumW,
    denominator,
    tScore,
    perGoal,
    bounds: { minT, maxT },
    warnings,
    notes,
  };
}

