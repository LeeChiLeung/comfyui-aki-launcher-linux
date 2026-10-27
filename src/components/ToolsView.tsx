import React from "react";
import { Link2, ChevronRight } from "lucide-react";
import { useLauncherStore } from "../store";

export const ToolsView: React.FC = () => {
  const { openUrl } = useLauncherStore();

  const toolSections = [
    {
      title: "小工具",
      items: [
        {
          name: "NovelAI.Dev",
          url: "https://novelai.dev/",
        },
        {
          name: "Danbooru 标签超市",
          url: "https://tags.novelai.dev/",
        },
        {
          name: "Stable Diffusion 法术解析",
          url: "https://spell.novelai.dev/",
        },
        {
          name: "AiDraw - 绘图维基",
          url: "https://guide.novelai.dev/",
        },
      ],
    },
    {
      title: "UP 主",
      items: [
        {
          name: "秋叶aaaki",
          url: "https://space.bilibili.com/12566101",
        },
        {
          name: "喵喵hmkai",
          url: "https://space.bilibili.com/2082155",
        },
        {
          name: "琥珀青叶",
          url: "https://space.bilibili.com/507303431",
        },
        {
          name: "Nuullll",
          url: "https://space.bilibili.com/18233791",
        },
        {
          name: "青龙圣者",
          url: "https://space.bilibili.com/219296",
        },
      ],
    },
    {
      title: "开源项目",
      items: [
        {
          name: "SD-WebUI 开源项目",
          url: "https://github.com/AUTOMATIC1111/stable-diffusion-webui",
        },
        {
          name: "SD-WebUI DirectML",
          url: "https://github.com/lshqqytiger/stable-diffusion-webui-directml",
        },
        {
          name: "SD.Next",
          url: "https://github.com/vladmandic/automatic",
        },
        {
          name: "ComfyUI 官方仓库",
          url: "https://github.com/comfyanonymous/ComfyUI",
        },
      ],
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-[var(--bg-app)] text-[var(--text-main)] select-none transition-colors duration-200">
      <div className="max-w-4xl space-y-7">
        {toolSections.map((sec) => (
          <div key={sec.title} className="space-y-3">
            <h2 className="text-sm font-bold text-[var(--text-main)] tracking-wide">
              {sec.title}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {sec.items.map((item) => (
                <button
                  key={item.name}
                  onClick={() => openUrl(item.url)}
                  className="flex items-center justify-between p-3.5 rounded-lg bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-card)] hover:border-[var(--border-card-hover)] transition-all group text-left shadow-sm"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 rounded bg-black/10 dark:bg-black/30 group-hover:bg-black/20 dark:group-hover:bg-black/50 transition-colors">
                      <Link2 className="w-4 h-4 text-sky-500" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-semibold text-[var(--text-main)] transition-colors truncate">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-[var(--text-sub)] font-mono truncate">
                        {item.url}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
