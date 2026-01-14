// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use process_calc_core::calculate;
use tauri::{command, Manager};
use std::fs;

#[command]
fn calc(request: String) -> String {
    // We just bridge the JSON request to the core logic
    calculate(&request)
}

#[command]
fn save_history(app: tauri::AppHandle, data: String) -> Result<(), String> {
    let path = app.path().app_data_dir().map_err(|e| e.to_string())?;
    if !path.exists() {
        fs::create_dir_all(&path).map_err(|e| e.to_string())?;
    }
    let file_path = path.join("history.json");
    fs::write(file_path, data).map_err(|e| e.to_string())?;
    Ok(())
}

#[command]
fn load_history(app: tauri::AppHandle) -> Result<String, String> {
    let path = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let file_path = path.join("history.json");
    if !file_path.exists() {
        return Ok("[]".to_string());
    }
    let data = fs::read_to_string(file_path).map_err(|e| e.to_string())?;
    Ok(data)
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![calc, save_history, load_history])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
