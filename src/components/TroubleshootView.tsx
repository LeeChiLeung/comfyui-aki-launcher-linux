import React, { useEffect } from "react";
import {
  FileText,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { useLauncherStore } from "../store";

export const TroubleshootView: React.FC = () => {
  const { diagnostics, runDiagnostics } = useLauncherStore();

  useEffect(() => {
    if (diagnostics.length === 0) {
      runDiagnostics();
    }
  }, []);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[var(--bg-app)] text-[var(--text-main)] select-none transition-colors duration-200">
      {/* Top Header */}
      <div className="h-12 border-b border-[var(--border-subtle)] flex items-center justify-between px-6 bg-[var(--bg-sidebar)] transition-colors duration-200">
        <h2 className="text-xs font-semibold text-[var(--text-main)]">
          系统环境与硬件诊断
        </h2>

        <div className="flex items-center gap-3">
          <button
            onClick={() => alert("诊断报告已生成至控制台日志")}
            className="px-3 py-1.5 rounded bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-main)] text-xs flex items-center gap-1.5 border border-[var(--border-subtle)] transition-colors shadow-sm"
          >
            <FileText className="w-3.5 h-3.5 text-[var(--text-sub)]" />
            生成诊断包
          </button>
          <button
            onClick={runDiagnostics}
            className="px-3.5 py-1.5 rounded bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Search className="w-3.5 h-3.5" />
            开始扫描
          </button>
        </div>
      </div>

      {/* Diagnostics Table */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl rounded-lg bg-[var(--bg-card)] border border-[var(--border-card)] shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 px-4 py-2.5 border-b border-[var(--border-subtle)] text-[11px] font-semibold text-[var(--text-sub)]">
            <div className="col-span-3">诊断项目</div>
            <div className="col-span-6">检测结果与描述</div>
            <div className="col-span-3 text-right">状态</div>
          </div>
          <div className="divide-y divide-[var(--border-subtle)]">
            {diagnostics.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--text-muted)]">
                正在执行环境完整性扫描...
              </div>
            ) : (
              diagnostics.map((item) => (
                <div
                  key={item.name}
                  className="grid grid-cols-12 px-4 py-3.5 items-center text-xs hover:bg-[var(--hover-sidebar)] transition-colors"
                >
                  <div className="col-span-3 font-semibold text-[var(--text-main)]">
                    {item.name}
                  </div>
                  <div className="col-span-6 text-[var(--text-sub)]">
                    <div>{item.description}</div>
                    {item.detail && (
                      <div className="text-[11px] font-mono text-[var(--text-muted)] truncate mt-0.5">
                        {item.detail}
                      </div>
                    )}
                  </div>
                  <div className="col-span-3 flex items-center justify-end gap-1.5">
                    {item.status === "ok" && (
                      <span className="inline-flex items-center gap-1 text-emerald-500 font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        正常
                      </span>
                    )}
                    {item.status === "warning" && (
                      <span className="inline-flex items-center gap-1 text-amber-500 font-medium">
                        <AlertTriangle className="w-4 h-4" />
                        建议配置
                      </span>
                    )}
                    {item.status === "error" && (
                      <span className="inline-flex items-center gap-1 text-rose-500 font-medium">
                        <XCircle className="w-4 h-4" />
                        异常
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
