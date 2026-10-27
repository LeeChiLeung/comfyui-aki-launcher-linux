export interface GpuInfo {
  name: string;
  total_memory_mb: number;
  used_memory_mb: number;
  driver_version: string;
  temperature_c: number;
}

export interface SystemInfo {
  gpu: GpuInfo | null;
  python_path: string;
  torch_version: string | null;
  cuda_available: boolean;
  cuda_version: string | null;
  comfyui_dir: string;
}

export interface LauncherConfig {
  python_path: string;
  listen_ip: string;
  port: number;
  engine: string;
  vram_mode: string;
  cross_attention: string;
  precision: string;
  cpu_vae: boolean;
  fast_mode: boolean;
  preview_mode: string;
  smart_vram: boolean;
  stable_mode: boolean;
  cuda_malloc: boolean;
  enable_aki_patches: boolean;
  auto_open_browser: boolean;
  mirror_pypi: boolean;
  mirror_git: boolean;
  mirror_hf: boolean;
  github_fast: boolean;
  extra_args: string;
}

export interface ComfyUiStatus {
  is_running: boolean;
  pid: number | null;
  port: number;
  url: string | null;
  start_time: number | null;
}

export interface ComfyUiGitInfo {
  branch: string;
  commit_hash: string;
  commit_date: string;
  remote_url: string;
  tag: string;
}

export interface DiagnosticItem {
  name: string;
  status: "ok" | "warning" | "error";
  description: string;
  detail: string;
}

export interface CustomNodeInfo {
  name: string;
  path: string;
  has_git: boolean;
  branch: string | null;
  commit: string | null;
}

export interface ModelFileInfo {
  category: string;
  file_name: string;
  size_mb: number;
  relative_path: string;
}

export interface LogMessage {
  timestamp: string;
  text: string;
  stream: "stdout" | "stderr";
}

export type NavigationTab =
  | "home"
  | "advanced"
  | "troubleshoot"
  | "versions"
  | "tools"
  | "console"
  | "settings";

export type AppTheme = "dark" | "light";
