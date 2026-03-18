import type { GASCategory, GASLevelKey, GASGoal } from '@/types/gas';

export type SMARTRating = 'excellent' | 'good' | 'fair' | 'poor';

export interface SMARTValidation {
  // Criterios SMART
  isSpecific: boolean;
  isMeasurable: boolean;
  isAchievable: boolean;
  isRelevant: boolean;
  isTimebound: boolean;
  // Puntuación global 0..1 y rating cualitativo
  score: number;
  rating: SMARTRating;
  // Mensajería de apoyo
  suggestions: string[];
  warnings: string[];
  // Consistencia de niveles (-2..+2)
  levelsConsistency?: { ok: boolean; issues: string[] };
}

const numberUnitRe = /(?:(?:\d+[\.,]?\d*)\s*(?:%|°|grados|cm|mm|m\b|km\b|ml|l\b|kg|g|seg|s\b|min\b|minutos|horas|reps?\b|repeticiones\b|pasos\b))/i;
const countFreqRe = /(\d+)\s*(?:de|\/|sobre)\s*(\d+)\s*(?:d[ií]as|semanas)/i;
const timeBoundRe = /(durante\s*\d+\s*(?:s\b|seg|min\b|minutos|horas)|en\s*\d+\s*(?:d[ií]as|semanas|mes(?:es)?)|al\s*menos\s*\d+\s*de\s*\d+\s*d[ií]as)/i;
const absoluteWordsRe = /\b(100%|siempre|nunca|perfectamente|sin\s*fallos?)\b/i;
const relevantWordsRe = /transfer|marcha|caminar|escal[oó]n|alcanz|agarre|prensi[oó]n|bañ|aseo|vestir|comer|beber|dolor|participaci[oó]n|equilibrio|movilizaci[oó]n|fuerza|resistencia/i;
const actionVerbsRe = /\b(realiza|mantiene|alcanza|agarra|transfiere|camina|corta|abre|cierra|sostiene|sube|baja|gira|se\s*sienta|se\s*pone\s*de\s*pie|usa|utiliza|tolera)\b/i;
const contextWordsRe = /\b(cama|silla|baño|regadera|pasillo|domicilio|consulta|cl[ií]nica|superficie|escaleras?|cocina|mesa|taza|miembro\s*superior|miembro\s*inferior|mano|hombro)\b/i;

// Asistencia: mayor valor = mayor independencia
const assistanceScale: Array<{ re: RegExp; score: number }> = [
  { re: /sin\s*ayuda|independiente|independencia/i, score: 4 },
  { re: /supervisi[oó]n|vigilancia/i, score: 3 },
  { re: /m[ií]nima\s*ayuda|m[ií]nimo\s*apoyo/i, score: 2 },
  { re: /moderad[ao]\s*ayuda|apoyo\s*moderado/i, score: 1 },
  { re: /m[aá]xim[ao]\s*ayuda|asistencia\s*total|dependiente/i, score: 0 },
];

function normalizeText(t: string): string {
  return (t || '').replace(/\s+/g, ' ').trim().toLowerCase();
}

function hasNumberUnit(t: string): boolean {
  return numberUnitRe.test(t) || countFreqRe.test(t);
}

function hasTimeBound(t: string): boolean {
  return timeBoundRe.test(t);
}

function detectAssistanceScore(t: string): number | undefined {
  for (const a of assistanceScale) {
    if (a.re.test(t)) return a.score;
  }
  return undefined;
}

function extractFirstMeasure(t: string): { value: number; unit: string; betterIsHigher: boolean } | undefined {
  const painRe = /dolor|nprs|vas|escala\s*\d+\/\d+/i; // si es dolor, menor es mejor
  const m = t.match(/(\d+[\.,]?\d*)\s*(%|°|grados|cm|mm|m\b|km\b|ml|l\b|kg|g|seg|s\b|min\b|minutos|horas|reps?\b|repeticiones\b|pasos\b)/i);
  if (m) {
    const raw = parseFloat(m[1].replace(',', '.'));
    const unit = m[2].toLowerCase();
    const betterIsHigher = !painRe.test(t);
    return { value: raw, unit, betterIsHigher };
  }
  // patrón de frecuencia tipo 5 de 7 días
  const f = t.match(countFreqRe);
  if (f) {
    const num = Number(f[1]);
    const den = Number(f[2]);
    if (den > 0) return { value: num / den, unit: 'freq', betterIsHigher: true };
  }
  return undefined;
}

function qualitativeSpecificity(t: string): boolean {
  const text = normalizeText(t);
  const minLen = text.length >= 20;
  const hasVerb = actionVerbsRe.test(text);
  const hasContext = contextWordsRe.test(text) || /con\s|sin\s|durante\s|hasta\s/.test(text);
  return minLen && hasVerb && hasContext;
}

function qualitativeRelevance(t: string, category?: GASCategory): boolean {
  return !!category || relevantWordsRe.test(t);
}

function qualitativeAchievable(t: string): boolean {
  return !absoluteWordsRe.test(t);
}

function ratingFromScore(score: number): SMARTRating {
  if (score >= 0.9) return 'excellent';
  if (score >= 0.7) return 'good';
  if (score >= 0.5) return 'fair';
  return 'poor';
}

