use serde::{Deserialize, Serialize};
use ts_rs::TS;
use wasm_bindgen::prelude::*;

#[derive(Debug, Serialize, Deserialize, Clone, Copy, PartialEq, TS)]
#[ts(export)]
pub enum StandardType {
    ShenBian,
    HengBian,
}

#[derive(Debug, Serialize, Deserialize, Clone, Copy, PartialEq, TS)]
#[ts(export)]
pub enum CalcMode {
    Single,
    Full,
}

#[derive(Debug, Serialize, Deserialize, Clone, Copy, PartialEq, TS)]
#[ts(export)]
pub enum ParamType {
    AFilm,
    BFilm,
    ADie,
    BDie,
}

#[derive(Debug, Serialize, Deserialize, Clone, TS)]
#[ts(export)]
pub struct CalcInput {
    pub n: Option<i32>,
    pub a_h_change: Option<f64>,
    pub a_h_bare: Option<f64>,
    pub b_h_change: Option<f64>,
    pub b_h_bare: Option<f64>,
    pub paper_h: Option<f64>,
    pub center_paper_h: Option<f64>,
    pub a_shrink: Option<f64>,
    pub b_shrink: Option<f64>,
    pub a_reserve: Option<f64>,
    pub b_reserve: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize, Clone, TS)]
#[ts(export)]
pub struct CalcOutput {
    pub value: f64,
    pub unit: String,
    pub decimals: usize,
    pub formula_id: String,
    // We echo back relevant inputs for verification
    pub inputs_echo: String, 
}

#[derive(Debug, Serialize, Deserialize, Clone, TS)]
#[ts(export)]
pub struct FullCalcOutput {
    pub a_film: Option<CalcOutput>,
    pub b_film: Option<CalcOutput>,
    pub a_die: Option<CalcOutput>,
    pub b_die: Option<CalcOutput>,
}

#[derive(Debug, Serialize, Deserialize, Clone, TS)]
#[ts(export)]
pub struct CalcRequest {
    pub standard: StandardType,
    pub mode: CalcMode,
    pub param: Option<ParamType>,
    pub inputs: CalcInput,
}

#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct CalcResult {
    pub success: bool,
    pub data: Option<FullCalcOutput>, // For single mode, only one field will be populated or we can use a different structure. 
    // To keep it simple, let's use FullCalcOutput for everything, but single mode just has 1 set.
    pub error: Option<String>,
}

#[derive(thiserror::Error, Debug)]
pub enum CalcError {
    #[error("缺少必要参数: {0}")]
    MissingField(String),
    #[error("数值必须大于等于0: {0}")]
    NegativeValue(String),
    #[error("导线根数 n 必须 >= 1")]
    InvalidN,
    #[error("分母为零")]
    DivisionByZero,
}

// Helper to round
fn round_to(value: f64, decimals: usize) -> f64 {
    let factor = 10f64.powi(decimals as i32);
    (value * factor).round() / factor
}

// Validation helpers
fn validate_non_negative(val: Option<f64>, name: &str) -> Result<f64, CalcError> {
    match val {
        Some(v) => {
            if v < 0.0 {
                Err(CalcError::NegativeValue(name.to_string()))
            } else {
                Ok(v)
            }
        }
        None => Err(CalcError::MissingField(name.to_string())),
    }
}

fn validate_n(n: Option<i32>) -> Result<f64, CalcError> {
    match n {
        Some(v) => {
            if v < 1 {
                Err(CalcError::InvalidN)
            } else {
                Ok(v as f64)
            }
        }
        None => Err(CalcError::MissingField("n".to_string())),
    }
}

pub fn calc_a_film(inputs: &CalcInput) -> Result<CalcOutput, CalcError> {
    // Formula: {a_h_change - [a_h_bare * (n+1)/2 + paper_h]} / ((n+1)/2)
    let n = validate_n(inputs.n)?;
    let a_h_change = validate_non_negative(inputs.a_h_change, "a_h_change")?;
    let a_h_bare = validate_non_negative(inputs.a_h_bare, "a_h_bare")?;
    let paper_h = validate_non_negative(inputs.paper_h, "paper_h")?;

    let denominator = (n + 1.0) / 2.0;
    if denominator == 0.0 {
        return Err(CalcError::DivisionByZero);
    }

    let numerator = a_h_change - (a_h_bare * denominator + paper_h);
    let value = numerator / denominator;
    
    Ok(CalcOutput {
        value: round_to(value, 2),
        unit: "mm".to_string(),
        decimals: 2,
        formula_id: "a_film".to_string(),
        inputs_echo: format!("n={}, a_h_change={}, a_h_bare={}, paper_h={}", n, a_h_change, a_h_bare, paper_h),
    })
}

