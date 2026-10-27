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
  X,
  AlertCircle,
  Trash2,
  ArrowUpCircle,
} from "lucide-react";
import { useLauncherStore } from "../store";
import { AvailableExtension, CustomNodeInfo } from "../types";

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
    toggleCustomNode,
    uninstallCustomNode,
    updateCustomNode,
    updateAllCustomNodes,
    switchNodeVersion,
    openUrl,
  } = useLauncherStore();

  const [subTab, setSubTab] = useState<"core" | "extensions" | "install">("core");
  const [channel, setChannel] = useState<"stable" | "dev">("stable");

  // Installed extensions state
  const [installedSearchQuery, setInstalledSearchQuery] = useState("");
  const [isUpdatingAll, setIsUpdatingAll] = useState(false);
  const [updatingNodeName, setUpdatingNodeName] = useState<string | null>(null);
  const [togglingNodeName, setTogglingNodeName] = useState<string | null>(null);

  // Switch version modal state
  const [switchModalNode, setSwitchModalNode] = useState<CustomNodeInfo | null>(null);
  const [targetVersion, setTargetVersion] = useState("");
  const [isSwitching, setIsSwitching] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);

  // Uninstall confirm modal state
  const [uninstallModalNode, setUninstallModalNode] = useState<CustomNodeInfo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Install tab state
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(60);
  const [installingId, setInstallingId] = useState<string | null>(null);

  // Toast feedback state
  const [toast, setToast] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    if (subTab === "install" && availableExtensions.length === 0) {
      refreshAvailableExtensions(false);
    }
  }, [subTab, availableExtensions.length, refreshAvailableExtensions]);

  // Filter installed nodes
  const filteredInstalledNodes = useMemo(() => {
    if (!installedSearchQuery.trim()) return customNodes;
    const q = installedSearchQuery.toLowerCase().trim();
    return customNodes.filter(
      (node) =>
        node.name.toLowerCase().includes(q) ||
        (node.remote_url && node.remote_url.toLowerCase().includes(q)) ||
        (node.branch && node.branch.toLowerCase().includes(q)) ||
        (node.commit && node.commit.toLowerCase().includes(q))
    );
  }, [customNodes, installedSearchQuery]);

  // Filter available extensions to install
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

  const handleInstall = async (ext: AvailableExtension) => {
    const targetUrl = ext.reference || (ext.files && ext.files[0]);
    if (!targetUrl) return;
    setInstallingId(ext.title);
    try {
      await installExtension(targetUrl, ext.title);
      setToast({
        type: "success",
        message: `扩展 "${ext.title}" 安装成功！`,
      });
    } catch (e) {
      setToast({
        type: "error",
        message: `安装失败: ${e}`,
      });
    } finally {
      setInstallingId(null);
    }
  };

  const handleToggleNode = async (node: CustomNodeInfo, enable: boolean) => {
    setTogglingNodeName(node.name);
    try {
      await toggleCustomNode(node.path, enable);
      setToast({
        type: "success",
        message: `插件 "${node.name}" 已${enable ? "启用" : "禁用"}`,
      });
    } catch (err) {
      setToast({
        type: "error",
        message: `操作失败: ${err}`,
      });
    } finally {
      setTogglingNodeName(null);
    }
  };

  const handleUpdateSingleNode = async (node: CustomNodeInfo) => {
    if (!node.has_git) {
      setToast({
        type: "info",
        message: `插件 "${node.name}" 不是 Git 仓库，无法直接更新`,
      });
      return;
    }
    setUpdatingNodeName(node.name);
    try {
      const res = await updateCustomNode(node.path);
      const isUpToDate = res.includes("Already up to date") || res.includes("已经是最新");
      setToast({
        type: "success",
        message: isUpToDate
          ? `${node.name} 已经是最新版本`
          : `${node.name} 更新成功！`,
      });
    } catch (err) {
      setToast({
        type: "error",
        message: `${node.name} 更新失败: ${err}`,
      });
    } finally {
      setUpdatingNodeName(null);
    }
  };

  const handleUpdateAll = async () => {
    setIsUpdatingAll(true);
    try {
      const res = await updateAllCustomNodes();
      if (res.length > 0) {
        setToast({
          type: "success",
          message: `一键更新完成！共更新了 ${res.length} 个插件:\n${res.join("\n")}`,
        });
      } else {
        setToast({
          type: "success",
          message: "所有插件均已是最新版本！",
        });
      }
    } catch (err) {
      setToast({
        type: "error",
        message: `一键更新失败: ${err}`,
      });
    } finally {
      setIsUpdatingAll(false);
    }
  };

  const handleConfirmSwitch = async () => {
    if (!switchModalNode || !targetVersion.trim()) return;
    setIsSwitching(true);
    setSwitchError(null);
    try {
      const msg = await switchNodeVersion(switchModalNode.path, targetVersion.trim());
      setToast({
        type: "success",
        message: msg || `成功切换至 ${targetVersion.trim()}`,
      });
      setSwitchModalNode(null);
    } catch (err: any) {
      setSwitchError(String(err));
    } finally {
      setIsSwitching(false);
    }
  };

  const handleConfirmUninstall = async () => {
    if (!uninstallModalNode) return;
    setIsDeleting(true);
    try {
      await uninstallCustomNode(uninstallModalNode.path);
      setToast({
        type: "success",
        message: `已成功卸载插件 ${uninstallModalNode.name}`,
      });
      setUninstallModalNode(null);
    } catch (err) {
      setToast({
        type: "error",
        message: `卸载失败: ${err}`,
      });
    } finally {
      setIsDeleting(false);
    }
  };

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
    <div className="flex-1 flex flex-col overflow-hidden bg-[var(--bg-app)] text-[var(--text-main)] select-none transition-colors duration-200 relative">
      {/* Top Sub-tabs */}
      <div className="h-12 border-b border-[var(--border-subtle)] flex items-center justify-between px-6 bg-[var(--bg-sidebar)] transition-colors duration-200 shrink-0">
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

        {/* Top Right Action Buttons (1:1 还原官方原版布局: 刷新列表 | 一键更新) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              refreshGitInfo();
              refreshCustomNodes();
              if (subTab === "install") {
                refreshAvailableExtensions(true);
              }
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

          {subTab === "extensions" && (
            <button
              onClick={handleUpdateAll}
              disabled={isUpdatingAll}
              className="px-3 py-1.5 rounded bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-main)] text-xs flex items-center gap-1.5 border border-[var(--border-subtle)] transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isUpdatingAll ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-500" />
              ) : (
                <ArrowUpCircle className="w-3.5 h-3.5 text-sky-500" />
              )}
              一键更新
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
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
        {/* SUBTAB 2: 已安装扩展管理 (1:1 还原官方截图表格与管理体系) */}
        {/* ========================================================= */}
        {subTab === "extensions" && (
          <div className="flex-1 flex flex-col w-full">
            {/* Search Input Bar (1:1 还原: 搜索已安装插件...) */}
            <div className="relative mb-3 shrink-0">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="搜索已安装插件..."
                value={installedSearchQuery}
                onChange={(e) => setInstalledSearchQuery(e.target.value)}
                className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded pl-9 pr-4 py-2 text-xs text-[var(--text-main)] outline-none focus:border-sky-400 placeholder-[var(--text-muted)] transition-colors shadow-xs"
              />
            </div>

            {/* Table Container */}
            <div className="flex-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs overflow-hidden flex flex-col">
              {/* Header Columns: 启用 | 插件名 | 远端地址 | 当前分支 | 版本 ID | 更新日期 | 操作 */}
              <div className="grid grid-cols-[50px_minmax(150px,1.4fr)_minmax(180px,1.8fr)_90px_90px_160px_170px] px-4 py-2.5 border-b border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-sub)] bg-[var(--bg-sidebar)] items-center gap-2 shrink-0">
                <div className="text-center">启用</div>
                <div>插件名</div>
                <div>远端地址</div>
                <div>当前分支</div>
                <div>版本 ID</div>
                <div>更新日期</div>
                <div className="text-right"></div>
              </div>

              {/* Rows */}
              <div className="flex-1 overflow-y-auto divide-y divide-[var(--border-subtle)]">
                {filteredInstalledNodes.length === 0 ? (
                  <div className="p-12 text-center text-xs text-[var(--text-sub)]">
                    {installedSearchQuery ? "未找到匹配的已安装插件" : "暂无已安装的插件节点"}
                  </div>
                ) : (
                  filteredInstalledNodes.map((node) => {
                    const isToggling = togglingNodeName === node.name;
                    const isUpdating = updatingNodeName === node.name;

                    return (
                      <div
                        key={node.name}
                        className={`grid grid-cols-[50px_minmax(150px,1.4fr)_minmax(180px,1.8fr)_90px_90px_160px_170px] px-4 py-2.5 items-center text-xs hover:bg-[var(--bg-card-hover)] transition-colors gap-2 ${
                          !node.enabled ? "opacity-60 bg-[var(--bg-sidebar)]/30" : ""
                        }`}
                      >
                        {/* 启用 (复选框) */}
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={node.enabled}
                            disabled={isToggling}
                            onChange={(e) => handleToggleNode(node, e.target.checked)}
                            className="w-4 h-4 rounded border-[var(--border-subtle)] text-sky-500 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-sky-500"
                          />
                        </div>

                        {/* 插件名 (浅蓝/高亮，点击在新标签页打开远端仓库) */}
                        <div className="truncate pr-1">
                          {node.remote_url ? (
                            <button
                              onClick={() => openUrl(node.remote_url!)}
                              title={node.remote_url}
                              className="text-sky-500 hover:text-sky-400 font-medium text-left truncate block max-w-full cursor-pointer hover:underline"
                            >
                              {node.name}
                            </button>
                          ) : (
                            <span className="font-medium text-[var(--text-main)] truncate block">
                              {node.name}
                            </span>
                          )}
                        </div>

                        {/* 远端地址 */}
                        <div className="truncate text-xs text-[var(--text-sub)] font-mono pr-1">
                          {node.remote_url ? (
                            <span title={node.remote_url} className="truncate block">
                              {node.remote_url}
                            </span>
                          ) : (
                            <span className="text-[var(--text-muted)]">-</span>
                          )}
                        </div>

                        {/* 当前分支 */}
                        <div className="truncate text-xs font-mono text-[var(--text-sub)] pr-1">
                          {node.branch || "-"}
                        </div>

                        {/* 版本 ID (官方原版为琥珀金色高亮) */}
                        <div className="truncate font-mono text-xs text-amber-500 dark:text-amber-400 font-semibold pr-1">
                          {node.commit || "-"}
                        </div>

                        {/* 更新日期 (官方原版为琥珀金色高亮) */}
                        <div className="truncate font-mono text-[11px] text-amber-500 dark:text-amber-400 pr-1">
                          {node.commit_date || "-"}
                        </div>

                        {/* 操作区 (最新 / 切换版本 / 卸载) */}
                        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                          {/* 最新 */}
                          <button
                            onClick={() => handleUpdateSingleNode(node)}
                            disabled={isUpdating || !node.has_git}
                            title={node.has_git ? "拉取最新代码" : "非 Git 插件"}
                            className="px-2.5 py-1 rounded bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-[11px] text-[var(--text-sub)] hover:text-[var(--text-main)] transition-colors cursor-pointer disabled:opacity-40"
                          >
                            {isUpdating ? "更新中..." : "最新"}
                          </button>

                          {/* 切换版本 */}
                          <button
                            onClick={() => {
                              setSwitchModalNode(node);
                              setTargetVersion(node.commit || node.branch || "");
                              setSwitchError(null);
                            }}
                            disabled={!node.has_git}
                            title={node.has_git ? "切换分支或提交版本" : "非 Git 插件"}
                            className="px-2.5 py-1 rounded bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-[11px] text-[var(--text-main)] transition-colors cursor-pointer disabled:opacity-40"
                          >
                            切换版本
                          </button>

                          {/* 卸载 */}
                          <button
                            onClick={() => setUninstallModalNode(node)}
                            title="卸载插件并删除文件"
                            className="px-2.5 py-1 rounded bg-[var(--bg-card)] hover:bg-rose-500/10 hover:border-rose-500/40 hover:text-rose-500 border border-[var(--border-subtle)] text-[11px] text-[var(--text-sub)] transition-colors cursor-pointer"
                          >
                            卸载
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SUBTAB 3: 安装新扩展 (1:1 还原官方截图表格与搜索体系) */}
        {/* ========================================================= */}
        {subTab === "install" && (
          <div className="flex-1 flex flex-col w-full">
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
              <div className="grid grid-cols-12 px-4 py-2.5 border-b border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-sub)] bg-[var(--bg-sidebar)] shrink-0">
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

      {/* ========================================================= */}
      {/* 模态框: 切换插件版本 (Switch Version Modal) */}
      {/* ========================================================= */}
      {switchModalNode && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-sky-500" />
                <h3 className="text-sm font-bold text-[var(--text-main)]">
                  切换插件版本
                </h3>
              </div>
              <button
                onClick={() => setSwitchModalNode(null)}
                className="text-[var(--text-muted)] hover:text-[var(--text-main)] p-1 rounded transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-lg bg-[var(--bg-sidebar)] border border-[var(--border-subtle)] space-y-1.5 font-mono text-[11px]">
              <div className="flex items-center gap-2">
                <span className="text-[var(--text-sub)] w-18">插件名:</span>
                <span className="text-[var(--text-main)] font-semibold truncate">
                  {switchModalNode.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[var(--text-sub)] w-18">当前分支:</span>
                <span className="text-sky-500 font-semibold">
                  {switchModalNode.branch || "main"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[var(--text-sub)] w-18">当前提交:</span>
                <span className="text-amber-500 dark:text-amber-400 font-semibold">
                  {switchModalNode.commit || "HEAD"}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[var(--text-main)] font-semibold">
                目标分支 / Tag / Commit Hash:
              </label>
              <input
                type="text"
                autoFocus
                value={targetVersion}
                onChange={(e) => setTargetVersion(e.target.value)}
                placeholder="例如: master, main, v1.0, 6ea2651"
                className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded px-3 py-2 text-xs font-mono text-[var(--text-main)] outline-none focus:border-sky-500 transition-colors shadow-xs"
              />
              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                提示：执行 Git Checkout 切换目标分支或特定提交，请确保工作区无未保存的本地修改。
              </p>
            </div>

            {switchError && (
              <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="break-all">{switchError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
              <button
                onClick={() => setSwitchModalNode(null)}
                disabled={isSwitching}
                className="px-4 py-1.5 rounded bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-[var(--text-main)] text-xs transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleConfirmSwitch}
                disabled={isSwitching || !targetVersion.trim()}
                className="px-4 py-1.5 rounded bg-sky-500 hover:bg-sky-600 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSwitching && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {isSwitching ? "切换中..." : "确定切换"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 模态框: 确认卸载插件 (Uninstall Confirm Modal) */}
      {/* ========================================================= */}
      {uninstallModalNode && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl shadow-2xl max-w-sm w-full p-6 space-y-4 text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2.5 text-rose-500 font-bold text-sm">
              <Trash2 className="w-5 h-5 shrink-0" />
              <span>卸载扩展插件</span>
            </div>

            <div className="space-y-2 text-[var(--text-sub)] leading-relaxed">
              <p>
                确定要卸载插件{" "}
                <span className="font-semibold text-[var(--text-main)]">
                  {uninstallModalNode.name}
                </span>{" "}
                吗？
              </p>
              <p className="text-[11px] text-[var(--text-muted)] bg-[var(--bg-sidebar)] p-2 rounded border border-[var(--border-subtle)] break-all font-mono">
                {uninstallModalNode.path}
              </p>
              <p className="text-rose-500 text-[11px]">
                注意：此操作将永久删除该插件目录及其全部内容，不可恢复！
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
              <button
                onClick={() => setUninstallModalNode(null)}
                disabled={isDeleting}
                className="px-4 py-1.5 rounded bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-[var(--text-main)] text-xs transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleConfirmUninstall}
                disabled={isDeleting}
                className="px-4 py-1.5 rounded bg-rose-500 hover:bg-rose-600 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {isDeleting ? "正在删除..." : "确认卸载"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 浮动提示通知 (Toast Notification) */}
      {/* ========================================================= */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md animate-in slide-in-from-bottom-5 duration-200">
          <div
            className={`p-3.5 rounded-lg border shadow-xl flex items-start gap-2.5 text-xs ${
              toast.type === "success"
                ? "bg-[var(--bg-card)] border-emerald-500/40 text-[var(--text-main)]"
                : toast.type === "error"
                ? "bg-[var(--bg-card)] border-rose-500/40 text-[var(--text-main)]"
                : "bg-[var(--bg-card)] border-sky-500/40 text-[var(--text-main)]"
            }`}
          >
            {toast.type === "success" && (
              <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            )}
            {toast.type === "error" && (
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            )}
            {toast.type === "info" && (
              <AlertCircle className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 whitespace-pre-wrap break-words leading-relaxed">
              {toast.message}
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-[var(--text-muted)] hover:text-[var(--text-main)] p-0.5 -mr-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
