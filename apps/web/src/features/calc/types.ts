export type StandardType = "ShenBian" | "HengBian";
export type CalcMode = "Single" | "Full";
export type ParamType = "AFilm" | "BFilm" | "ADie" | "BDie";

export interface CalcInput {
  n?: number;
  a_h_change?: number;
  a_h_bare?: number;
  b_h_change?: number;
  b_h_bare?: number;
  paper_h?: number;
  center_paper_h?: number;
  a_shrink?: number;
  b_shrink?: number;
  a_reserve?: number;
  b_reserve?: number;
}

export interface CalcOutput {
  value: number;
  unit: string;
  decimals: number;
  formula_id: string;
  inputs_echo: Record<string, number>;
}

export interface FullCalcOutput {
  a_film?: CalcOutput;
  b_film?: CalcOutput;
  a_die?: CalcOutput;
  b_die?: CalcOutput;
}

export interface CalcRequest {
  standard: StandardType;
  mode: CalcMode;
  param?: ParamType;
  selected?: ParamType[];
  inputs: CalcInput;
}

export interface CalcResult {
  ok: boolean;
  results?: {
    param: ParamType;
    label: string;
    value: number;
    unit: string;
    decimals: number;
    formula_id: string;
    inputs_echo: Record<string, number>;
  }[];
  error?: {
    code: string;
    message: string;
    fields?: string[];
  };
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  request: CalcRequest;
  result: CalcResult;
}
