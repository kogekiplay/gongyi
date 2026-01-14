import { invoke } from '@tauri-apps/api/core';
import { CalcRequest, CalcResult, ParamType } from './types';

// Mock implementation for web (when not in Tauri)
// In real app, this logic is in Rust. Here we replicate simple logic for demo if needed,
// or just return mock data.
const mockCalc = async (_req: CalcRequest): Promise<any> => {
  // Simulate delay
  await new Promise(r => setTimeout(r, 100));
  return {
    a_film: { value: 0.12, unit: 'mm', decimals: 2, formula_id: 'mock', inputs_echo: {} },
    b_film: { value: 0.15, unit: 'mm', decimals: 2, formula_id: 'mock', inputs_echo: {} },
  };
};

export async function calculate(req: CalcRequest): Promise<CalcResult> {
  try {
    const isTauri = !!(window as any).__TAURI__;
    let rawData: any;

    if (isTauri) {
      // Adapt request to what current Rust backend expects if needed
      // Assuming Rust backend expects: { standard, mode, param, inputs }
      // and returns: { success, data, error }
      // We pass req directly if it matches, or transform it.
      // Based on previous code, the structure seems compatible enough to pass through 
      // or we might need to tweak slightly.
      const responseStr = await invoke<string>('calc', { request: JSON.stringify(req) });
      const response = JSON.parse(responseStr);
      
      if (!response.success) {
        return {
          ok: false,
          error: { code: 'CALC_ERR', message: response.error || 'Unknown error' }
        };
      }
      rawData = response.data;
    } else {
      rawData = await mockCalc(req);
    }

    // Transform raw backend data (FullCalcOutput) to new CalcResult format
    const results: NonNullable<CalcResult['results']> = [];
    
    const mapResult = (key: string, param: ParamType, label: string) => {
      if (rawData[key]) {
        results.push({
          param,
          label,
          value: rawData[key].value,
          unit: rawData[key].unit,
          decimals: rawData[key].decimals,
          formula_id: rawData[key].formula_id,
          inputs_echo: rawData[key].inputs_echo || {} // Ensure echo is present
        });
      }
    };

    // Map all potential outputs
    mapResult('a_film', 'AFilm', 'a边漆膜厚度');
    mapResult('b_film', 'BFilm', 'b边漆膜厚度');
    mapResult('a_die', 'ADie', 'a边挤压模具尺寸');
    mapResult('b_die', 'BDie', 'b边挤压模具尺寸');

    return { ok: true, results };

  } catch (e: any) {
    console.error("Calculation failed", e);
    return {
      ok: false,
      error: { code: 'SYS_ERR', message: e.toString() }
    };
  }
}
