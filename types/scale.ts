export interface Scale {
  id: string;
  name: string;
  acronym?: string;
  description: string;
  category: string;
  tags?: string[];
  timeToComplete?: string;
  popularity?: number;
  popular?: boolean;
  imageUrl?: string;
  specialty?: string;
  bodySystem?: string;
  lastUpdated?: string;
  version?: string;
  instructions?: string;
  scoring?: {
    method: string;
    ranges: Array<{
      min: number;
      max: number;
      interpretation: string;
    }>;
  };
  references?: Array<{
    title: string;
    authors: string[];
    year: number;
    doi?: string;
  }>;
  crossReferences?: string[];
}