export function validateSMARTGoal(goal: Pick<GASGoal, 'title' | 'levels' | 'category'>): SMARTValidation {
  const level0 = normalizeText(goal.levels['0'] || '');
  const suggestions: string[] = [];
  const warnings: string[] = [];

  const isSpecific = qualitativeSpecificity(level0);
  if (!isSpecific) suggestions.push('Haz el objetivo específico: sujeto + acción + contexto clínico.');

  const isMeasurable = hasNumberUnit(level0);
  if (!isMeasurable) suggestions.push('Agrega una medida cuantitativa: número + unidad/escala (p. ej., 10 repeticiones, 3/10 dolor, 15 m, 30 s).');

  const isAchievable = qualitativeAchievable(level0);
  if (!isAchievable) warnings.push('Evita términos absolutos como 100%, siempre o nunca; reemplázalos por metas realistas (≥90%, al menos 5 de 7 días).');

  const isRelevant = qualitativeRelevance(level0, goal.category);
  if (!isRelevant) suggestions.push('Conecta con una tarea funcional/participación (p. ej., transferencias, marcha, aseo, vestir).');

  const isTimebound = hasTimeBound(level0);
  if (!isTimebound) suggestions.push('Añade marco temporal: duración/frecuencia (p. ej., durante 10 s, al menos 5 de 7 días, en 4 semanas).');

  if (/adecuad[ao]|suficiente|mejorar|tolerar/i.test(level0) && !isMeasurable) {
    warnings.push('Evita términos vagos sin cuantificar (adecuado, suficiente, mejorar, tolerar); especifica cómo lo medirás.');
  }

  // Puntuación
  const hits = [isSpecific, isMeasurable, isAchievable, isRelevant, isTimebound].filter(Boolean).length;
  const score = hits / 5;
  const rating = ratingFromScore(score);

  // Consistencia de niveles si se proporcionan
  const levels = goal.levels;
  const issues: string[] = [];
  const order: GASLevelKey[] = ['-2', '-1', '0', '1', '2'];
  // Intentar comparar por primera medida y/o asistencia
  const parsed = order.map(k => ({ key: k, t: normalizeText(levels[k] || '') }))
    .map(({ key, t }) => ({ key, t, m: extractFirstMeasure(t), a: detectAssistanceScore(t) }));

  // Verificar consistencia de unidades
  const units = parsed.map(p => p.m?.unit).filter(Boolean) as string[];
  const uniqueUnits = Array.from(new Set(units));
  if (units.length > 0 && uniqueUnits.length > 1) {
    issues.push('Las unidades de medida difieren entre niveles; usa la misma unidad en todos.');
  }

  // Verificación de progresión lógica
  for (let i = 0; i < order.length - 1; i++) {
    const curr = parsed[i];
    const next = parsed[i + 1];
    // Asistencia: debe aumentar la independencia con el nivel
    if (curr.a !== undefined && next.a !== undefined) {
      if (next.a < curr.a) issues.push(`Asistencia inconsistente de ${curr.key} a ${next.key}: se espera menos ayuda en niveles superiores.`);
    }
    // Medida: según polaridad
    if (curr.m && next.m && curr.m.unit === next.m.unit) {
      const dir = curr.m.betterIsHigher ? 1 : -1;
      if (dir * (next.m.value - curr.m.value) < 0) {
        issues.push(`Medida inconsistente de ${curr.key} a ${next.key}: la progresión no sigue la dirección esperada.`);
      }
    }
  }

  const levelsConsistency = { ok: issues.length === 0, issues };

  return {
    isSpecific,
    isMeasurable,
    isAchievable,
    isRelevant,
    isTimebound,
    score,
    rating,
    suggestions,
    warnings,
    levelsConsistency,
  };
}

export interface GoalImprovement {
  improved: string;
  changes: string[];
  notes?: string[];
}

export function suggestGoalImprovement(text: string, category?: GASCategory): GoalImprovement {
  let improved = text || '';
  const changes: string[] = [];
  const notes: string[] = [];
  const t = normalizeText(improved);

  // Evitar absolutos
  if (absoluteWordsRe.test(t)) {
    improved = improved.replace(/100%/gi, '≥90%')
      .replace(/siempre/gi, 'al menos 5 de 7 días')
      .replace(/nunca/gi, '0 veces en 7 días');
    changes.push('Reemplazados términos absolutos por metas realistas.');
  }

  // Añadir medida si falta
  if (!hasNumberUnit(t)) {
    if (/dolor/i.test(t)) {
      improved = improved.replace(/\.?\s*$/,'') + ' — dolor ≤3/10 en NPRS.';
      changes.push('Añadido umbral de dolor (≤3/10 NPRS).');
    } else if (/sostiene|mantiene|agarra|alcanza|camina|transfiere|corta|abre|cierra/i.test(t)) {
      improved = improved.replace(/\.?\s*$/,'') + ' — 10 repeticiones o durante 10 s.';
      changes.push('Añadida cuantificación (reps/tiempo).');
    } else {
      improved = improved.replace(/\.?\s*$/,'') + ' — 10 repeticiones.';
      changes.push('Añadida cuantificación genérica (repeticiones).');
    }
  }

  // Añadir marco temporal si falta
  if (!hasTimeBound(t)) {
    improved = improved.replace(/\.?\s*$/,'') + ' — al menos 5 de 7 días.';
    changes.push('Añadida frecuencia (≥5/7 días).');
  }

  // Añadir contexto si falta
  if (!contextWordsRe.test(t)) {
    if (category === 'movilidad' || /camina|marcha|transfiere/i.test(t)) {
      improved = improved.replace(/\.?\s*$/,'') + ' en entorno doméstico/consulta con seguridad.';
    } else if (category === 'dolor' || /dolor/i.test(t)) {
      improved = improved.replace(/\.?\s*$/,'') + ' durante actividades de ABVD (vestir/baño).';
    } else {
      improved = improved.replace(/\.?\s*$/,'') + ' en contexto funcional definido (p. ej., mesa/cama/silla).';
    }
    changes.push('Añadido contexto funcional.');
  }

  notes.push('Revisa que el texto siga siendo fiel a la intención clínica del objetivo.');

  return { improved, changes, notes };
}

