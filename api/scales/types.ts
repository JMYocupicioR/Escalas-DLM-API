import { Scale } from '@/types/scale';

export interface GetScalesParams {
  category?: string;
  specialty?: string;
  query?: string;
  limit?: number;
  page?: number;
}

export interface ScalesResponse {
  data: Scale[] | null;
  count: number | null;
  error: boolean;
  message?: string;
}

export interface ScaleResponse {
  data: Scale | null;
  error: boolean;
  message?: string;
}