pub fn calc_b_film(inputs: &CalcInput) -> Result<CalcOutput, CalcError> {
    // Formula: [b_h_change - (b_h_bare * 2 + paper_h + center_paper_h)] / 2
    let b_h_change = validate_non_negative(inputs.b_h_change, "b_h_change")?;
    let b_h_bare = validate_non_negative(inputs.b_h_bare, "b_h_bare")?;
    let paper_h = validate_non_negative(inputs.paper_h, "paper_h")?;
    let center_paper_h = validate_non_negative(inputs.center_paper_h, "center_paper_h")?;

    let numerator = b_h_change - (b_h_bare * 2.0 + paper_h + center_paper_h);
    let value = numerator / 2.0;

    Ok(CalcOutput {
        value: round_to(value, 4),
        unit: "mm".to_string(),
        decimals: 4,
        formula_id: "b_film".to_string(),
        inputs_echo: format!("b_h_change={}, b_h_bare={}, paper_h={}, center_paper_h={}", b_h_change, b_h_bare, paper_h, center_paper_h),
    })
}

pub fn calc_a_die(inputs: &CalcInput) -> Result<CalcOutput, CalcError> {
    // Formula: a_h_bare + a_shrink + a_reserve
    let a_h_bare = validate_non_negative(inputs.a_h_bare, "a_h_bare")?;
    let a_shrink = validate_non_negative(inputs.a_shrink, "a_shrink")?;
    let a_reserve = validate_non_negative(inputs.a_reserve, "a_reserve")?;

    let value = a_h_bare + a_shrink + a_reserve;

    Ok(CalcOutput {
        value: round_to(value, 4),
        unit: "mm".to_string(),
        decimals: 4,
        formula_id: "a_die".to_string(),
        inputs_echo: format!("a_h_bare={}, a_shrink={}, a_reserve={}", a_h_bare, a_shrink, a_reserve),
    })
}

pub fn calc_b_die(inputs: &CalcInput) -> Result<CalcOutput, CalcError> {
    // Formula: b_h_bare + b_shrink + b_reserve
    let b_h_bare = validate_non_negative(inputs.b_h_bare, "b_h_bare")?;
    let b_shrink = validate_non_negative(inputs.b_shrink, "b_shrink")?;
    let b_reserve = validate_non_negative(inputs.b_reserve, "b_reserve")?;

    let value = b_h_bare + b_shrink + b_reserve;

    Ok(CalcOutput {
        value: round_to(value, 4),
        unit: "mm".to_string(),
        decimals: 4,
        formula_id: "b_die".to_string(),
        inputs_echo: format!("b_h_bare={}, b_shrink={}, b_reserve={}", b_h_bare, b_shrink, b_reserve),
    })
}

