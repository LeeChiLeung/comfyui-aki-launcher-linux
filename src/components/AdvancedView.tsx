import React, { useState } from "react";
import {
  Settings,
  Wrench,
  ShieldCheck,
  Terminal,
  Play,
  RotateCcw,
  Cpu,
  Layers,
  Shuffle,
  Binary,
  Zap,
  Eye,
  HelpCircle,
} from "lucide-react";
import { useLauncherStore } from "../store";

export const AdvancedView: React.FC = () => {
  const {
    config,
    saveConfig,
    systemInfo,
    startComfyUI,
    openSystemTerminal,
    isActionLoading,
  } = useLauncherStore();

  const [subTab, setSubTab] = useState<"options" | "env" | "patches">("options");

  if (!config) return null;

  const gpuName = systemInfo?.gpu?.name || "NVIDIA GeForce RTX 5070 Ti";

  const handleResetDefaults = () => {
    saveConfig({
      engine: "cuda:0",
      vram_mode: "highvram",
      cross_attention: "sub-quadratic",
      precision: "default",
      cpu_vae: false,
      fast_mode: false,
      preview_mode: "auto",
      smart_vram: true,
      stable_mode: false,
      cuda_malloc: true,
    });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[var(--bg-app)] text-[var(--text-main)] select-none transition-colors duration-200">
      {/* Top Secondary Navigation */}
      <div className="h-12 border-b border-[var(--border-subtle)] flex items-center justify-between px-6 bg-[var(--bg-sidebar)] transition-colors duration-200">
        {/* Left Sub-tabs */}
        <div className="flex items-center gap-6 text-xs font-medium">
          <button
            onClick={() => setSubTab("options")}
            className={`flex items-center gap-1.5 py-3 border-b-2 transition-colors ${
              subTab === "options"
                ? "border-[var(--accent)] text-[var(--accent)] font-semibold"
                : "border-transparent text-[var(--text-sub)] hover:text-[var(--text-main)]"
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            高级选项
          </button>
          <button
            onClick={() => setSubTab("env")}
            className={`flex items-center gap-1.5 py-3 border-b-2 transition-colors ${
              subTab === "env"
                ? "border-[var(--accent)] text-[var(--accent)] font-semibold"
                : "border-transparent text-[var(--text-sub)] hover:text-[var(--text-main)]"
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            环境维护
          </button>
          <button
            onClick={() => setSubTab("patches")}
            className={`flex items-center gap-1.5 py-3 border-b-2 transition-colors ${
              subTab === "patches"
                ? "border-[var(--accent)] text-[var(--accent)] font-semibold"
                : "border-transparent text-[var(--text-sub)] hover:text-[var(--text-main)]"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            补丁管理
          </button>
        </div>

        {/* Right Quick Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={openSystemTerminal}
            className="px-3 py-1.5 rounded bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-main)] text-xs flex items-center gap-1.5 border border-[var(--border-subtle)] transition-colors shadow-sm"
          >
            <Terminal className="w-3.5 h-3.5 text-[var(--text-sub)]" />
            启动命令行提示符
          </button>
          <button
            onClick={startComfyUI}
            disabled={isActionLoading}
            className="px-3.5 py-1.5 rounded bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Play className="w-3 h-3 fill-current" />
            一键启动
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {subTab === "options" && (
          <div className="flex flex-col gap-5 max-w-4xl">
            {/* Header with reset */}
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[var(--text-main)] tracking-wide">
                性能设置
              </h2>
              <button
                onClick={handleResetDefaults}
                className="px-3 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 text-xs flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                恢复默认设置
              </button>
            </div>

            {/* List of Settings Cards */}
            <div className="space-y-2.5">
              {/* 生成引擎 */}
              <div className="flex items-center justify-between p-3.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-card)] shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-black/10 dark:bg-black/30">
                    <Cpu className="w-4 h-4 text-sky-400" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[var(--text-main)] flex items-center gap-1">
                      生成引擎
                      <HelpCircle className="w-3 h-3 text-[var(--text-muted)]" />
                    </div>
                    <div className="text-[11px] text-[var(--text-sub)]">
                      选择参与计算的硬件引擎
                    </div>
                  </div>
                </div>
                <select
                  value={config.engine}
                  onChange={(e) => saveConfig({ engine: e.target.value })}
                  className="bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded px-3 py-1.5 text-xs text-[var(--text-main)] min-w-[200px] outline-none focus:border-sky-400"
                >
                  <option value="cuda:0">{gpuName}</option>
                  <option value="cpu">CPU 运行模式</option>
                </select>
              </div>

              {/* 显存优化 */}
              <div className="flex items-center justify-between p-3.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-card)] shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-black/10 dark:bg-black/30">
                    <Layers className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[var(--text-main)]">
                      显存优化
                    </div>
                    <div className="text-[11px] text-[var(--text-sub)]">
                      通过延长计算时间换取更低显存上限要求
                    </div>
                  </div>
                </div>
                <select
                  value={config.vram_mode}
                  onChange={(e) => saveConfig({ vram_mode: e.target.value })}
                  className="bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded px-3 py-1.5 text-xs text-[var(--text-main)] min-w-[200px] outline-none focus:border-sky-400"
                >
                  <option value="default">由 ComfyUI 决定</option>
                  <option value="highvram">高显存 (highvram)</option>
                  <option value="normalvram">平衡显存 (normalvram)</option>
                  <option value="lowvram">低显存 (lowvram)</option>
                  <option value="gpu-only">全显存模式 (gpu-only)</option>
                </select>
              </div>

              {/* Cross-Attention 优化方案 */}
              <div className="flex items-center justify-between p-3.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-card)] shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-black/10 dark:bg-black/30">
                    <Shuffle className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[var(--text-main)]">
                      Cross-Attention 优化方案
                    </div>
                    <div className="text-[11px] text-[var(--text-sub)]">
                      交叉注意力优化方案，有效降低显存用量
                    </div>
                  </div>
                </div>
                <select
                  value={config.cross_attention}
                  onChange={(e) => saveConfig({ cross_attention: e.target.value })}
                  className="bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded px-3 py-1.5 text-xs text-[var(--text-main)] min-w-[200px] outline-none focus:border-sky-400"
                >
                  <option value="sub-quadratic">使用 Sub-Quadratic 方案</option>
                  <option value="sdp">使用 PyTorch SDP 方案</option>
                  <option value="default">默认方案</option>
                </select>
              </div>

              {/* 计算精度设置 */}
              <div className="flex items-center justify-between p-3.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-card)] shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-black/10 dark:bg-black/30">
                    <Binary className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[var(--text-main)]">
                      计算精度设置
                    </div>
                    <div className="text-[11px] text-[var(--text-sub)]">
                      调节计算精度以平衡性能与显存占用，缓解由于精度带来的黑图问题
                    </div>
                  </div>
                </div>
                <select
                  value={config.precision}
                  onChange={(e) => saveConfig({ precision: e.target.value })}
                  className="bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded px-3 py-1.5 text-xs text-[var(--text-main)] min-w-[200px] outline-none focus:border-sky-400"
                >
                  <option value="default">默认精度</option>
                  <option value="fp16">强制 FP16 (半精度)</option>
                  <option value="fp32">强制 FP32 (单精度)</option>
                </select>
              </div>

              {/* 使用 CPU 运行 VAE */}
              <div className="flex items-center justify-between p-3.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-card)] shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-black/10 dark:bg-black/30">
                    <Layers className="w-4 h-4 text-rose-400" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[var(--text-main)]">
                      使用 CPU 运行 VAE
                    </div>
                    <div className="text-[11px] text-[var(--text-sub)]">
                      显著降低峰值显存消耗，但会降低整体速度
                    </div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.cpu_vae}
                    onChange={(e) => saveConfig({ cpu_vae: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                </label>
              </div>

              {/* 激进提速策略 */}
              <div className="flex items-center justify-between p-3.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-card)] shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-black/10 dark:bg-black/30">
                    <Zap className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[var(--text-main)]">
                      激进提速策略
                    </div>
                    <div className="text-[11px] text-[var(--text-sub)]">
                      以一定质量代价实行激进的提速策略。需要支持的显卡型号及 Torch 版本。
                    </div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.fast_mode}
                    onChange={(e) => saveConfig({ fast_mode: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                </label>
              </div>

              {/* 预览图生成模式 */}
              <div className="flex items-center justify-between p-3.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-card)] shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-black/10 dark:bg-black/30">
                    <Eye className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[var(--text-main)]">
                      预览图生成模式
                    </div>
                    <div className="text-[11px] text-[var(--text-sub)]">
                      选择生成过程中预览图生成算法
                    </div>
                  </div>
                </div>
                <select
                  value={config.preview_mode}
                  onChange={(e) => saveConfig({ preview_mode: e.target.value })}
                  className="bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded px-3 py-1.5 text-xs text-[var(--text-main)] min-w-[200px] outline-none focus:border-sky-400"
                >
                  <option value="auto">自动</option>
                  <option value="fast">快速 (TAESD 快速解码)</option>
                  <option value="high">高清 (标准解码)</option>
                </select>
              </div>

              {/* 智能显存优化 */}
              <div className="flex items-center justify-between p-3.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-card)] shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-black/10 dark:bg-black/30">
                    <Layers className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[var(--text-main)]">
                      智能显存优化
                    </div>
                    <div className="text-[11px] text-[var(--text-sub)]">
                      开启时将尽量将模型保留在显存中，以节省显存与内存交换时间
                    </div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.smart_vram}
                    onChange={(e) => saveConfig({ smart_vram: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                </label>
              </div>

              {/* 稳定计算 */}
              <div className="flex items-center justify-between p-3.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-card)] shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-black/10 dark:bg-black/30">
                    <ShieldCheck className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[var(--text-main)]">
                      稳定计算
                    </div>
                    <div className="text-[11px] text-[var(--text-sub)]">
                      开启后将禁用 CUDA Malloc 内存重整，可缓解运算时黑图黑帧现象
                    </div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.stable_mode}
                    onChange={(e) => saveConfig({ stable_mode: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                </label>
              </div>
            </div>
          </div>
        )}

        {subTab === "env" && (
          <div className="max-w-4xl space-y-4">
            <h2 className="text-sm font-bold text-[var(--text-main)]">环境维护</h2>
            <div className="p-4 rounded-lg bg-[var(--bg-card)] border border-[var(--border-card)] space-y-3 shadow-sm">
              <div className="text-xs text-[var(--text-main)]">
                当前 Python 解释器路径：
              </div>
              <input
                type="text"
                value={config.python_path}
                onChange={(e) => saveConfig({ python_path: e.target.value })}
                className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded px-3 py-2 text-xs font-mono text-[var(--text-main)] outline-none focus:border-sky-400"
              />
              <div className="text-[11px] text-[var(--text-sub)]">
                默认指向 Linux 系统 Miniconda Python 环境：/opt/miniconda3/bin/python
              </div>
            </div>
          </div>
        )}

        {subTab === "patches" && (
          <div className="max-w-4xl space-y-4">
            <h2 className="text-sm font-bold text-[var(--text-main)]">秋叶补丁与互操作</h2>
            <div className="p-4 rounded-lg bg-[var(--bg-card)] border border-[var(--border-card)] space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-[var(--text-main)]">
                    启用秋叶 PyInterop 原生补丁
                  </div>
                  <div className="text-[11px] text-[var(--text-sub)]">
                    注入 .launcher/pyinterop 扩展包，提供更丰富的内核交互支持
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.enable_aki_patches}
                    onChange={(e) =>
                      saveConfig({ enable_aki_patches: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
