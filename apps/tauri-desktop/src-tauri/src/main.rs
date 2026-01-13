// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use process_calc_core::calculate;
use tauri::command;

#[command]
fn calc(request: String) -> String {
    // We just bridge the JSON request to the core logic
    calculate(&request)
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![calc])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
