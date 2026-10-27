import React, { useState } from "react";
import { useLauncherStore } from "../store";
import {
  FolderGit2,
  RefreshCw,
  GitBranch,
  GitCommit,
  Search,
  CheckCircle,
} from "lucide-react";

export const CustomNodesView: React.FC = () => {
  const { customNodes, refreshCustomNodes } = useLauncherStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshCustomNodes();
    setIsRefreshing(false);
  };

  const filteredNodes = customNodes.filter((node) =>
    node.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full select-none">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">
              已安装扩展节点 ({customNodes.length})
            </h2>
            <p className="text-xs text-slate-400">
              管理 ComfyUI/custom_nodes 目录下的第三方插件与版本状态
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span>刷新列表</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索扩展节点名称..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Nodes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredNodes.map((node) => (
            <div
              key={node.name}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <FolderGit2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-100">
                      {node.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 truncate max-w-[200px]">
                      {node.path}
                    </p>
                  </div>
                </div>

                {node.has_git && (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-mono">
                    <CheckCircle className="w-3 h-3" /> Git 托管
                  </span>
                )}
              </div>

              {node.has_git && (
                <div className="flex items-center gap-3 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400 font-mono">
                  {node.branch && (
                    <span className="flex items-center gap-1">
                      <GitBranch className="w-3 h-3 text-slate-500" />
                      {node.branch}
                    </span>
                  )}
                  {node.commit && (
                    <span className="flex items-center gap-1">
                      <GitCommit className="w-3 h-3 text-slate-500" />
                      {node.commit}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
