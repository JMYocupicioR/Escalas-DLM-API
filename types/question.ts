export interface QuestionOption {
  value: number;
  label: string;
  description: string;
}

export interface BostonQuestion {
  id: string;
  type: 'symptom' | 'functional';
  question: string;
  description: string;
  options: QuestionOption[];
}

export interface Assessment {
  id: string;
  scaleId: string;
  patientData: {
    name: string;
    age: string;
    gender: string;
    dominantHand: string;
    affectedHand: string;
    duration: string;
    doctorName: string;
  };
  answers: Record<string, number>;
  date: Date;
  score: {
    symptom: number;
    functional: number;
  };
  interpretation: {
    symptom: string;
    functional: string;
  };
}