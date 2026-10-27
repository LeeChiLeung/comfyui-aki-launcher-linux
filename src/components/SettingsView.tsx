import React, { useState } from "react";
import {
  Settings,
  Info,
  Globe,
  Radio,
  FileCode,
  ShieldCheck,
  Package,
} from "lucide-react";
import { useLauncherStore } from "../store";

export const SettingsView: React.FC = () => {
  const { config, saveConfig, systemInfo, openUrl } = useLauncherStore();
  const [subTab, setSubTab] = useState<"general" | "about">("general");

  if (!config) return null;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[var(--bg-app)] text-[var(--text-main)] select-none transition-colors duration-200">
      {/* Top Sub-tabs */}
      <div className="h-12 border-b border-[var(--border-subtle)] flex items-center justify-between px-6 bg-[var(--bg-sidebar)] transition-colors duration-200">
        <div className="flex items-center gap-6 text-xs font-medium">
          <button
            onClick={() => setSubTab("general")}
            className={`flex items-center gap-1.5 py-3 border-b-2 transition-colors ${
              subTab === "general"
                ? "border-[var(--accent)] text-[var(--accent)] font-semibold"
                : "border-transparent text-[var(--text-sub)] hover:text-[var(--text-main)]"
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            一般设置
          </button>
          <button
            onClick={() => setSubTab("about")}
            className={`flex items-center gap-1.5 py-3 border-b-2 transition-colors ${
              subTab === "about"
                ? "border-[var(--accent)] text-[var(--accent)] font-semibold"
                : "border-transparent text-[var(--text-sub)] hover:text-[var(--text-main)]"
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            关于
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {subTab === "general" && (
          <div className="flex flex-col gap-6 max-w-4xl">
            {/* 配置模式 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-card)] shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-black/10 dark:bg-black/30">
                    <ShieldCheck className="w-4 h-4 text-sky-500" />
                  </div>
                  <div className="text-xs font-semibold text-[var(--text-main)]">
                    配置模式
                  </div>
                </div>
                <select className="bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded px-3 py-1.5 text-xs text-[var(--text-main)] min-w-[140px] outline-none">
                  <option value="expert">专家模式</option>
                  <option value="beginner">新手模式</option>
                </select>
              </div>
            </div>

            {/* 用户界面设置 */}
            <div className="space-y-2">
              <h2 className="text-sm font-bold text-[var(--text-main)] tracking-wide">
                用户界面设置
              </h2>
              <div className="flex items-center justify-between p-3.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-card)] shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-black/10 dark:bg-black/30">
                    <Globe className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[var(--text-main)]">
                      界面语言
                    </div>
                    <div className="text-[11px] text-[var(--text-sub)]">
                      选择您希望使用的界面语言，重启以完全刷新
                    </div>
                  </div>
                </div>
                <select className="bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded px-3 py-1.5 text-xs text-[var(--text-main)] min-w-[140px] outline-none">
                  <option value="system">系统语言 (System)</option>
                  <option value="zh">简体中文</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>

            {/* 网络设置 */}
            <div className="space-y-2.5">
              <h2 className="text-sm font-bold text-[var(--text-main)] tracking-wide">
                网络设置
              </h2>

              {/* PyPI 国内镜像 */}
              <div className="flex items-center justify-between p-3.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-card)] shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-black/10 dark:bg-black/30 font-bold text-[10px] text-sky-500">
                    PY
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[var(--text-main)]">
                      PyPI 国内镜像
                    </div>
                    <div className="text-[11px] text-[var(--text-sub)]">
                      通过国内镜像（清华 / 阿里）下载 Python 软件包
                    </div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.mirror_pypi}
                    onChange={(e) =>
                      saveConfig({ mirror_pypi: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                </label>
              </div>

              {/* Git 国内镜像 */}
              <div className="flex items-center justify-between p-3.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-card)] shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-black/10 dark:bg-black/30">
                    <Radio className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[var(--text-main)]">
                      Git 国内镜像
                    </div>
                    <div className="text-[11px] text-[var(--text-sub)]">
                      通过国内镜像下载 Git 仓库
                    </div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.mirror_git}
                    onChange={(e) =>
                      saveConfig({ mirror_git: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                </label>
              </div>

              {/* HuggingFace 国内镜像 */}
              <div className="flex items-center justify-between p-3.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-card)] shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-black/10 dark:bg-black/30">
                    <Package className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[var(--text-main)]">
                      HuggingFace 国内镜像
                    </div>
                    <div className="text-[11px] text-[var(--text-sub)]">
                      通过 hf-mirror.com 下载 Huggingface 模型
                    </div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.mirror_hf}
                    onChange={(e) =>
                      saveConfig({ mirror_hf: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                </label>
              </div>

              {/* GitHub 加速 */}
              <div className="flex items-center justify-between p-3.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-card)] shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-black/10 dark:bg-black/30">
                    <FileCode className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[var(--text-main)]">
                      GitHub 加速
                    </div>
                    <div className="text-[11px] text-[var(--text-sub)]">
                      提供未镜像的扩展下载与克隆加速
                    </div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.github_fast}
                    onChange={(e) =>
                      saveConfig({ github_fast: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                </label>
              </div>
            </div>
          </div>
        )}

        {subTab === "about" && (
          <div className="max-w-4xl space-y-5">
            <div className="p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-sm flex items-center gap-5">
              <img
                src="/icon.png"
                alt="Logo"
                width={64}
                height={64}
                style={{ width: 64, height: 64 }}
                className="w-16 h-16 rounded-xl shadow border border-[var(--border-subtle)] shrink-0 object-contain"
              />
              <div>
                <h2 className="text-lg font-bold text-[var(--text-main)]">
                  ComfyUI 绘世启动器 (Linux 原生版)
                </h2>
                <p className="text-xs text-[var(--text-sub)] mt-1">
                  基于 Tauri v2 (Rust) + React 19 + TypeScript + TailwindCSS 深度重构
                </p>
                <div className="flex items-center gap-4 text-xs text-[var(--accent)] mt-3">
                  <button
                    onClick={() => openUrl("https://space.bilibili.com/12566101")}
                    className="hover:underline"
                  >
                    秋叶aaaki 官方频道
                  </button>
                  <span>•</span>
                  <button
                    onClick={() =>
                      openUrl("https://github.com/comfyanonymous/ComfyUI")
                    }
                    className="hover:underline"
                  >
                    ComfyUI 官方项目
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[var(--bg-card)] border border-[var(--border-card)] shadow-sm text-xs text-[var(--text-main)] space-y-2">
              <div className="font-semibold text-[var(--text-main)]">系统运行环境检测</div>
              <div className="font-mono text-[11px] text-[var(--text-sub)] space-y-1">
                <div>硬件加速: {systemInfo?.gpu?.name || "未检测到独立显卡"}</div>
                <div>显卡驱动: {systemInfo?.gpu?.driver_version || "N/A"}</div>
                <div>Python 路径: {config.python_path}</div>
                <div>ComfyUI 目录: {systemInfo?.comfyui_dir}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
