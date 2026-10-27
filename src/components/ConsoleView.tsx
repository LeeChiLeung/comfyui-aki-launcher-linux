import React, { useEffect, useRef } from "react";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import {
  Play,
  Square,
  FileText,
  Trash2,
  Copy,
  ExternalLink,
} from "lucide-react";
import { useLauncherStore } from "../store";

export const ConsoleView: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermInstance = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  const {
    status,
    logs,
    clearLogs,
    startComfyUI,
    stopComfyUI,
    isActionLoading,
    openUrl,
    setActiveTab,
  } = useLauncherStore();

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new XTerm({
      cursorBlink: true,
      fontSize: 13,
      fontFamily: "'Cascadia Mono', 'JetBrains Mono', 'Fira Code', monospace",
      theme: {
        background: "#141416",
        foreground: "#f4f4f5",
        cursor: "#38bdf8",
        selectionBackground: "rgba(56, 189, 248, 0.3)",
      },
      convertEol: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    term.open(terminalRef.current);
    fitAddon.fit();

    xtermInstance.current = term;
    fitAddonRef.current = fitAddon;

    term.writeln("\x1b[36m[绘世 Linux 原生启动器] 控制台已就绪。\x1b[0m");

    const handleResize = () => {
      fitAddon.fit();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      term.dispose();
    };
  }, []);

  const renderedLogsCount = useRef(0);

  useEffect(() => {
    if (!xtermInstance.current) return;
    const term = xtermInstance.current;

    if (logs.length < renderedLogsCount.current) {
      term.clear();
      renderedLogsCount.current = 0;
    }

    const newLogs = logs.slice(renderedLogsCount.current);
    for (const log of newLogs) {
      const prefix = `\x1b[90m[${log.timestamp}]\x1b[0m `;
      term.writeln(prefix + log.text);
    }
    renderedLogsCount.current = logs.length;
  }, [logs]);

  const handleCopyLogs = () => {
    const text = logs.map((l) => `[${l.timestamp}] ${l.text}`).join("\n");
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#141416] select-none">
      {/* Top Header Bar */}
      <div className="h-12 border-b border-[var(--border-subtle)] flex items-center justify-between px-6 bg-[var(--bg-sidebar)] transition-colors duration-200">
        {/* Status indicator */}
        <div className="flex items-center gap-3">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              status.is_running
                ? "bg-emerald-400 animate-pulse"
                : "bg-zinc-500"
            }`}
          />
          <span className="text-xs font-semibold text-[var(--text-main)]">
            {status.is_running
              ? `运行中 (PID: ${status.pid}, 端口: ${status.port})`
              : "未运行"}
          </span>
          {status.is_running && status.url && (
            <button
              onClick={() => openUrl(status.url!)}
              className="text-xs text-sky-500 hover:text-sky-400 flex items-center gap-1 font-mono transition-colors ml-2"
            >
              <ExternalLink className="w-3 h-3" />
              {status.url}
            </button>
          )}
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab("troubleshoot")}
            className="px-3 py-1.5 rounded bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-main)] text-xs flex items-center gap-1.5 border border-[var(--border-subtle)] transition-colors shadow-sm"
          >
            <FileText className="w-3.5 h-3.5 text-[var(--text-sub)]" />
            生成诊断包
          </button>

          <button
            onClick={handleCopyLogs}
            className="px-2.5 py-1.5 rounded bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-main)] text-xs flex items-center gap-1 border border-[var(--border-subtle)] transition-colors shadow-sm"
            title="复制全部日志"
          >
            <Copy className="w-3.5 h-3.5 text-[var(--text-sub)]" />
          </button>

          <button
            onClick={clearLogs}
            className="px-2.5 py-1.5 rounded bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-main)] text-xs flex items-center gap-1 border border-[var(--border-subtle)] transition-colors shadow-sm"
            title="清空控制台"
          >
            <Trash2 className="w-3.5 h-3.5 text-[var(--text-sub)]" />
          </button>

          {status.is_running && (
            <button
              onClick={stopComfyUI}
              disabled={isActionLoading}
              className="px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Square className="w-3 h-3 fill-current" />
              终止进程
            </button>
          )}

          {!status.is_running && (
            <button
              onClick={startComfyUI}
              disabled={isActionLoading}
              className="px-3.5 py-1.5 rounded bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Play className="w-3 h-3 fill-current" />
              一键启动
            </button>
          )}
        </div>
      </div>

      {/* Terminal View */}
      <div className="flex-1 p-3 overflow-hidden">
        <div
          ref={terminalRef}
          className="w-full h-full rounded-lg overflow-hidden border border-white/5"
        />
      </div>
    </div>
  );
};
