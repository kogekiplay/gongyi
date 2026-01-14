import { StandardType, CalcMode, ParamType } from '../calc/types';
import { CalcFormValues } from '../calc/schema';

// Standard Label Mapping
export const STANDARD_LABELS: Record<StandardType, string> = {
  ShenBian: '沈变',
  HengBian: '衡变',
};

// Mode Label Mapping
export const MODE_LABELS: Record<CalcMode, string> = {
  Single: '单参数',
  Full: '全参数',
};

// Param Label Mapping (Internal Code -> User Friendly Chinese)
export const PARAM_LABELS: Record<ParamType, string> = {
  AFilm: 'a边漆膜厚度',
  BFilm: 'b边漆膜厚度',
  ADie: 'a边挤压模具尺寸',
  BDie: 'b边挤压模具尺寸',
};

// Input Field Labels (Reusing from schema but ensuring consistency)
export const INPUT_LABELS: Record<keyof CalcFormValues, string> = {
  n: '导线根数',
  a_h_change: 'a边换位线厚度',
  a_h_bare: 'a边裸线厚度',
  b_h_change: 'b边换位线厚度',
  b_h_bare: 'b边裸线厚度',
  paper_h: '绝缘纸厚度',
  center_paper_h: '中心纸厚度',
  a_shrink: 'a边收缩比',
  b_shrink: 'b边收缩比',
  a_reserve: 'a边预留模拉硬度',
  b_reserve: 'b边预留模拉硬度',
};

// Helper functions
export const getStandardLabel = (s: StandardType) => STANDARD_LABELS[s] || s;
export const getModeLabel = (m: CalcMode) => MODE_LABELS[m] || m;
export const getParamLabel = (p: ParamType) => PARAM_LABELS[p] || p;
export const getInputLabel = (k: string) => INPUT_LABELS[k as keyof CalcFormValues] || k;
