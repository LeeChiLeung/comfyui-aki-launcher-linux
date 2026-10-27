use crate::state::*;
use std::fs;
use std::path::PathBuf;
use std::process::Stdio;
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::{AppHandle, Emitter, State};
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::process::Command;

fn get_comfyui_root_dir() -> PathBuf {
    // Current launcher is in ComfyUI-aki-v3.2/comfyui-launcher-linux
    // The parent directory is ComfyUI-aki-v3.2
    let current_dir = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."));
    if current_dir.join("ComfyUI").join("main.py").exists() {
        return current_dir;
    }
    if let Some(parent) = current_dir.parent() {
        if parent.join("ComfyUI").join("main.py").exists() {
            return parent.to_path_buf();
        }
    }
    // Fallback to absolute workspace path if running from subfolder
    PathBuf::from("/home/sam/Documents/spacialCode/comfyui/ComfyUI-aki-v3.2")
}

fn get_config_file_path() -> PathBuf {
    let base_dir = dirs::config_dir().unwrap_or_else(|| PathBuf::from("/home/sam/.config"));
    let config_dir = base_dir.join("aki-comfyui-launcher");
    let _ = fs::create_dir_all(&config_dir);
    config_dir.join("config.json")
}

#[tauri::command]
pub async fn get_system_info(config: State<'_, AppState>) -> Result<SystemInfo, String> {
    let mut gpu_info: Option<GpuInfo> = None;

    // 1. Probe NVIDIA GPU
    if let Ok(output) = std::process::Command::new("nvidia-smi")
        .args([
            "--query-gpu=name,memory.total,memory.used,driver_version,temperature.gpu",
            "--format=csv,noheader,nounits",
        ])
        .output()
    {
        if output.status.success() {
            let stdout = String::from_utf8_lossy(&output.stdout);
            if let Some(first_line) = stdout.lines().next() {
                let parts: Vec<&str> = first_line.split(',').map(|s| s.trim()).collect();
                if parts.len() >= 5 {
                    gpu_info = Some(GpuInfo {
                        name: parts[0].to_string(),
                        total_memory_mb: parts[1].parse().unwrap_or(0),
                        used_memory_mb: parts[2].parse().unwrap_or(0),
                        driver_version: parts[3].to_string(),
                        temperature_c: parts[4].parse().unwrap_or(0),
                    });
                }
            }
        }
    }

    // 2. Probe Python & Torch
    let current_config = config.config.lock().await;
    let python_path = current_config.python_path.clone();
    drop(current_config);

    let mut torch_version = None;
    let mut cuda_available = false;
    let mut cuda_version = None;

    if let Ok(output) = std::process::Command::new(&python_path)
        .args(["-c", "import torch; print(f'{torch.__version__}|{torch.cuda.is_available()}|{torch.version.cuda}')"])
        .output()
    {
        if output.status.success() {
            let stdout = String::from_utf8_lossy(&output.stdout).trim().to_string();
            let parts: Vec<&str> = stdout.split('|').collect();
            if parts.len() >= 3 {
                torch_version = Some(parts[0].to_string());
                cuda_available = parts[1] == "True";
                cuda_version = Some(parts[2].to_string());
            }
        }
    }

    let comfy_root = get_comfyui_root_dir();

    Ok(SystemInfo {
        gpu: gpu_info,
        python_path,
        torch_version,
        cuda_available,
        cuda_version,
        comfyui_dir: comfy_root.to_string_lossy().to_string(),
    })
}

#[tauri::command]
pub async fn get_launcher_config(state: State<'_, AppState>) -> Result<LauncherConfig, String> {
    let path = get_config_file_path();
    if path.exists() {
        if let Ok(content) = fs::read_to_string(&path) {
            if let Ok(cfg) = serde_json::from_str::<LauncherConfig>(&content) {
                let mut state_cfg = state.config.lock().await;
                *state_cfg = cfg.clone();
                return Ok(cfg);
            }
        }
    }
    let default_cfg = LauncherConfig::default();
    let mut state_cfg = state.config.lock().await;
    *state_cfg = default_cfg.clone();
    Ok(default_cfg)
}

