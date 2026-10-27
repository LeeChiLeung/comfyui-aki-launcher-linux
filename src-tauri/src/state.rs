use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::process::Child;
use tokio::sync::Mutex;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GpuInfo {
    pub name: String,
    pub total_memory_mb: u64,
    pub used_memory_mb: u64,
    pub driver_version: String,
    pub temperature_c: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemInfo {
    pub gpu: Option<GpuInfo>,
    pub python_path: String,
    pub torch_version: Option<String>,
    pub cuda_available: bool,
    pub cuda_version: Option<String>,
    pub comfyui_dir: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LauncherConfig {
    pub python_path: String,
    pub listen_ip: String,
    pub port: u16,
    pub engine: String, // "cuda:0", "cpu"
    pub vram_mode: String, // "default", "highvram", "normalvram", "lowvram", "gpu-only"
    pub cross_attention: String, // "sub-quadratic", "sdp", "xformers", "default"
    pub precision: String, // "default", "fp16", "bf16", "fp32"
    pub cpu_vae: bool,
    pub fast_mode: bool,
    pub preview_mode: String, // "auto", "fast", "high"
    pub smart_vram: bool,
    pub stable_mode: bool,
    pub cuda_malloc: bool,
    pub enable_aki_patches: bool,
    pub auto_open_browser: bool,
    pub hf_offline: bool,
    pub multi_user: bool,
    pub patches: Vec<String>,
    pub mirror_pypi: bool,
    pub mirror_git: bool,
    pub mirror_hf: bool,
    pub github_fast: bool,
    pub extra_args: String,
}

impl Default for LauncherConfig {
    fn default() -> Self {
        Self {
            python_path: "/opt/miniconda3/bin/python".to_string(),
            listen_ip: "127.0.0.1".to_string(),
            port: 8188,
            engine: "cuda:0".to_string(),
            vram_mode: "default".to_string(),
            cross_attention: "sub-quadratic".to_string(),
            precision: "default".to_string(),
            cpu_vae: false,
            fast_mode: false,
            preview_mode: "auto".to_string(),
            smart_vram: true,
            stable_mode: false,
            cuda_malloc: true,
            enable_aki_patches: false,
            auto_open_browser: true,
            hf_offline: false,
            multi_user: false,
            patches: Vec::new(),
            mirror_pypi: true,
            mirror_git: true,
            mirror_hf: true,
            github_fast: false,
            extra_args: "".to_string(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComfyUiGitInfo {
    pub branch: String,
    pub commit_hash: String,
    pub commit_date: String,
    pub remote_url: String,
    pub tag: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiagnosticItem {
    pub name: String,
    pub status: String, // "ok", "warning", "error"
    pub description: String,
    pub detail: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComfyUiStatus {
    pub is_running: bool,
    pub pid: Option<u32>,
    pub port: u16,
    pub url: Option<String>,
    pub start_time: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CustomNodeInfo {
    pub name: String,
    pub path: String,
    pub has_git: bool,
    pub branch: Option<String>,
    pub commit: Option<String>,
    pub commit_date: Option<String>,
    pub remote_url: Option<String>,
    pub enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AvailableExtension {
    pub author: Option<String>,
    pub title: String,
    pub id: Option<String>,
    pub reference: Option<String>,
    pub files: Vec<String>,
    pub install_type: Option<String>,
    pub description: Option<String>,
    pub installed: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelFileInfo {
    pub category: String,
    pub file_name: String,
    pub size_mb: f64,
    pub relative_path: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogMessage {
    pub timestamp: String,
    pub text: String,
    pub stream: String, // "stdout" or "stderr"
}

pub struct AppState {
    pub process: Arc<Mutex<Option<Child>>>,
    pub status: Arc<Mutex<ComfyUiStatus>>,
    pub config: Arc<Mutex<LauncherConfig>>,
}
