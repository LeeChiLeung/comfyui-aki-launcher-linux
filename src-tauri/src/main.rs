// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    // Fix Linux NVIDIA + Wayland WebKitGTK / GDK protocol error and GBM buffer allocation
    #[cfg(target_os = "linux")]
    {
        if std::env::var("GDK_BACKEND").is_err() {
            unsafe {
                std::env::set_var("GDK_BACKEND", "x11");
            }
        }
        if std::env::var("WEBKIT_DISABLE_DMABUF_RENDERER").is_err() {
            unsafe {
                std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");
            }
        }
    }

    comfyui_launcher_linux_lib::run()
}
