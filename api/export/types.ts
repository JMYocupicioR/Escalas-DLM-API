export type GenericAssessmentForPDF = {
  patientData: {
    id?: string;
    name?: string;
    age?: number | string;
    gender?: string;
    doctorName?: string;
  };
  score?: number | string;
  interpretation?: string;
  answers?: Array<{
    id: string;
    question?: string;
    label?: string;
    value?: number | string;
    points?: number | string;
  }> | Record<string, unknown>;
};

export interface PdfTheme {
  background: string;
  card: string;
  text: string;
  mutedText: string;
  border: string;
  primary: string;
}

export interface PdfOptions {
  theme?: 'light' | 'dark';
  customTheme?: Partial<PdfTheme>;
  footerNote?: string;
  preset?: 'compact' | 'medical' | 'formal';
  headerTitle?: string;
  headerSubtitle?: string;
  logoUrl?: string;
  scale?: number;
  showPatientSummary?: boolean;
}