#[tauri::command]
pub async fn save_launcher_config(
    new_config: LauncherConfig,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let path = get_config_file_path();
    let json_data = serde_json::to_string_pretty(&new_config).map_err(|e| e.to_string())?;
    fs::write(&path, json_data).map_err(|e| e.to_string())?;

    let mut state_cfg = state.config.lock().await;
    *state_cfg = new_config;
    Ok(())
}

#[tauri::command]
pub async fn get_comfyui_status(state: State<'_, AppState>) -> Result<ComfyUiStatus, String> {
    let status = state.status.lock().await;
    Ok(status.clone())
}

#[tauri::command]
pub async fn start_comfyui(
    app: AppHandle,
    state: State<'_, AppState>,
) -> Result<ComfyUiStatus, String> {
    let mut proc_lock = state.process.lock().await;
    let mut status_lock = state.status.lock().await;

    if status_lock.is_running {
        return Ok(status_lock.clone());
    }

    let cfg = state.config.lock().await.clone();
    let root_dir = get_comfyui_root_dir();
    let comfy_script = root_dir.join("ComfyUI").join("main.py");

    if !comfy_script.exists() {
        return Err(format!(
            "ComfyUI main.py not found at {}",
            comfy_script.display()
        ));
    }

    let mut cmd = Command::new(&cfg.python_path);
    cmd.current_dir(root_dir.join("ComfyUI"));
    cmd.arg(&comfy_script);
    cmd.arg("--listen").arg(&cfg.listen_ip);
    cmd.arg("--port").arg(cfg.port.to_string());

    match cfg.vram_mode.as_str() {
        "highvram" => {
            cmd.arg("--highvram");
        }
        "normalvram" => {
            cmd.arg("--normalvram");
        }
        "lowvram" => {
            cmd.arg("--lowvram");
        }
        "gpu-only" => {
            cmd.arg("--gpu-only");
        }
        _ => {}
    }

    if cfg.engine == "cpu" {
        cmd.arg("--cpu");
    }

    match cfg.cross_attention.as_str() {
        "sub-quadratic" => {
            cmd.arg("--use-split-cross-attention");
        }
        "sdp" => {
            cmd.arg("--use-pytorch-cross-attention");
        }
        _ => {}
    }

    match cfg.precision.as_str() {
        "fp16" => {
            cmd.arg("--force-fp16");
        }
        "fp32" => {
            cmd.arg("--force-fp32");
        }
        _ => {}
    }

    if cfg.cpu_vae {
        cmd.arg("--cpu-vae");
    }

    match cfg.preview_mode.as_str() {
        "fast" => {
            cmd.arg("--preview-method").arg("taesd");
        }
        "high" => {
            cmd.arg("--preview-method").arg("auto");
        }
        _ => {}
    }

    if cfg.cuda_malloc && !cfg.stable_mode {
        cmd.arg("--cuda-malloc");
    }
    if cfg.stable_mode {
        cmd.arg("--deterministic");
    }
    if !cfg.smart_vram {
        cmd.arg("--disable-smart-memory");
    }
    if cfg.fast_mode {
        cmd.arg("--fast");
    }
    if cfg.multi_user {
        cmd.arg("--multi-user");
    }
    if cfg.hf_offline {
        cmd.env("HF_HUB_OFFLINE", "1");
    }

    if !cfg.extra_args.trim().is_empty() {
        for arg in cfg.extra_args.split_whitespace() {
            cmd.arg(arg);
        }
    }

    // Handle Aki Patches (pyinterop injection)
    if cfg.enable_aki_patches {
        let zip_path = root_dir.join(".launcher").join("pyinterop.hfkx1kkk0g4q7.zip");
        if zip_path.exists() {
            let current_pythonpath = std::env::var("PYTHONPATH").unwrap_or_default();
            let new_pythonpath = if current_pythonpath.is_empty() {
                zip_path.to_string_lossy().to_string()
            } else {
                format!("{}:{}", zip_path.to_string_lossy(), current_pythonpath)
            };
            cmd.env("PYTHONPATH", new_pythonpath);
        }
    }

    cmd.stdout(Stdio::piped());
    cmd.stderr(Stdio::piped());

    let mut child = cmd.spawn().map_err(|e| format!("Failed to start ComfyUI: {}", e))?;
    let pid = child.id();

    let now_sec = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();

    let target_url = format!("http://{}:{}", cfg.listen_ip, cfg.port);

    status_lock.is_running = true;
    status_lock.pid = pid;
    status_lock.port = cfg.port;
    status_lock.url = Some(target_url.clone());
    status_lock.start_time = Some(now_sec);

    let return_status = status_lock.clone();
    drop(status_lock);

    // Stream stdout
    let stdout = child.stdout.take();
    let app_handle_stdout = app.clone();
    let auto_open = cfg.auto_open_browser;
    let url_to_open = target_url.clone();

    if let Some(stdout) = stdout {
        tokio::spawn(async move {
            let mut reader = BufReader::new(stdout).lines();
            let mut opened = false;
            while let Ok(Some(line)) = reader.next_line().await {
                let _ = app_handle_stdout.emit(
                    "comfyui-log",
                    LogMessage {
                        timestamp: chrono::Local::now().format("%H:%M:%S").to_string(),
                        text: line.clone(),
                        stream: "stdout".to_string(),
                    },
                );

                // Detect when ComfyUI server is listening
                if !opened && auto_open && (line.contains("To see the GUI go to:") || line.contains("Starting server")) {
                    opened = true;
                    let _ = open::that(&url_to_open);
                }
            }
        });
    }

    // Stream stderr
    let stderr = child.stderr.take();
    let app_handle_stderr = app.clone();
    if let Some(stderr) = stderr {
        tokio::spawn(async move {
            let mut reader = BufReader::new(stderr).lines();
            while let Ok(Some(line)) = reader.next_line().await {
                let _ = app_handle_stderr.emit(
                    "comfyui-log",
                    LogMessage {
                        timestamp: chrono::Local::now().format("%H:%M:%S").to_string(),
                        text: line,
                        stream: "stderr".to_string(),
                    },
                );
            }
        });
    }

    // Store child
    *proc_lock = Some(child);

    // Watch process exit in background
    let state_proc_clone = state.process.clone();
    let state_status_clone = state.status.clone();
    let app_handle_exit = app.clone();

    tokio::spawn(async move {
        loop {
            tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;
            let mut lock = state_proc_clone.lock().await;
            if let Some(ref mut child) = *lock {
                match child.try_wait() {
                    Ok(Some(status)) => {
                        let mut status_lock = state_status_clone.lock().await;
                        status_lock.is_running = false;
                        status_lock.pid = None;
                        status_lock.url = None;

                        let _ = app_handle_exit.emit("comfyui-status", status_lock.clone());
                        let _ = app_handle_exit.emit(
                            "comfyui-log",
                            LogMessage {
                                timestamp: chrono::Local::now().format("%H:%M:%S").to_string(),
                                text: format!("[Launcher] ComfyUI process exited with status: {}", status),
                                stream: "stdout".to_string(),
                            },
                        );
                        *lock = None;
                        break;
                    }
                    Ok(None) => {
                        // Still running
                    }
                    Err(_) => {
                        *lock = None;
                        break;
                    }
                }
            } else {
                break;
            }
        }
    });

    let _ = app.emit("comfyui-status", return_status.clone());
    Ok(return_status)
}

