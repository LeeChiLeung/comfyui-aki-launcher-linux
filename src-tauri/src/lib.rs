mod commands;
mod state;

use state::{AppState, ComfyUiStatus, LauncherConfig};
use std::sync::Arc;
use tokio::sync::Mutex;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app_state = AppState {
        process: Arc::new(Mutex::new(None)),
        status: Arc::new(Mutex::new(ComfyUiStatus {
            is_running: false,
            pid: None,
            port: 8188,
            url: None,
            start_time: None,
        })),
        config: Arc::new(Mutex::new(LauncherConfig::default())),
    };

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            commands::get_system_info,
            commands::get_launcher_config,
            commands::save_launcher_config,
            commands::get_comfyui_status,
            commands::start_comfyui,
            commands::stop_comfyui,
            commands::get_custom_nodes,
            commands::get_models_list,
            commands::open_browser_url,
            commands::open_folder,
            commands::open_system_terminal,
            commands::get_git_info,
            commands::run_diagnostics,
            commands::get_available_extensions,
            commands::install_custom_node,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
