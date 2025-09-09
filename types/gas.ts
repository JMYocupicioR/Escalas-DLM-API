export type GASLevelKey = '-2' | '-1' | '0' | '1' | '2';

export type GASCategory =
  | 'funcion_pasiva'
  | 'funcion_activa'
  | 'dolor'
  | 'movilidad'
  | 'participacion'
  | 'habilidad';

export interface GASGoal {
  id: string;
  title: string;
  weight: number;
  category?: GASCategory;
  levels: Record<GASLevelKey, string>;
}

export interface GASEvaluation {
  goalId: string;
  score: -2 | -1 | 0 | 1 | 2 | null;
  notes?: string;
}

export type GASStep = 'form' | 'goals' | 'evaluate' | 'results';

export interface SMARTStatus {
  specific: boolean;
  measurable: boolean;
  achievable: boolean;
  relevant: boolean;
  timeBound: boolean;
}