#[tauri::command]
pub async fn stop_comfyui(
    app: AppHandle,
    state: State<'_, AppState>,
) -> Result<ComfyUiStatus, String> {
    let mut proc_lock = state.process.lock().await;
    let mut status_lock = state.status.lock().await;

    if let Some(mut child) = proc_lock.take() {
        let _ = child.kill().await;
        let _ = app.emit(
            "comfyui-log",
            LogMessage {
                timestamp: chrono::Local::now().format("%H:%M:%S").to_string(),
                text: "[Launcher] Process termination signal sent.".to_string(),
                stream: "stdout".to_string(),
            },
        );
    }

    status_lock.is_running = false;
    status_lock.pid = None;
    status_lock.url = None;

    let ret = status_lock.clone();
    let _ = app.emit("comfyui-status", ret.clone());
    Ok(ret)
}

#[tauri::command]
pub async fn get_custom_nodes() -> Result<Vec<CustomNodeInfo>, String> {
    let root = get_comfyui_root_dir().join("ComfyUI").join("custom_nodes");
    let mut nodes = Vec::new();

    if let Ok(entries) = fs::read_dir(&root) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                let name = entry.file_name().to_string_lossy().to_string();
                if name.starts_with('.') {
                    continue;
                }
                let git_dir = path.join(".git");
                let has_git = git_dir.exists();
                let mut branch = None;
                let mut commit = None;

                if has_git {
                    if let Ok(out) = std::process::Command::new("git")
                        .args(["-C", &path.to_string_lossy(), "branch", "--show-current"])
                        .output()
                    {
                        if out.status.success() {
                            branch = Some(String::from_utf8_lossy(&out.stdout).trim().to_string());
                        }
                    }

                    if let Ok(out) = std::process::Command::new("git")
                        .args(["-C", &path.to_string_lossy(), "rev-parse", "--short", "HEAD"])
                        .output()
                    {
                        if out.status.success() {
                            commit = Some(String::from_utf8_lossy(&out.stdout).trim().to_string());
                        }
                    }
                }

                nodes.push(CustomNodeInfo {
                    name,
                    path: path.to_string_lossy().to_string(),
                    has_git,
                    branch,
                    commit,
                });
            }
        }
    }

    nodes.sort_by(|a, b| a.name.cmp(&b.name));
    Ok(nodes)
}

