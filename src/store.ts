import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import {
  SystemInfo,
  LauncherConfig,
  ComfyUiStatus,
  LogMessage,
  CustomNodeInfo,
  ModelFileInfo,
  ComfyUiGitInfo,
  DiagnosticItem,
  NavigationTab,
  AppTheme,
  AvailableExtension,
} from "./types";

interface LauncherState {
  systemInfo: SystemInfo | null;
  config: LauncherConfig | null;
  status: ComfyUiStatus;
  gitInfo: ComfyUiGitInfo | null;
  diagnostics: DiagnosticItem[];
  logs: LogMessage[];
  customNodes: CustomNodeInfo[];
  availableExtensions: AvailableExtension[];
  isLoadingExtensions: boolean;
  models: ModelFileInfo[];
  activeTab: NavigationTab;
  isActionLoading: boolean;
  theme: AppTheme;

  setActiveTab: (tab: NavigationTab) => void;
  toggleTheme: () => void;
  init: () => Promise<void>;
  startComfyUI: () => Promise<void>;
  stopComfyUI: () => Promise<void>;
  saveConfig: (cfg: Partial<LauncherConfig>) => Promise<void>;
  clearLogs: () => void;
  refreshCustomNodes: () => Promise<void>;
  refreshAvailableExtensions: (forceRefresh?: boolean) => Promise<void>;
  installExtension: (url: string, title?: string) => Promise<string>;
  refreshModels: () => Promise<void>;
  refreshGitInfo: () => Promise<void>;
  runDiagnostics: () => Promise<void>;
  openUrl: (url: string) => Promise<void>;
  openFolder: (folderType: "root" | "custom_nodes" | "input" | "output" | "models") => Promise<void>;
  openSystemTerminal: () => Promise<void>;
}

export const useLauncherStore = create<LauncherState>((set, get) => ({
  systemInfo: null,
  config: null,
  status: {
    is_running: false,
    pid: null,
    port: 8188,
    url: null,
    start_time: null,
  },
  gitInfo: null,
  diagnostics: [],
  logs: [],
  customNodes: [],
  availableExtensions: [],
  isLoadingExtensions: false,
  models: [],
  activeTab: "home",
  isActionLoading: false,
  theme: "dark",

  setActiveTab: (tab) => set({ activeTab: tab }),

  toggleTheme: () => {
    const current = get().theme;
    const next: AppTheme = current === "dark" ? "light" : "dark";
    try {
      localStorage.setItem("aki_theme", next);
    } catch {}
    document.documentElement.setAttribute("data-theme", next);
    set({ theme: next });
  },

  init: async () => {
    try {
      const savedTheme = (localStorage.getItem("aki_theme") as AppTheme) || "dark";
      document.documentElement.setAttribute("data-theme", savedTheme);
      set({ theme: savedTheme });

      const [sysInfo, cfg, curStatus, git] = await Promise.all([
        invoke<SystemInfo>("get_system_info"),
        invoke<LauncherConfig>("get_launcher_config"),
        invoke<ComfyUiStatus>("get_comfyui_status"),
        invoke<ComfyUiGitInfo>("get_git_info"),
      ]);

      set({
        systemInfo: sysInfo,
        config: cfg,
        status: curStatus,
        gitInfo: git,
      });

      // Listen for log events
      await listen<LogMessage>("comfyui-log", (event) => {
        set((state) => ({
          logs: [...state.logs.slice(-2000), event.payload],
        }));
      });

      // Listen for status events
      await listen<ComfyUiStatus>("comfyui-status", (event) => {
        set({ status: event.payload });
      });

      // Fetch custom nodes & models in background
      get().refreshCustomNodes();
      get().refreshModels();
    } catch (err) {
      console.error("Failed to initialize launcher state:", err);
    }
  },

  startComfyUI: async () => {
    set({ isActionLoading: true });
    try {
      const newStatus = await invoke<ComfyUiStatus>("start_comfyui");
      set({ status: newStatus });
    } catch (err: any) {
      alert("启动 ComfyUI 失败: " + err);
    } finally {
      set({ isActionLoading: false });
    }
  },

  stopComfyUI: async () => {
    set({ isActionLoading: true });
    try {
      const newStatus = await invoke<ComfyUiStatus>("stop_comfyui");
      set({ status: newStatus });
    } catch (err: any) {
      alert("停止 ComfyUI 失败: " + err);
    } finally {
      set({ isActionLoading: false });
    }
  },

  saveConfig: async (updates: Partial<LauncherConfig>) => {
    const current = get().config;
    if (!current) return;
    const updated = { ...current, ...updates };
    set({ config: updated });
    try {
      await invoke("save_launcher_config", { config: updated });
    } catch (err) {
      console.error("Failed to save config:", err);
    }
  },

  clearLogs: () => set({ logs: [] }),

  refreshCustomNodes: async () => {
    try {
      const nodes = await invoke<CustomNodeInfo[]>("get_custom_nodes");
      set({ customNodes: nodes });
    } catch (err) {
      console.error("Failed to load custom nodes:", err);
    }
  },

  refreshAvailableExtensions: async (forceRefresh = false) => {
    set({ isLoadingExtensions: true });
    try {
      const extList = await invoke<AvailableExtension[]>("get_available_extensions", {
        forceRefresh,
      });
      set({ availableExtensions: extList, isLoadingExtensions: false });
    } catch (err) {
      console.error("Failed to load available extensions:", err);
      set({ isLoadingExtensions: false });
    }
  },

  installExtension: async (url: string, title?: string) => {
    try {
      const res = await invoke<string>("install_custom_node", { url, title });
      // Refresh both lists after install
      get().refreshCustomNodes();
      get().refreshAvailableExtensions(false);
      return res;
    } catch (err) {
      console.error("Failed to install extension:", err);
      throw err;
    }
  },

  refreshModels: async () => {
    try {
      const models = await invoke<ModelFileInfo[]>("get_models_list");
      set({ models: models });
    } catch (err) {
      console.error("Failed to load models list:", err);
    }
  },

  refreshGitInfo: async () => {
    try {
      const git = await invoke<ComfyUiGitInfo>("get_git_info");
      set({ gitInfo: git });
    } catch (err) {
      console.error("Failed to load git info:", err);
    }
  },

  runDiagnostics: async () => {
    try {
      const items = await invoke<DiagnosticItem[]>("run_diagnostics");
      set({ diagnostics: items });
    } catch (err) {
      console.error("Failed to run diagnostics:", err);
    }
  },

  openUrl: async (url: string) => {
    try {
      await invoke("open_browser_url", { url });
    } catch (err) {
      console.error("Failed to open browser url:", err);
    }
  },

  openFolder: async (folderType) => {
    try {
      await invoke("open_folder", { folderType });
    } catch (err) {
      console.error("Failed to open folder:", err);
    }
  },

  openSystemTerminal: async () => {
    try {
      await invoke("open_system_terminal");
    } catch (err) {
      console.error("Failed to open terminal:", err);
    }
  },
}));
