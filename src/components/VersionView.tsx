import React, { useState } from "react";
import {
  Clock,
  Puzzle,
  Download,
  RefreshCw,
  GitBranch,
  Check,
} from "lucide-react";
import { useLauncherStore } from "../store";

export const VersionView: React.FC = () => {
  const {
    gitInfo,
    customNodes,
    refreshCustomNodes,
    refreshGitInfo,
  } = useLauncherStore();

  const [subTab, setSubTab] = useState<"core" | "extensions" | "install">("core");
  const [channel, setChannel] = useState<"stable" | "dev">("stable");

  const coreVersions = [
    { id: "426f5ee", tag: "v0.43.0", date: "2026-10-27 09:12:41", isCurrent: false },
    { id: "483dae4", tag: "v0.42.5", date: "2026-10-23 08:07:14", isCurrent: false },
    { id: "3f438ca", tag: "v0.42.4", date: "2026-10-22 07:31:22", isCurrent: false },
    { id: "edb3db0", tag: "v0.42.3", date: "2026-10-21 06:44:30", isCurrent: false },
    { id: "49634b4", tag: "v0.42.2", date: "2026-10-21 04:34:13", isCurrent: false },
    { id: "63be2f9", tag: "v0.42.1", date: "2026-10-19 06:58:57", isCurrent: false },
    { id: "dec5d94", tag: "v0.30.2", date: "2026-08-05 08:47:33", isCurrent: true },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[var(--bg-app)] text-[var(--text-main)] select-none transition-colors duration-200">
      {/* Top Sub-tabs */}
      <div className="h-12 border-b border-[var(--border-subtle)] flex items-center justify-between px-6 bg-[var(--bg-sidebar)] transition-colors duration-200">
        <div className="flex items-center gap-6 text-xs font-medium">
          <button
            onClick={() => setSubTab("core")}
            className={`flex items-center gap-1.5 py-3 border-b-2 transition-colors ${
              subTab === "core"
                ? "border-[var(--accent)] text-[var(--accent)] font-semibold"
                : "border-transparent text-[var(--text-sub)] hover:text-[var(--text-main)]"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            内核
          </button>
          <button
            onClick={() => setSubTab("extensions")}
            className={`flex items-center gap-1.5 py-3 border-b-2 transition-colors ${
              subTab === "extensions"
                ? "border-[var(--accent)] text-[var(--accent)] font-semibold"
                : "border-transparent text-[var(--text-sub)] hover:text-[var(--text-main)]"
            }`}
          >
            <Puzzle className="w-3.5 h-3.5" />
            扩展 ({customNodes.length})
          </button>
          <button
            onClick={() => setSubTab("install")}
            className={`flex items-center gap-1.5 py-3 border-b-2 transition-colors ${
              subTab === "install"
                ? "border-[var(--accent)] text-[var(--accent)] font-semibold"
                : "border-transparent text-[var(--text-sub)] hover:text-[var(--text-main)]"
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            安装新扩展
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              refreshGitInfo();
              refreshCustomNodes();
            }}
            className="px-3 py-1.5 rounded bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-main)] text-xs flex items-center gap-1.5 border border-[var(--border-subtle)] transition-colors shadow-sm"
          >
            <RefreshCw className="w-3 h-3 text-[var(--text-sub)]" />
            刷新列表
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {subTab === "core" && (
          <div className="flex flex-col gap-6 max-w-4xl">
            {/* Git Metadata Block */}
            <div className="p-4 rounded-lg bg-[var(--bg-card)] border border-[var(--border-card)] shadow-sm space-y-2 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-[var(--text-sub)] w-20">远端地址:</span>
                <span className="text-[var(--text-main)] truncate">
                  {gitInfo?.remote_url || "https://github.com/comfyanonymous/ComfyUI"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[var(--text-sub)] w-20">当前分支:</span>
                <span className="text-sky-500 font-bold">
                  {gitInfo?.branch || "master"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[var(--text-sub)] w-20">当前版本:</span>
                <span className="text-[var(--text-main)]">
                  {gitInfo?.commit_hash || "dec5d94"} ({gitInfo?.commit_date || "2026-08-05 08:47:33"})
                </span>
              </div>
            </div>

            {/* Stable vs Dev switch */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setChannel("stable")}
                className={`px-4 py-1.5 rounded text-xs font-semibold transition-colors ${
                  channel === "stable"
                    ? "bg-sky-500/10 text-sky-500 border border-sky-500/30"
                    : "text-[var(--text-sub)] hover:text-[var(--text-main)] bg-[var(--bg-card)] border border-[var(--border-card)]"
                }`}
              >
                稳定版
              </button>
              <button
                onClick={() => setChannel("dev")}
                className={`px-4 py-1.5 rounded text-xs font-semibold transition-colors ${
                  channel === "dev"
                    ? "bg-sky-500/10 text-sky-500 border border-sky-500/30"
                    : "text-[var(--text-sub)] hover:text-[var(--text-main)] bg-[var(--bg-card)] border border-[var(--border-card)]"
                }`}
              >
                开发版
              </button>
            </div>

            {/* Version List Table */}
            <div className="rounded-lg bg-[var(--bg-card)] border border-[var(--border-card)] shadow-sm overflow-hidden">
              <div className="grid grid-cols-12 px-4 py-2.5 border-b border-[var(--border-subtle)] text-[11px] font-semibold text-[var(--text-sub)]">
                <div className="col-span-2">版本 ID</div>
                <div className="col-span-4">更新内容</div>
                <div className="col-span-4">日期</div>
                <div className="col-span-2 text-right">状态</div>
              </div>
              <div className="divide-y divide-[var(--border-subtle)]">
                {coreVersions.map((v) => (
                  <div
                    key={v.id}
                    className="grid grid-cols-12 px-4 py-3 items-center text-xs hover:bg-[var(--hover-sidebar)] transition-colors"
                  >
                    <div className="col-span-2 font-mono text-sky-500 font-semibold">
                      {v.id}
                    </div>
                    <div className="col-span-4 text-[var(--text-main)] font-medium">
                      {v.tag}
                    </div>
                    <div className="col-span-4 text-[var(--text-sub)] font-mono text-[11px]">
                      {v.date}
                    </div>
                    <div className="col-span-2 text-right">
                      {v.isCurrent ? (
                        <span className="inline-flex items-center gap-1 text-emerald-500 font-semibold text-xs">
                          <Check className="w-3.5 h-3.5" />
                          当前
                        </span>
                      ) : (
                        <button
                          onClick={() => alert(`已选择切换至版本 ${v.tag}`)}
                          className="px-2.5 py-1 rounded bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-main)] text-xs border border-[var(--border-subtle)] transition-colors"
                        >
                          切换
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {subTab === "extensions" && (
          <div className="max-w-4xl space-y-3">
            <h2 className="text-sm font-bold text-[var(--text-main)]">
              已安装自定义节点 ({customNodes.length})
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {customNodes.map((node) => (
                <div
                  key={node.name}
                  className="p-3.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-card)] shadow-sm flex flex-col justify-between gap-2"
                >
                  <div className="text-xs font-semibold text-[var(--text-main)] truncate">
                    {node.name}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[var(--text-sub)] font-mono">
                    <span className="flex items-center gap-1 text-sky-500">
                      <GitBranch className="w-3 h-3" />
                      {node.branch || "main"}
                    </span>
                    <span>{node.commit || "HEAD"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {subTab === "install" && (
          <div className="max-w-4xl space-y-4">
            <h2 className="text-sm font-bold text-[var(--text-main)]">安装新扩展</h2>
            <div className="p-4 rounded-lg bg-[var(--bg-card)] border border-[var(--border-card)] space-y-3 shadow-sm">
              <div className="text-xs text-[var(--text-main)]">
                支持直接通过 Git 仓库链接克隆安装 ComfyUI 插件：
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://github.com/..."
                  className="flex-1 bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded px-3 py-2 text-xs font-mono text-[var(--text-main)] outline-none focus:border-sky-400"
                />
                <button
                  onClick={() => alert("正在通过 Git 安装插件节点...")}
                  className="px-4 py-2 rounded bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-xs"
                >
                  安装
                </button>
              </div>
              <div className="text-[11px] text-[var(--text-sub)]">
                也推荐在 Web 界面中直接使用 ComfyUI-Manager 进行可视化扩展管理。
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
