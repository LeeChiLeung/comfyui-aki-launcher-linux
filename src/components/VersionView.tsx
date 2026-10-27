import React, { useState, useEffect, useMemo } from "react";
import {
  Clock,
  Puzzle,
  Download,
  RefreshCw,
  GitBranch,
  Check,
  Search,
  Loader2,
} from "lucide-react";
import { useLauncherStore } from "../store";
import { AvailableExtension } from "../types";

export const VersionView: React.FC = () => {
  const {
    gitInfo,
    customNodes,
    availableExtensions,
    isLoadingExtensions,
    refreshCustomNodes,
    refreshGitInfo,
    refreshAvailableExtensions,
    installExtension,
    openUrl,
  } = useLauncherStore();

  const [subTab, setSubTab] = useState<"core" | "extensions" | "install">("core");
  const [channel, setChannel] = useState<"stable" | "dev">("stable");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(60);
  const [installingId, setInstallingId] = useState<string | null>(null);

  useEffect(() => {
    if (subTab === "install" && availableExtensions.length === 0) {
      refreshAvailableExtensions(false);
    }
  }, [subTab, availableExtensions.length, refreshAvailableExtensions]);

  const handleInstall = async (ext: AvailableExtension) => {
    const targetUrl = ext.reference || (ext.files && ext.files[0]);
    if (!targetUrl) return;
    setInstallingId(ext.title);
    try {
      await installExtension(targetUrl, ext.title);
    } catch (e) {
      alert(`安装失败: ${e}`);
    } finally {
      setInstallingId(null);
    }
  };

  const filteredExtensions = useMemo(() => {
    if (!searchQuery.trim()) return availableExtensions;
    const q = searchQuery.toLowerCase().trim();
    return availableExtensions.filter(
      (ext) =>
        ext.title.toLowerCase().includes(q) ||
        (ext.description && ext.description.toLowerCase().includes(q)) ||
        (ext.author && ext.author.toLowerCase().includes(q)) ||
        (ext.id && ext.id.toLowerCase().includes(q))
    );
  }, [availableExtensions, searchQuery]);

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
            className={`flex items-center gap-1.5 py-3 border-b-2 transition-colors cursor-pointer ${
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
            className={`flex items-center gap-1.5 py-3 border-b-2 transition-colors cursor-pointer ${
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
            className={`flex items-center gap-1.5 py-3 border-b-2 transition-colors cursor-pointer ${
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
              refreshAvailableExtensions(true);
            }}
            className="px-3 py-1.5 rounded bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-main)] text-xs flex items-center gap-1.5 border border-[var(--border-subtle)] transition-colors shadow-xs cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-[var(--text-sub)] ${
                isLoadingExtensions ? "animate-spin" : ""
              }`}
            />
            刷新列表
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col">
        {/* ========================================================= */}
        {/* SUBTAB 1: 内核版本管理 */}
        {/* ========================================================= */}
        {subTab === "core" && (
          <div className="flex flex-col gap-6 max-w-4xl">
            {/* Git Metadata Block */}
            <div className="p-4 rounded-lg bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs space-y-2 text-xs font-mono">
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
                className={`px-4 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                  channel === "stable"
                    ? "bg-sky-500/10 text-sky-500 border border-sky-500/30"
                    : "text-[var(--text-sub)] hover:text-[var(--text-main)] bg-[var(--bg-card)] border border-[var(--border-card)]"
                }`}
              >
                稳定版
              </button>
              <button
                onClick={() => setChannel("dev")}
                className={`px-4 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                  channel === "dev"
                    ? "bg-sky-500/10 text-sky-500 border border-sky-500/30"
                    : "text-[var(--text-sub)] hover:text-[var(--text-main)] bg-[var(--bg-card)] border border-[var(--border-card)]"
                }`}
              >
                开发版
              </button>
            </div>

            {/* Version List Table */}
            <div className="rounded-lg bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs overflow-hidden">
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
                          className="px-2.5 py-1 rounded bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-main)] text-xs border border-[var(--border-subtle)] transition-colors cursor-pointer"
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

        {/* ========================================================= */}
        {/* SUBTAB 2: 已安装扩展管理 */}
        {/* ========================================================= */}
        {subTab === "extensions" && (
          <div className="max-w-4xl space-y-3">
            <h2 className="text-xs font-bold text-[var(--text-main)] tracking-wider">
              已安装自定义节点 ({customNodes.length})
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {customNodes.map((node) => (
                <div
                  key={node.name}
                  className="p-3.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs flex flex-col justify-between gap-2"
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

        {/* ========================================================= */}
        {/* SUBTAB 3: 安装新扩展 (1:1 还原官方截图表格与搜索体系) */}
        {/* ========================================================= */}
        {subTab === "install" && (
          <div className="flex-1 flex flex-col max-w-5xl w-full">
            {/* Search Input Bar */}
            <div className="relative mb-3 shrink-0">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="搜索新插件..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setVisibleCount(60);
                }}
                className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded pl-9 pr-4 py-2 text-xs text-[var(--text-main)] outline-none focus:border-sky-400 placeholder-[var(--text-muted)] transition-colors shadow-xs"
              />
            </div>

            {/* Table Container */}
            <div className="flex-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs overflow-hidden flex flex-col">
              {/* Header */}
              <div className="grid grid-cols-12 px-4 py-2 border-b border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-sub)] bg-[var(--bg-sidebar)]">
                <div className="col-span-3">插件名</div>
                <div className="col-span-8">简介</div>
                <div className="col-span-1 text-right"></div>
              </div>

              {/* Rows */}
              <div className="flex-1 overflow-y-auto divide-y divide-[var(--border-subtle)]">
                {isLoadingExtensions && availableExtensions.length === 0 ? (
                  <div className="p-12 text-center text-xs text-[var(--text-sub)] flex flex-col items-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-sky-400" />
                    <span>正在连接官方扩展仓库索引获取插件列表...</span>
                  </div>
                ) : filteredExtensions.length === 0 ? (
                  <div className="p-12 text-center text-xs text-[var(--text-sub)]">
                    未找到匹配的插件节点
                  </div>
                ) : (
                  filteredExtensions.slice(0, visibleCount).map((ext) => {
                    const targetUrl = ext.reference || (ext.files && ext.files[0]);
                    const isInstalling = installingId === ext.title;

                    return (
                      <div
                        key={ext.title}
                        className="grid grid-cols-12 px-4 py-3 items-center text-xs hover:bg-[var(--bg-card-hover)] transition-colors"
                      >
                        {/* 插件名 (浅蓝高亮，支持点击打开官方仓库) */}
                        <div className="col-span-3 pr-2">
                          <button
                            onClick={() => targetUrl && openUrl(targetUrl)}
                            title={targetUrl || ext.title}
                            className="text-sky-400 hover:text-sky-300 font-medium text-left truncate block max-w-full cursor-pointer hover:underline"
                          >
                            {ext.title}
                          </button>
                        </div>

                        {/* 简介 */}
                        <div className="col-span-8 text-[var(--text-sub)] pr-4 text-xs line-clamp-2 leading-relaxed">
                          {ext.description || "暂无简介"}
                        </div>

                        {/* 操作按钮 (已装 vs 安装) */}
                        <div className="col-span-1 text-right">
                          {ext.installed ? (
                            <button
                              disabled
                              className="px-3.5 py-1 rounded bg-zinc-800 text-zinc-500 border border-zinc-700/60 text-xs font-normal opacity-70 cursor-not-allowed inline-block"
                            >
                              已装
                            </button>
                          ) : (
                            <button
                              onClick={() => handleInstall(ext)}
                              disabled={isInstalling || !targetUrl}
                              className="px-3.5 py-1 rounded bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-[var(--text-main)] text-xs font-normal cursor-pointer transition-colors shadow-xs hover:border-sky-400"
                            >
                              {isInstalling ? "安装中..." : "安装"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Load More Button */}
                {filteredExtensions.length > visibleCount && (
                  <div className="p-3 text-center border-t border-[var(--border-subtle)]">
                    <button
                      onClick={() => setVisibleCount((prev) => prev + 60)}
                      className="px-4 py-1.5 rounded bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)] cursor-pointer shadow-xs"
                    >
                      加载更多插件 (已显示 {Math.min(visibleCount, filteredExtensions.length)} / 共 {filteredExtensions.length} 个)
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