#[tauri::command]
pub async fn get_models_list() -> Result<Vec<ModelFileInfo>, String> {
    let models_root = get_comfyui_root_dir().join("ComfyUI").join("models");
    let mut models = Vec::new();

    if let Ok(categories) = fs::read_dir(&models_root) {
        for cat_entry in categories.flatten() {
            let cat_path = cat_entry.path();
            if cat_path.is_dir() {
                let cat_name = cat_entry.file_name().to_string_lossy().to_string();
                if let Ok(files) = fs::read_dir(&cat_path) {
                    for file_entry in files.flatten() {
                        let file_path = file_entry.path();
                        if file_path.is_file() {
                            let file_name = file_entry.file_name().to_string_lossy().to_string();
                            if file_name.starts_with('.') {
                                continue;
                            }
                            let meta = file_entry.metadata();
                            let size_mb = meta
                                .map(|m| m.len() as f64 / (1024.0 * 1024.0))
                                .unwrap_or(0.0);

                            models.push(ModelFileInfo {
                                category: cat_name.clone(),
                                file_name: file_name.clone(),
                                size_mb,
                                relative_path: format!("{}/{}", cat_name, file_name),
                            });
                        }
                    }
                }
            }
        }
    }

    models.sort_by(|a, b| a.category.cmp(&b.category).then(a.file_name.cmp(&b.file_name)));
    Ok(models)
}

