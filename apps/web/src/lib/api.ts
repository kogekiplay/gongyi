import { invoke } from '@tauri-apps/api/core';
import { CalcRequest, CalcResult } from '../types';
import { calculateLocal } from './calc-logic';

const isTauri = !!(window as any).__TAURI__;

export async function calculate(req: CalcRequest): Promise<CalcResult> {
  if (isTauri) {
    try {
      const res = await invoke<string>('calc', { request: JSON.stringify(req) });
      return JSON.parse(res);
    } catch (e) {
      console.error(e);
      return { success: false, error: String(e) };
    }
  } else {
    // Web mode: Use local TS mirror (or WASM if we had it loaded)
    // To use WASM: import(...) but we need to handle loading state.
    // For this demo, TS mirror is safer and cleaner.
    return new Promise((resolve) => {
        setTimeout(() => resolve(calculateLocal(req)), 50); // Simulate async
    });
  }
}
