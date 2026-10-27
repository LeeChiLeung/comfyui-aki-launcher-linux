import React, { useState } from "react";
import { useLauncherStore } from "../store";
import { RefreshCw, Search, FileBox } from "lucide-react";

export const ModelsView: React.FC = () => {
  const { models, refreshModels } = useLauncherStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshModels();
    setIsRefreshing(false);
  };

  const categories = ["all", ...Array.from(new Set(models.map((m) => m.category)))];

  const filteredModels = models.filter((m) => {
    const matchesSearch = m.file_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatSize = (mb: number) => {
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(2)} GB`;
    }
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full select-none">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">
              模型库管理 ({models.length})
            </h2>
            <p className="text-xs text-slate-400">
              扫描 ComfyUI/models 目录下的权重模型、LoRA 与 VAE 文件
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
            <span>刷新模型</span>
          </button>
        </div>

        {/* Toolbar: Category Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索模型文件名..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-900/80 hover:bg-slate-800 text-slate-400"
                }`}
              >
                {cat === "all" ? "全部" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Models List */}
        {filteredModels.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            暂未发现匹配的模型文件
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60 rounded-2xl bg-slate-900/50 border border-slate-800/80 overflow-hidden">
            {filteredModels.map((m) => (
              <div
                key={m.relative_path}
                className="flex items-center justify-between p-3.5 hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700/60 flex items-center justify-center text-indigo-400">
                    <FileBox className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-slate-200">
                      {m.file_name}
                    </h4>
                    <p className="text-[11px] text-slate-500">{m.relative_path}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700/50">
                    {m.category}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {formatSize(m.size_mb)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