#[wasm_bindgen]
pub fn calculate(request_json: &str) -> String {
    let request: CalcRequest = match serde_json::from_str(request_json) {
        Ok(req) => req,
        Err(e) => return serde_json::to_string(&CalcResult {
            success: false,
            data: None,
            error: Some(format!("Invalid JSON: {}", e)),
        }).unwrap(),
    };

    let mut output = FullCalcOutput {
        a_film: None,
        b_film: None,
        a_die: None,
        b_die: None,
    };

    let mut errors = Vec::new();

    let should_calc_a_film = match request.mode {
        CalcMode::Single => request.param == Some(ParamType::AFilm),
        CalcMode::Full => true,
    };
    
    // Logic: In Full mode, we try to calc all. If one fails due to missing input, we just skip it (or report error?)
    // Requirement: "Input all fields and output multiple results".
    // Let's collect errors only if we explicitly wanted that param.
    // Since `param` is singular in request, maybe we need to change request structure or usage.
    // However, I will implement a helper to make it easy.
    
    if should_calc_a_film {
        match calc_a_film(&request.inputs) {
            Ok(res) => output.a_film = Some(res),
            Err(e) => if request.mode == CalcMode::Single { errors.push(e.to_string()) }
        }
    }
    
    let should_calc_b_film = match request.mode {
        CalcMode::Single => request.param == Some(ParamType::BFilm),
        CalcMode::Full => true,
    };
    if should_calc_b_film {
        match calc_b_film(&request.inputs) {
            Ok(res) => output.b_film = Some(res),
            Err(e) => if request.mode == CalcMode::Single { errors.push(e.to_string()) }
        }
    }
    
    let should_calc_a_die = match request.mode {
        CalcMode::Single => request.param == Some(ParamType::ADie),
        CalcMode::Full => true,
    };
    if should_calc_a_die {
        match calc_a_die(&request.inputs) {
            Ok(res) => output.a_die = Some(res),
            Err(e) => if request.mode == CalcMode::Single { errors.push(e.to_string()) }
        }
    }

    let should_calc_b_die = match request.mode {
        CalcMode::Single => request.param == Some(ParamType::BDie),
        CalcMode::Full => true,
    };
    if should_calc_b_die {
        match calc_b_die(&request.inputs) {
            Ok(res) => output.b_die = Some(res),
            Err(e) => if request.mode == CalcMode::Single { errors.push(e.to_string()) }
        }
    }

    if !errors.is_empty() {
        return serde_json::to_string(&CalcResult {
            success: false,
            data: None,
            error: Some(errors.join("; ")),
        }).unwrap();
    }

    serde_json::to_string(&CalcResult {
        success: true,
        data: Some(output),
        error: None,
    }).unwrap()
}
 
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_a_film_normal() {
        let inputs = CalcInput {
            n: Some(3),
            a_h_change: Some(2.0),
            a_h_bare: Some(0.5),
            paper_h: Some(0.1),
            b_h_change: None,
            b_h_bare: None,
            center_paper_h: None,
            a_shrink: None,
            b_shrink: None,
            a_reserve: None,
            b_reserve: None,
        };
        let out = calc_a_film(&inputs).unwrap();
        assert_eq!(out.unit, "mm");
        assert_eq!(out.decimals, 2);
    }
    #[test]
    fn test_a_film_invalid_n() {
        let inputs = CalcInput {
            n: Some(0),
            a_h_change: Some(2.0),
            a_h_bare: Some(0.5),
            paper_h: Some(0.1),
            b_h_change: None,
            b_h_bare: None,
            center_paper_h: None,
            a_shrink: None,
            b_shrink: None,
            a_reserve: None,
            b_reserve: None,
        };
        let err = calc_a_film(&inputs).unwrap_err();
        matches!(err, CalcError::InvalidN);
    }
    #[test]
    fn test_b_film_normal() {
        let inputs = CalcInput {
            n: None,
            a_h_change: None,
            a_h_bare: None,
            paper_h: Some(0.1),
            center_paper_h: Some(0.05),
            b_h_change: Some(1.0),
            b_h_bare: Some(0.2),
            a_shrink: None,
            b_shrink: None,
            a_reserve: None,
            b_reserve: None,
        };
        let out = calc_b_film(&inputs).unwrap();
        assert_eq!(out.unit, "mm");
        assert_eq!(out.decimals, 4);
    }
    #[test]
    fn test_die_normal() {
        let inputs_a = CalcInput {
            n: None,
            a_h_change: None,
            a_h_bare: Some(0.5),
            paper_h: None,
            center_paper_h: None,
            b_h_change: None,
            b_h_bare: None,
            a_shrink: Some(0.1),
            b_shrink: None,
            a_reserve: Some(0.2),
            b_reserve: None,
        };
        let inputs_b = CalcInput {
            n: None,
            a_h_change: None,
            a_h_bare: None,
            paper_h: None,
            center_paper_h: None,
            b_h_change: None,
            b_h_bare: Some(0.4),
            a_shrink: None,
            b_shrink: Some(0.1),
            a_reserve: None,
            b_reserve: Some(0.2),
        };
        let a = calc_a_die(&inputs_a).unwrap();
        let b = calc_b_die(&inputs_b).unwrap();
        assert!(a.value > 0.0);
        assert!(b.value > 0.0);
    }
    #[test]
    fn test_negative_input_error() {
        let inputs = CalcInput {
            n: Some(3),
            a_h_change: Some(-1.0),
            a_h_bare: Some(0.5),
            paper_h: Some(0.1),
            center_paper_h: None,
            b_h_change: None,
            b_h_bare: None,
            a_shrink: None,
            b_shrink: None,
            a_reserve: None,
            b_reserve: None,
        };
        let err = calc_a_film(&inputs).unwrap_err();
        matches!(err, CalcError::NegativeValue(_));
    }
}
