import type { GASGoal, GASEvaluation } from '@/types/gas';
import { clampRho, computeTScoreDetails } from '@/utils/gasTScore';

export type ReliabilityLevel = 'high' | 'medium' | 'low';

export interface TScoreResult {
  score: number;
  confidenceInterval: [number, number];
  standardError: number;
  reliability: ReliabilityLevel;
  interpretation: string;
  detailedInterpretation: string;
  statisticalNotes: string[];
  effectSize: number; // Cohen-like: (T-50)/10
  clinicalSignificance: 'none' | 'minimal' | 'significant';
}

function statsFromWeights(goals: Pick<GASGoal, 'weight'>[]) {
  const weights = goals.map(g => Math.max(0, Number(g.weight) || 0));
  const n = weights.length;
  const sum = weights.reduce((s, x) => s + x, 0);
  const mean = n > 0 ? sum / n : 0;
  const varW = n > 0 ? weights.reduce((s, x) => s + Math.pow(x - mean, 2), 0) / (n || 1) : 0;
  const sd = Math.sqrt(varW);
  const cv = mean > 0 ? sd / mean : 0;
  return { n, sum, mean, sd, cv };
}

function dynamicRho(goals: Pick<GASGoal, 'weight'>[], base = 0.3) {
  const { n, cv } = statsFromWeights(goals);
  const nNorm = Math.min(1, n / 10); // saturate after ~10 goals
  const cvNorm = Math.min(1, cv / 1.5); // cap high imbalance
  // More goals -> lower rho; more imbalance -> higher rho
  const adj = 0.2 * (cvNorm - (nNorm - 0.5));
  const raw = base + adj;
  const r = Math.max(0.1, Math.min(0.5, raw));
  return r;
}

function classifyReliability(kEff: number, cv: number, evaluatedShare: number): ReliabilityLevel {
  if (kEff >= 5 && cv < 0.5 && evaluatedShare >= 0.8) return 'high';
  if (kEff >= 3 && cv < 0.8 && evaluatedShare >= 0.6) return 'medium';
  return 'low';
}

export function calculateAdvancedTScore(
  goals: GASGoal[],
  evaluations: GASEvaluation[],
  options?: { rho?: number }
): TScoreResult {
  const evalCount = evaluations.filter(e => e.score !== null).length;
  const evalShare = goals.length > 0 ? evalCount / goals.length : 0;
  const rho = clampRho(options?.rho ?? dynamicRho(goals));
  const d = computeTScoreDetails(
    goals.map(g => ({ id: g.id, weight: g.weight })),
    evaluations.map(e => ({ goalId: e.goalId, score: e.score })),
    rho
  );

  // Effective number of goals (Kish effective sample size)
  const kEff = d.sumW2 > 0 ? (d.sumW * d.sumW) / d.sumW2 : 0;
  // Standard error approximation using ICC-like formula for correlated items
  // SE_T ≈ 10 * sqrt((1 + (kEff-1) * rho) / kEff)
  const se = kEff > 0 ? 10 * Math.sqrt((1 + (kEff - 1) * rho) / kEff) : 10;
  const z = 1.96;
  let lo = d.tScore - z * se;
  let hi = d.tScore + z * se;
  if (Number.isFinite(d.bounds.minT) && Number.isFinite(d.bounds.maxT)) {
    lo = Math.max(d.bounds.minT, lo);
    hi = Math.min(d.bounds.maxT, hi);
  }

  const { cv } = statsFromWeights(goals);
  const reliability = classifyReliability(kEff, cv, evalShare);

  // Interpretation
  const t = d.tScore;
  const interpretation = t > 55
    ? 'Logro considerablemente mejor de lo esperado'
    : t > 50
      ? 'Logro mejor de lo esperado'
      : t === 50
        ? 'Logro según lo esperado'
        : t >= 45
          ? 'Logro algo peor de lo esperado'
          : 'Logro considerablemente peor de lo esperado';
  const detailedInterpretation = `T=${t} (IC95% ${lo.toFixed(1)}–${hi.toFixed(1)}), ρ=${rho.toFixed(2)}, k_eff=${kEff.toFixed(2)}, CV_w=${cv.toFixed(2)}, fi_eval=${(evalShare*100).toFixed(0)}%`;

  // Effect size vs. esperado (50, SD=10)
  const effectSize = (t - 50) / 10;

  // Clinical significance w.r.t. expected 50 (proxy until pre/post is available)
  const deltaFromExpected = Math.abs(t - 50);
  const clinicalSignificance = deltaFromExpected >= 10 ? 'significant' : deltaFromExpected >= 5 ? 'minimal' : 'none';

  const notes: string[] = [];
  if (options?.rho !== undefined) notes.push('ρ forzado por opciones de cálculo.');
  notes.push(...d.notes);
  notes.push(...d.warnings);
  if (kEff < 3) notes.push('Bajo número efectivo de objetivos; amplia incertidumbre.');
  if (cv >= 0.8) notes.push('Alta variabilidad en pesos; considere normalizar.');
  if (evalShare < 0.8) notes.push('Fracción de objetivos evaluados <80%; revise datos faltantes.');

  return {
    score: d.tScore,
    confidenceInterval: [Number(lo.toFixed(2)), Number(hi.toFixed(2))],
    standardError: Number(se.toFixed(3)),
    reliability,
    interpretation,
    detailedInterpretation,
    statisticalNotes: notes,
    effectSize: Number(effectSize.toFixed(3)),
    clinicalSignificance,
  };
}

export interface GASComparison {
  delta: number;
  rci: number; // Reliable Change Index
  reliableChange: 'improved' | 'worse' | 'no';
  minimalDetectableChange: boolean;
  clinicallySignificant: boolean;
}

export function compareGASEvaluations(prev: TScoreResult, post: TScoreResult): GASComparison {
  const delta = post.score - prev.score;
  const seDiff = Math.sqrt(Math.pow(prev.standardError || 10, 2) + Math.pow(post.standardError || 10, 2));
  const rci = seDiff > 0 ? delta / seDiff : 0;
  const reliableChange = rci >= 1.96 ? 'improved' : rci <= -1.96 ? 'worse' : 'no';
  const minimalDetectableChange = Math.abs(delta) >= 5;
  const clinicallySignificant = Math.abs(delta) >= 10;
  return { delta: Number(delta.toFixed(2)), rci: Number(rci.toFixed(3)), reliableChange, minimalDetectableChange, clinicallySignificant };
}

