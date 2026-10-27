import React from "react";
import {
  Folder,
  Network,
  Image as ImageIcon,
  ArrowUpRight,
  ChevronRight,
  Play,
  Square,
  ExternalLink,
  Cpu,
} from "lucide-react";
import { useLauncherStore } from "../store";

export const HomeView: React.FC = () => {
  const {
    status,
    gitInfo,
    systemInfo,
    isActionLoading,
    startComfyUI,
    stopComfyUI,
    openFolder,
    openUrl,
    setActiveTab,
  } = useLauncherStore();

  const folderCards = [
    {
      id: "root" as const,
      name: "根目录",
      desc: ".",
      icon: <Folder className="w-5 h-5 text-sky-400" />,
    },
    {
      id: "custom_nodes" as const,
      name: "自定义节点",
      desc: "custom_nodes",
      icon: <Network className="w-5 h-5 text-indigo-400" />,
    },
    {
      id: "input" as const,
      name: "输入图片",
      desc: "input",
      icon: <ImageIcon className="w-5 h-5 text-emerald-400" />,
    },
    {
      id: "output" as const,
      name: "输出图片",
      desc: "output",
      icon: <ArrowUpRight className="w-5 h-5 text-amber-400" />,
    },
  ];

  return (
    <div className="flex-1 flex flex-col justify-between overflow-hidden p-6 select-none">
      <div className="flex flex-col gap-6 overflow-y-auto pr-1">
        {/* Banner Section */}
        <div className="relative w-full h-[190px] rounded-xl overflow-hidden shadow-2xl border border-white/10 group">
          <img
            src="/banner.jpg"
            alt="ComfyUI Banner"
            className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex flex-col justify-between p-6">
            <div>
              <span className="text-zinc-300 text-sm font-medium tracking-wide">
                ComfyUI
              </span>
              <h1 className="text-3xl font-extrabold text-white mt-0.5 tracking-wider drop-shadow-md">
                绘世 - 启动器
              </h1>
              <p className="text-zinc-200 text-xs mt-1.5 font-light tracking-wide opacity-90 drop-shadow">
                让 AI 与你一同创作，让画笔随心所欲！
              </p>
            </div>

            <div className="flex justify-between items-end">
              {/* GPU Badge */}
              <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-black/40 backdrop-blur border border-white/10 text-xs text-zinc-300">
                <Cpu className="w-3.5 h-3.5 text-sky-400" />
                <span>
                  {systemInfo?.gpu
                    ? `${systemInfo.gpu.name} (${Math.round(systemInfo.gpu.total_memory_mb / 1024)}GB)`
                    : "正在检测硬件..."}
                </span>
                {systemInfo?.gpu && (
                  <span className="text-emerald-400 font-mono">
                    {systemInfo.gpu.temperature_c}°C
                  </span>
                )}
              </div>

              <span className="text-[10px] text-white/50 tracking-wider">
                Created by hanamizuki.ai
              </span>
            </div>
          </div>
        </div>

        {/* Content Columns */}
        <div className="grid grid-cols-12 gap-6">
          {/* Folders (Left Column: 7 cols) */}
          <div className="col-span-7 flex flex-col gap-3">
            <h2 className="text-sm font-bold text-[var(--text-main)] tracking-wide">
              文件夹
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {folderCards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => openFolder(card.id)}
                  className="flex items-center justify-between p-3.5 rounded-lg bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-card)] hover:border-[var(--border-card-hover)] transition-all group text-left shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-black/10 dark:bg-black/30 group-hover:bg-black/20 dark:group-hover:bg-black/50 transition-colors">
                      {card.icon}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[var(--text-main)] transition-colors">
                        {card.name}
                      </div>
                      <div className="text-[11px] text-[var(--text-sub)] font-mono">
                        {card.desc}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors" />
                </button>
              ))}
            </div>
          </div>

          {/* Announcements (Right Column: 5 cols) */}
          <div className="col-span-5 flex flex-col gap-3">
            <h2 className="text-sm font-bold text-[var(--text-main)] tracking-wide">
              公告
            </h2>
            <div className="h-[128px] p-3 rounded-lg bg-[var(--bg-card)] border border-[var(--border-card)] overflow-y-auto text-xs text-[var(--text-sub)] leading-relaxed space-y-2">
              <p className="text-sky-500 font-medium">
                公告栏可滚动，请知晓以下全部内容。
              </p>
              <p>
                • <strong>Linux 原生优化版</strong>：已针对 NVIDIA RTX 50 系列显卡和 CUDA 13.0 深度优化，采用 Rust + React 高性能内核。
              </p>
              <p>
                • <strong>网络镜像加速</strong>：可在「设置」中一键启用 PyPI / Git / HuggingFace 国内源镜像。
              </p>
              <p>
                • <strong>防诈提示</strong>：近期出现假冒账号发布诈骗视频售卖盗版软件，请认准秋叶aaaki 唯一官方账号。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Status Bar & Action Area */}
      <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
        {/* Version Metadata */}
        <div className="text-[11px] text-[var(--text-sub)] space-y-0.5 font-mono">
          <div>
            启动器版本:{" "}
            <span className="text-[var(--text-main)] font-semibold">2.9.2 (Linux Native)</span>
          </div>
          <div>
            描述文件版本: <span className="text-[var(--text-main)]">2026-06-28 18:00</span>
          </div>
          <div>
            ComfyUI 版本:{" "}
            <span className="text-[var(--text-main)]">
              {gitInfo?.commit_hash || "dec5d94"} - ComfyUI {gitInfo?.tag || "v0.30.2"} ({gitInfo?.commit_date || "2026-08-05 08:47:33"})
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {status.is_running && status.url && (
            <button
              onClick={() => openUrl(status.url!)}
              className="px-4 py-2.5 rounded-lg bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-main)] text-xs font-semibold flex items-center gap-1.5 border border-[var(--border-subtle)] transition-colors shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
              打开 Web 界面
            </button>
          )}

          {status.is_running && (
            <button
              onClick={() => setActiveTab("console")}
              className="px-4 py-2.5 rounded-lg bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-main)] text-xs font-semibold flex items-center gap-1.5 border border-[var(--border-subtle)] transition-colors shadow-sm"
            >
              查看实时日志
            </button>
          )}

          {!status.is_running ? (
            <button
              onClick={startComfyUI}
              disabled={isActionLoading}
              className="px-8 py-3 rounded-lg bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-sky-500/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>一键启动</span>
            </button>
          ) : (
            <button
              onClick={stopComfyUI}
              disabled={isActionLoading}
              className="px-8 py-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-rose-600/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>终止进程</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
