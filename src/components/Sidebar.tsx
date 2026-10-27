import React from "react";
import {
  Play,
  Sliders,
  FlaskConical,
  History,
  Briefcase,
  MessageCircle,
  Lightbulb,
  Terminal,
  Settings,
} from "lucide-react";
import { useLauncherStore } from "../store";
import { NavigationTab } from "../types";

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, openUrl, theme, toggleTheme } = useLauncherStore();
  const isDark = theme === "dark";

  const topItems: { id: NavigationTab; label: string; icon: React.ReactNode }[] = [
    {
      id: "home",
      label: "一键启动",
      icon: <Play className="w-5 h-5 fill-current" />,
    },
    {
      id: "advanced",
      label: "高级选项",
      icon: <Sliders className="w-5 h-5" />,
    },
    {
      id: "troubleshoot",
      label: "疑难解答",
      icon: <FlaskConical className="w-5 h-5" />,
    },
    {
      id: "versions",
      label: "版本管理",
      icon: <History className="w-5 h-5" />,
    },
    {
      id: "tools",
      label: "小工具",
      icon: <Briefcase className="w-5 h-5" />,
    },
  ];

  const bottomItems = [
    {
      id: "community",
      label: "交流群",
      icon: <MessageCircle className="w-5 h-5" />,
      title: "加入秋叶交流频道",
      onClick: () => openUrl("https://space.bilibili.com/12566101"),
    },
    {
      id: "theme",
      label: "灯泡",
      icon: (
        <Lightbulb
          className={`w-5 h-5 transition-all ${
            isDark
              ? "text-zinc-400 group-hover:text-amber-300"
              : "text-amber-500 fill-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
          }`}
        />
      ),
      title: isDark ? "切换为浅色模式" : "切换为深色模式",
      onClick: toggleTheme,
    },
    {
      id: "console" as NavigationTab,
      label: "控制台",
      icon: <Terminal className="w-5 h-5" />,
      title: "查看实时日志与终端",
    },
    {
      id: "settings" as NavigationTab,
      label: "设置",
      icon: <Settings className="w-5 h-5" />,
      title: "启动器全局设置",
    },
  ];

  return (
    <aside className="w-[72px] shrink-0 bg-[var(--bg-sidebar)] border-r border-[var(--border-subtle)] flex flex-col justify-between py-3 select-none transition-colors duration-200">
      {/* Top Navigation */}
      <div className="flex flex-col items-center gap-2">
        {topItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative group w-14 h-14 rounded-lg flex flex-col items-center justify-center transition-all ${
                isActive
                  ? "bg-[var(--active-sidebar)] text-[var(--accent)] font-medium shadow-sm"
                  : "text-[var(--text-sub)] hover:text-[var(--text-main)] hover:bg-[var(--hover-sidebar)]"
              }`}
              title={item.label}
            >
              {isActive && (
                <div className="absolute left-0 top-3 bottom-3 w-1 bg-[var(--accent)] rounded-r-full shadow-[0_0_8px_var(--accent)]" />
              )}
              <div className="mb-0.5">{item.icon}</div>
              <span className="text-[11px] scale-90 tracking-tight leading-none text-[var(--text-main)] opacity-90">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom Navigation */}
      <div className="flex flex-col items-center gap-2">
        {bottomItems.map((item) => {
          const isTab = item.id === "console" || item.id === "settings";
          const isActive = isTab && activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.onClick) {
                  item.onClick();
                } else if (isTab) {
                  setActiveTab(item.id as NavigationTab);
                }
              }}
              className={`relative group w-14 h-14 rounded-lg flex flex-col items-center justify-center transition-all ${
                isActive
                  ? "bg-[var(--active-sidebar)] text-[var(--accent)] font-medium shadow-sm"
                  : "text-[var(--text-sub)] hover:text-[var(--text-main)] hover:bg-[var(--hover-sidebar)]"
              }`}
              title={item.title || item.label}
            >
              {isActive && (
                <div className="absolute left-0 top-3 bottom-3 w-1 bg-[var(--accent)] rounded-r-full shadow-[0_0_8px_var(--accent)]" />
              )}
              <div className="mb-0.5">{item.icon}</div>
              <span className="text-[11px] scale-90 tracking-tight leading-none text-[var(--text-main)] opacity-90">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};