#[tauri::command]
pub fn open_browser_url(url: String) -> Result<(), String> {
    open::that(&url).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn open_folder(folder_type: String) -> Result<(), String> {
    let root = get_comfyui_root_dir();
    let target = match folder_type.as_str() {
        "root" => root,
        "custom_nodes" => root.join("ComfyUI").join("custom_nodes"),
        "input" => root.join("ComfyUI").join("input"),
        "output" => root.join("ComfyUI").join("output"),
        "models" => root.join("ComfyUI").join("models"),
        _ => root,
    };
    let _ = fs::create_dir_all(&target);
    open::that(&target).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn open_system_terminal() -> Result<(), String> {
    let root = get_comfyui_root_dir().join("ComfyUI");
    let terminals = ["kitty", "alacritty", "konsole", "gnome-terminal", "xfce4-terminal", "xterm"];
    for term in terminals {
        if let Ok(child) = std::process::Command::new(term)
            .current_dir(&root)
            .spawn()
        {
            let _ = child.id();
            return Ok(());
        }
    }
    open::that(&root).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_git_info() -> Result<ComfyUiGitInfo, String> {
    let root = get_comfyui_root_dir().join("ComfyUI");
    let mut branch = "master".to_string();
    let mut commit_hash = "dec5d94".to_string();
    let mut commit_date = "2026-08-05 08:47:33".to_string();
    let mut remote_url = "https://github.com/comfyanonymous/ComfyUI".to_string();
    let mut tag = "v0.30.2".to_string();

    if let Ok(out) = std::process::Command::new("git")
        .args(["-C", &root.to_string_lossy(), "branch", "--show-current"])
        .output()
    {
        if out.status.success() {
            let s = String::from_utf8_lossy(&out.stdout).trim().to_string();
            if !s.is_empty() {
                branch = s;
            }
        }
    }

    if let Ok(out) = std::process::Command::new("git")
        .args(["-C", &root.to_string_lossy(), "rev-parse", "--short", "HEAD"])
        .output()
    {
        if out.status.success() {
            let s = String::from_utf8_lossy(&out.stdout).trim().to_string();
            if !s.is_empty() {
                commit_hash = s;
            }
        }
    }

    if let Ok(out) = std::process::Command::new("git")
        .args(["-C", &root.to_string_lossy(), "log", "-1", "--format=%cd", "--date=format:%Y-%m-%d %H:%M:%S"])
        .output()
    {
        if out.status.success() {
            let s = String::from_utf8_lossy(&out.stdout).trim().to_string();
            if !s.is_empty() {
                commit_date = s;
            }
        }
    }

    if let Ok(out) = std::process::Command::new("git")
        .args(["-C", &root.to_string_lossy(), "remote", "get-url", "origin"])
        .output()
    {
        if out.status.success() {
            let s = String::from_utf8_lossy(&out.stdout).trim().to_string();
            if !s.is_empty() {
                remote_url = s;
            }
        }
    }

    if let Ok(out) = std::process::Command::new("git")
        .args(["-C", &root.to_string_lossy(), "describe", "--tags", "--abbrev=0"])
        .output()
    {
        if out.status.success() {
            let s = String::from_utf8_lossy(&out.stdout).trim().to_string();
            if !s.is_empty() {
                tag = s;
            }
        }
    }

    Ok(ComfyUiGitInfo {
        branch,
        commit_hash,
        commit_date,
        remote_url,
        tag,
    })
}

#[tauri::command]
pub async fn run_diagnostics() -> Result<Vec<DiagnosticItem>, String> {
    let mut items = Vec::new();
    let root = get_comfyui_root_dir();

    // 1. Check ComfyUI Root
    if root.join("ComfyUI").join("main.py").exists() {
        items.push(DiagnosticItem {
            name: "ComfyUI 内核文件".to_string(),
            status: "ok".to_string(),
            description: "main.py 存在且完整".to_string(),
            detail: root.join("ComfyUI").display().to_string(),
        });
    } else {
        items.push(DiagnosticItem {
            name: "ComfyUI 内核文件".to_string(),
            status: "error".to_string(),
            description: "未找到 main.py".to_string(),
            detail: "请检查 ComfyUI 安装目录".to_string(),
        });
    }

    // 2. Check Python interpreter
    let python = "/opt/miniconda3/bin/python";
    if std::path::Path::new(python).exists() {
        items.push(DiagnosticItem {
            name: "Python 运行环境".to_string(),
            status: "ok".to_string(),
            description: "Python 3.13 / Miniconda 可用".to_string(),
            detail: python.to_string(),
        });
    } else {
        items.push(DiagnosticItem {
            name: "Python 运行环境".to_string(),
            status: "warning".to_string(),
            description: "默认 Python 路径不存在，将探测系统环境".to_string(),
            detail: "建议在高级选项中配置正确的 Python 路径".to_string(),
        });
    }

    // 3. Check NVIDIA Driver & GPU
    if let Ok(out) = std::process::Command::new("nvidia-smi").output() {
        if out.status.success() {
            items.push(DiagnosticItem {
                name: "NVIDIA 显卡驱动".to_string(),
                status: "ok".to_string(),
                description: "NVIDIA 驱动正常，已识别显卡硬件".to_string(),
                detail: "支持 CUDA 加速计算".to_string(),
            });
        } else {
            items.push(DiagnosticItem {
                name: "NVIDIA 显卡驱动".to_string(),
                status: "warning".to_string(),
                description: "nvidia-smi 返回异常，可能运行在 CPU 模式".to_string(),
                detail: "".to_string(),
            });
        }
    } else {
        items.push(DiagnosticItem {
            name: "NVIDIA 显卡驱动".to_string(),
            status: "warning".to_string(),
            description: "未安装 nvidia-smi 或使用集成显卡".to_string(),
            detail: "仅可使用 CPU 模式进行运算".to_string(),
        });
    }

    // 4. Check Git
    if let Ok(out) = std::process::Command::new("git").arg("--version").output() {
        if out.status.success() {
            let ver = String::from_utf8_lossy(&out.stdout).trim().to_string();
            items.push(DiagnosticItem {
                name: "Git 版本控制".to_string(),
                status: "ok".to_string(),
                description: ver,
                detail: "支持节点与内核一键热更新".to_string(),
            });
        }
    }

    // 5. Custom nodes folder
    let nodes_dir = root.join("ComfyUI").join("custom_nodes");
    if nodes_dir.exists() {
        let count = fs::read_dir(&nodes_dir).map(|e| e.count()).unwrap_or(0);
        items.push(DiagnosticItem {
            name: "自定义扩展节点".to_string(),
            status: "ok".to_string(),
            description: format!("已发现 {} 个自定义节点或组件", count),
            detail: nodes_dir.display().to_string(),
        });
    }

    Ok(items)
}

#[derive(serde::Deserialize)]
struct RawNodeList {
    custom_nodes: Option<Vec<RawCustomNode>>,
}

#[derive(serde::Deserialize)]
struct RawCustomNode {
    author: Option<String>,
    title: Option<String>,
    id: Option<String>,
    reference: Option<String>,
    files: Option<Vec<String>>,
    install_type: Option<String>,
    description: Option<String>,
}

#[tauri::command]
pub async fn get_available_extensions(
    force_refresh: bool,
) -> Result<Vec<AvailableExtension>, String> {
    let cache_dir = dirs::config_dir()
        .unwrap_or_else(|| PathBuf::from("/home/sam/.config"))
        .join("aki-comfyui-launcher");
    let cache_file = cache_dir.join("cache_custom_nodes.json");
    let local_fallback = get_comfyui_root_dir()
        .join("ComfyUI")
        .join("custom_nodes")
        .join("ComfyUI-Manager")
        .join("custom-node-list.json");

    let mut json_data = String::new();

    // 1. If not forcing refresh and cache exists, check cache
    if !force_refresh && cache_file.exists() {
        if let Ok(content) = fs::read_to_string(&cache_file) {
            if !content.trim().is_empty() {
                json_data = content;
            }
        }
    }

    // 2. If no data or forcing refresh, try curl from Aki's official mirror
    if json_data.is_empty() {
        let mirror_url = "https://extension-list.oystermercury.top/comfyui/custom-node-list.json";
        if let Ok(output) = std::process::Command::new("curl")
            .args(["-s", "--connect-timeout", "5", "-m", "15", mirror_url])
            .output()
        {
            if output.status.success() {
                let fetched = String::from_utf8_lossy(&output.stdout).to_string();
                if fetched.contains("\"custom_nodes\"") {
                    let _ = fs::create_dir_all(&cache_dir);
                    let _ = fs::write(&cache_file, &fetched);
                    json_data = fetched;
                }
            }
        }
    }

    // 3. Fallback to local ComfyUI-Manager file if still empty
    if json_data.is_empty() && local_fallback.exists() {
        if let Ok(content) = fs::read_to_string(&local_fallback) {
            json_data = content;
        }
    }

    if json_data.is_empty() {
        return Err("无法获取插件扩展列表，请检查网络或确认本地插件数据库存在".to_string());
    }

    let parsed: RawNodeList = serde_json::from_str(&json_data)
        .map_err(|e| format!("解析插件数据失败: {}", e))?;

    let raw_list = parsed.custom_nodes.unwrap_or_default();

    // Scan installed custom nodes to match
    let custom_nodes_dir = get_comfyui_root_dir().join("ComfyUI").join("custom_nodes");
    let mut installed_folders = std::collections::HashSet::new();
    let mut installed_remotes = std::collections::HashSet::new();

    if let Ok(entries) = fs::read_dir(&custom_nodes_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                let fname = entry.file_name().to_string_lossy().to_string();
                if !fname.starts_with('.') && !fname.starts_with("__") {
                    let key = fname.to_lowercase().replace(['-', ' ', '_'], "");
                    installed_folders.insert(key);

                    // Check git remote
                    let git_dir = path.join(".git");
                    if git_dir.exists() {
                        if let Ok(out) = std::process::Command::new("git")
                            .args(["-C", &path.to_string_lossy(), "remote", "get-url", "origin"])
                            .output()
                        {
                            if out.status.success() {
                                let remote =
                                    String::from_utf8_lossy(&out.stdout).trim().to_lowercase();
                                let clean = remote
                                    .trim_end_matches(".git")
                                    .trim_end_matches('/')
                                    .to_string();
                                if let Some(pos) = clean.find("github.com/") {
                                    installed_remotes.insert(clean[pos + 11..].to_string());
                                } else {
                                    installed_remotes.insert(clean);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    let mut result = Vec::new();
    for node in raw_list {
        let title = node.title.unwrap_or_default();
        if title.is_empty() {
            continue;
        }

        let reference = node.reference;
        let files = node.files.unwrap_or_default();

        let mut is_installed = false;
        let title_key = title.to_lowercase().replace(['-', ' ', '_'], "");
        if installed_folders.contains(&title_key) {
            is_installed = true;
        }

        if !is_installed {
            if let Some(ref ref_url) = reference {
                let norm = ref_url
                    .to_lowercase()
                    .trim_end_matches(".git")
                    .trim_end_matches('/')
                    .to_string();
                let clean = if let Some(pos) = norm.find("github.com/") {
                    norm[pos + 11..].to_string()
                } else {
                    norm
                };
                if installed_remotes.contains(&clean) {
                    is_installed = true;
                }
            }
        }

        if !is_installed {
            for f in &files {
                let norm = f
                    .to_lowercase()
                    .trim_end_matches(".git")
                    .trim_end_matches('/')
                    .to_string();
                let clean = if let Some(pos) = norm.find("github.com/") {
                    norm[pos + 11..].to_string()
                } else {
                    norm
                };
                if installed_remotes.contains(&clean) {
                    is_installed = true;
                    break;
                }
            }
        }

        result.push(AvailableExtension {
            author: node.author,
            title,
            id: node.id,
            reference,
            files,
            install_type: node.install_type,
            description: node.description,
            installed: is_installed,
        });
    }

    Ok(result)
}

#[tauri::command]
pub async fn install_custom_node(
    url: String,
    title: Option<String>,
    state: State<'_, AppState>,
) -> Result<String, String> {
    let clean_url = url.trim();
    if clean_url.is_empty() {
        return Err("仓库地址不能为空".to_string());
    }

    // Determine target folder name
    let repo_name = if let Some(pos) = clean_url.rfind('/') {
        let mut name = &clean_url[pos + 1..];
        if let Some(stripped) = name.strip_suffix(".git") {
            name = stripped;
        }
        name.to_string()
    } else {
        title.clone().unwrap_or_else(|| "custom_node".to_string())
    };

    let target_dir = get_comfyui_root_dir()
        .join("ComfyUI")
        .join("custom_nodes")
        .join(&repo_name);

    if target_dir.exists() {
        return Ok(format!("插件 {} 已存在于目录中", repo_name));
    }

    // Run git clone
    let cfg = state.config.lock().await.clone();
    let clone_url = if cfg.github_fast && clean_url.starts_with("https://github.com/") {
        format!("https://mirror.ghproxy.com/{}", clean_url)
    } else {
        clean_url.to_string()
    };

    let output = std::process::Command::new("git")
        .args([
            "clone",
            "--depth",
            "1",
            &clone_url,
            &target_dir.to_string_lossy(),
        ])
        .output()
        .map_err(|e| format!("执行 Git Clone 失败: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("克隆插件仓库失败: {}", stderr));
    }

    // Check requirements.txt
    let req_file = target_dir.join("requirements.txt");
    if req_file.exists() {
        let _ = std::process::Command::new(&cfg.python_path)
            .args([
                "-m",
                "pip",
                "install",
                "--user",
                "--no-deps",
                "-r",
                &req_file.to_string_lossy(),
            ])
            .output();
    }

    Ok(format!("成功安装插件：{}", title.unwrap_or(repo_name)))
}
