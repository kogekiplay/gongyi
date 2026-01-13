import { FullCalcOutput, CalcRequest, CalcResult } from '../types';

function roundTo(num: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}

function validateNonNegative(val: number | undefined, name: string): number {
  if (val === undefined || val === null) throw new Error(`缺少必要参数: ${name}`);
  if (val < 0) throw new Error(`数值必须大于等于0: ${name}`);
  return val;
}

function validateN(n: number | undefined): number {
  if (n === undefined || n === null) throw new Error(`缺少必要参数: n`);
  if (!Number.isInteger(n) || n < 1) throw new Error(`导线根数 n 必须是 >= 1 的整数`);
  return n;
}

export function calculateLocal(req: CalcRequest): CalcResult {
  try {
    const output: FullCalcOutput = {};
    const inputs = req.inputs;
    
    // Logic mirroring Rust
    const calcAFilm = () => {
      const n = validateN(inputs.n);
      const a_h_change = validateNonNegative(inputs.a_h_change, "a_h_change");
      const a_h_bare = validateNonNegative(inputs.a_h_bare, "a_h_bare");
      const paper_h = validateNonNegative(inputs.paper_h, "paper_h");
      
      const denominator = (n + 1) / 2;
      const numerator = a_h_change - (a_h_bare * denominator + paper_h);
      const val = numerator / denominator;
      
      return {
        value: roundTo(val, 2),
        unit: "mm",
        decimals: 2,
        formula_id: "a_film",
        inputs_echo: `n=${n}, a_h_change=${a_h_change}, a_h_bare=${a_h_bare}, paper_h=${paper_h}`
      };
    };

    const calcBFilm = () => {
      const b_h_change = validateNonNegative(inputs.b_h_change, "b_h_change");
      const b_h_bare = validateNonNegative(inputs.b_h_bare, "b_h_bare");
      const paper_h = validateNonNegative(inputs.paper_h, "paper_h");
      const center_paper_h = validateNonNegative(inputs.center_paper_h, "center_paper_h");

      const numerator = b_h_change - (b_h_bare * 2 + paper_h + center_paper_h);
      const val = numerator / 2;

      return {
        value: roundTo(val, 4),
        unit: "mm",
        decimals: 4,
        formula_id: "b_film",
        inputs_echo: `b_h_change=${b_h_change}, b_h_bare=${b_h_bare}, paper_h=${paper_h}, center_paper_h=${center_paper_h}`
      };
    };

    const calcADie = () => {
      const a_h_bare = validateNonNegative(inputs.a_h_bare, "a_h_bare");
      const a_shrink = validateNonNegative(inputs.a_shrink, "a_shrink");
      const a_reserve = validateNonNegative(inputs.a_reserve, "a_reserve");
      
      return {
        value: roundTo(a_h_bare + a_shrink + a_reserve, 4),
        unit: "mm",
        decimals: 4,
        formula_id: "a_die",
        inputs_echo: `a_h_bare=${a_h_bare}, a_shrink=${a_shrink}, a_reserve=${a_reserve}`
      };
    };

    const calcBDie = () => {
      const b_h_bare = validateNonNegative(inputs.b_h_bare, "b_h_bare");
      const b_shrink = validateNonNegative(inputs.b_shrink, "b_shrink");
      const b_reserve = validateNonNegative(inputs.b_reserve, "b_reserve");

      return {
        value: roundTo(b_h_bare + b_shrink + b_reserve, 4),
        unit: "mm",
        decimals: 4,
        formula_id: "b_die",
        inputs_echo: `b_h_bare=${b_h_bare}, b_shrink=${b_shrink}, b_reserve=${b_reserve}`
      };
    };

    if (req.mode === "Single") {
      if (req.param === "AFilm") output.a_film = calcAFilm();
      if (req.param === "BFilm") output.b_film = calcBFilm();
      if (req.param === "ADie") output.a_die = calcADie();
      if (req.param === "BDie") output.b_die = calcBDie();
    } else {
      // Full mode - try to calc all, ignore errors if not relevant? 
      // User requirements say "Input all fields". 
      // We will catch errors individually.
      try { output.a_film = calcAFilm(); } catch (e) {}
      try { output.b_film = calcBFilm(); } catch (e) {}
      try { output.a_die = calcADie(); } catch (e) {}
      try { output.b_die = calcBDie(); } catch (e) {}
    }

    return { success: true, data: output };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
