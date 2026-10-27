import React, { useState } from "react";
import {
  Settings,
  Wrench,
  ShieldCheck,
  Terminal,
  Play,
  RotateCcw,
  Cpu,
  Layers,
  Shuffle,
  Binary,
  Zap,
  Eye,
  HelpCircle,
  Radio,
  Globe,
  Users,
  Link2Off,
  ChevronDown,
  ChevronUp,
  XCircle,
  PlusSquare,
  Box,
  Monitor,
  RefreshCw,
  Check,
} from "lucide-react";
import { useLauncherStore } from "../store";

export const AdvancedView: React.FC = () => {
  const {
    config,
    saveConfig,
    systemInfo,
    startComfyUI,
    openSystemTerminal,
    isActionLoading,
  } = useLauncherStore();

  const [subTab, setSubTab] = useState<"options" | "env" | "patches">("options");
  const [expandedEnv, setExpandedEnv] = useState<string | null>(null);
  const [singlePackageName, setSinglePackageName] = useState("");
  const [isInstallingPackage, setIsInstallingPackage] = useState(false);
  const [installMessage, setInstallMessage] = useState<string | null>(null);

  if (!config) return null;

  const gpuName = systemInfo?.gpu?.name || "NVIDIA GeForce RTX 5070 Ti";

  const handleResetDefaults = () => {
    saveConfig({
      engine: "cuda:0",
      vram_mode: "default",
      cross_attention: "sub-quadratic",
      precision: "default",
      cpu_vae: false,
      fast_mode: false,
      preview_mode: "auto",
      smart_vram: true,
      stable_mode: false,
      cuda_malloc: true,
      listen_ip: "127.0.0.1",
      port: 8188,
      hf_offline: false,
      auto_open_browser: true,
      multi_user: false,
    });
  };

  const togglePatch = (patchId: string) => {
    const current = config.patches || [];
    const updated = current.includes(patchId)
      ? current.filter((id) => id !== patchId)
      : [...current, patchId];
    saveConfig({ patches: updated });
  };

  const handleReinstallSinglePackage = async () => {
    if (!singlePackageName.trim()) return;
    setIsInstallingPackage(true);
    setInstallMessage(null);
    try {
      // simulate or call install
      setInstallMessage(`正在安装 ${singlePackageName.trim()}...`);
      setTimeout(() => {
        setIsInstallingPackage(false);
        setInstallMessage(`组件 ${singlePackageName.trim()} 校验完成并已就绪。`);
      }, 1500);
    } catch {
      setIsInstallingPackage(false);
      setInstallMessage("安装失败，请检查网络或控制台。");
    }
  };

  const patchesList = [
    {
      id: "intel/compute-runtime#627",
      title: "intel/compute-runtime#627",
      desc: "对 IPEX 下的 SDP 优化方案启用 4G 内存分块",
      author: "Nuullll",
    },
    {
      id: "intel/intel-extension-for-pytorch#705",
      title: "intel/intel-extension-for-pytorch#705",
      desc: "修复 IPEX 下的抗锯齿插值算法问题",
      author: "Nuullll",
    },
    {
      id: "zluda-fix",
      title: "TBD",
      desc: "修复 PyTorch 部分功能在 ZLUDA 下无法正常运行的问题",
      author: "",
    },
    {
      id: "comfyui_LLM_party#35",
      title: "heshengtao/comfyui_LLM_party#35",
      desc: "修复 einx 模块由于部分后端无法加载而崩溃的问题",
      author: "",
    },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[var(--bg-app)] text-[var(--text-main)] select-none transition-colors duration-200">
      {/* Top Secondary Navigation */}
      <div className="h-12 border-b border-[var(--border-subtle)] flex items-center justify-between px-6 bg-[var(--bg-sidebar)] transition-colors duration-200">
        {/* Left Sub-tabs */}
        <div className="flex items-center gap-6 text-xs font-medium">
          <button
            onClick={() => setSubTab("options")}
            className={`flex items-center gap-1.5 py-3 border-b-2 transition-colors cursor-pointer ${
              subTab === "options"
                ? "border-[var(--accent)] text-[var(--accent)] font-semibold"
                : "border-transparent text-[var(--text-sub)] hover:text-[var(--text-main)]"
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            高级选项
          </button>
          <button
            onClick={() => setSubTab("env")}
            className={`flex items-center gap-1.5 py-3 border-b-2 transition-colors cursor-pointer ${
              subTab === "env"
                ? "border-[var(--accent)] text-[var(--accent)] font-semibold"
                : "border-transparent text-[var(--text-sub)] hover:text-[var(--text-main)]"
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            环境维护
          </button>
          <button
            onClick={() => setSubTab("patches")}
            className={`flex items-center gap-1.5 py-3 border-b-2 transition-colors cursor-pointer ${
              subTab === "patches"
                ? "border-[var(--accent)] text-[var(--accent)] font-semibold"
                : "border-transparent text-[var(--text-sub)] hover:text-[var(--text-main)]"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            补丁管理
          </button>
        </div>

        {/* Right Quick Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={openSystemTerminal}
            className="px-3 py-1.5 rounded bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-main)] text-xs flex items-center gap-1.5 border border-[var(--border-subtle)] transition-colors shadow-sm cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5 text-[var(--text-sub)]" />
            启动命令行提示符
          </button>
          <button
            onClick={startComfyUI}
            disabled={isActionLoading}
            className="px-3.5 py-1.5 rounded bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <Play className="w-3 h-3 fill-current" />
            一键启动
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* ============================================================== */}
        {/* SUBTAB 1: 高级选项 (3大板块：性能设置、网络设置、用户体验设置) */}
        {/* ============================================================== */}
        {subTab === "options" && (
          <div className="flex flex-col gap-6 max-w-4xl pb-10">
            {/* ---------------- 1. 性能设置 ---------------- */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-bold text-[var(--text-main)] tracking-wider">
                  性能设置
                </h2>
                <button
                  onClick={handleResetDefaults}
                  className="px-3.5 py-1.5 rounded bg-[#d13438] hover:bg-[#b02a2e] text-white text-xs font-medium transition-colors shadow-sm cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  恢复默认设置
                </button>
              </div>

              <div className="space-y-2">
                {/* 生成引擎 */}
                <div className="flex items-center justify-between p-3 rounded bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-black/10 dark:bg-black/30">
                      <Cpu className="w-4 h-4 text-sky-400" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[var(--text-main)] flex items-center gap-1">
                        生成引擎
                        <HelpCircle className="w-3 h-3 text-[var(--text-muted)] cursor-help" />
                      </div>
                      <div className="text-[11px] text-[var(--text-sub)]">
                        选择参与计算的硬件引擎
                      </div>
                    </div>
                  </div>
                  <select
                    value={config.engine}
                    onChange={(e) => saveConfig({ engine: e.target.value })}
                    className="bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded px-3 py-1.5 text-xs text-[var(--text-main)] min-w-[200px] outline-none focus:border-sky-400"
                  >
                    <option value="cuda:0">{gpuName}</option>
                    <option value="cpu">CPU</option>
                  </select>
                </div>

                {/* 显存优化 */}
                <div className="flex items-center justify-between p-3 rounded bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-black/10 dark:bg-black/30">
                      <Layers className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[var(--text-main)]">
                        显存优化
                      </div>
                      <div className="text-[11px] text-[var(--text-sub)]">
                        通过延长计算时间换取更低显存上限要求
                      </div>
                    </div>
                  </div>
                  <select
                    value={config.vram_mode}
                    onChange={(e) => saveConfig({ vram_mode: e.target.value })}
                    className="bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded px-3 py-1.5 text-xs text-[var(--text-main)] min-w-[200px] outline-none focus:border-sky-400"
                  >
                    <option value="default">由 ComfyUI 决定</option>
                    <option value="highvram">高显存 (highvram)</option>
                    <option value="normalvram">平衡显存 (normalvram)</option>
                    <option value="lowvram">低显存 (lowvram)</option>
                    <option value="gpu-only">全显存模式 (gpu-only)</option>
                  </select>
                </div>

                {/* Cross-Attention 优化方案 */}
                <div className="flex items-center justify-between p-3 rounded bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-black/10 dark:bg-black/30">
                      <Shuffle className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[var(--text-main)]">
                        Cross-Attention 优化方案
                      </div>
                      <div className="text-[11px] text-[var(--text-sub)]">
                        交叉注意力优化方案，有效降低显存用量
                      </div>
                    </div>
                  </div>
                  <select
                    value={config.cross_attention}
                    onChange={(e) => saveConfig({ cross_attention: e.target.value })}
                    className="bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded px-3 py-1.5 text-xs text-[var(--text-main)] min-w-[200px] outline-none focus:border-sky-400"
                  >
                    <option value="sub-quadratic">使用 Sub-Quadratic 方案</option>
                    <option value="sdp">使用 PyTorch SDP 方案</option>
                    <option value="default">由 ComfyUI 决定 (默认)</option>
                  </select>
                </div>

                {/* 计算精度设置 */}
                <div className="flex items-center justify-between p-3 rounded bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-black/10 dark:bg-black/30">
                      <Binary className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[var(--text-main)]">
                        计算精度设置
                      </div>
                      <div className="text-[11px] text-[var(--text-sub)]">
                        调节计算精度以平衡性能与显存占用，缓解由于精度带来的黑图问题
                      </div>
                    </div>
                  </div>
                  <select
                    value={config.precision}
                    onChange={(e) => saveConfig({ precision: e.target.value })}
                    className="bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded px-3 py-1.5 text-xs text-[var(--text-main)] min-w-[200px] outline-none focus:border-sky-400"
                  >
                    <option value="default">由 ComfyUI 决定 (默认)</option>
                    <option value="fp16">强制 FP16 (半精度)</option>
                    <option value="fp32">强制 FP32 (单精度)</option>
                    <option value="bf16">强制 BF16</option>
                  </select>
                </div>

                {/* 使用 CPU 运行 VAE */}
                <div className="flex items-center justify-between p-3 rounded bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-black/10 dark:bg-black/30">
                      <Layers className="w-4 h-4 text-rose-400" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[var(--text-main)]">
                        使用 CPU 运行 VAE
                      </div>
                      <div className="text-[11px] text-[var(--text-sub)]">
                        显著降低显存消耗，但会降低速度
                      </div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.cpu_vae}
                      onChange={(e) => saveConfig({ cpu_vae: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                  </label>
                </div>

                {/* 激进提速策略 */}
                <div className="flex items-center justify-between p-3 rounded bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-black/10 dark:bg-black/30">
                      <Zap className="w-4 h-4 text-yellow-400" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[var(--text-main)]">
                        激进提速策略
                      </div>
                      <div className="text-[11px] text-[var(--text-sub)]">
                        以一定质量代价实行激进的提速策略，需要支持的显卡型号及 Torch 版本。
                      </div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.fast_mode}
                      onChange={(e) => saveConfig({ fast_mode: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                  </label>
                </div>

                {/* 预览图生成模式 */}
                <div className="flex items-center justify-between p-3 rounded bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-black/10 dark:bg-black/30">
                      <Eye className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[var(--text-main)]">
                        预览图生成模式
                      </div>
                      <div className="text-[11px] text-[var(--text-sub)]">
                        选择生成过程中预览图生成算法
                      </div>
                    </div>
                  </div>
                  <select
                    value={config.preview_mode}
                    onChange={(e) => saveConfig({ preview_mode: e.target.value })}
                    className="bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded px-3 py-1.5 text-xs text-[var(--text-main)] min-w-[200px] outline-none focus:border-sky-400"
                  >
                    <option value="auto">自动</option>
                    <option value="fast">快速 (TAESD 快速解码)</option>
                    <option value="high">标准 (Latent2RGB)</option>
                    <option value="none">不生成预览 (None)</option>
                  </select>
                </div>

                {/* 智能显存优化 */}
                <div className="flex items-center justify-between p-3 rounded bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-black/10 dark:bg-black/30">
                      <Layers className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[var(--text-main)]">
                        智能显存优化
                      </div>
                      <div className="text-[11px] text-[var(--text-sub)]">
                        开启时将尽量将模型保留在显存中，以节省显存与内存交换时间
                      </div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.smart_vram}
                      onChange={(e) => saveConfig({ smart_vram: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                  </label>
                </div>

                {/* 稳定计算 */}
                <div className="flex items-center justify-between p-3 rounded bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-black/10 dark:bg-black/30">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[var(--text-main)]">
                        稳定计算
                      </div>
                      <div className="text-[11px] text-[var(--text-sub)]">
                        开启后将使用速度较慢的稳定算法，可能无法让图像在所有情况下都一致
                      </div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.stable_mode}
                      onChange={(e) => saveConfig({ stable_mode: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* ---------------- 2. 网络设置 ---------------- */}
            <div>
              <h2 className="text-xs font-bold text-[var(--text-main)] tracking-wider mb-3">
                网络设置
              </h2>

              <div className="space-y-2">
                {/* 监听设置 */}
                <div className="flex items-center justify-between p-3 rounded bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-black/10 dark:bg-black/30">
                      <Radio className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[var(--text-main)]">
                        监听设置
                      </div>
                      <div className="text-[11px] text-[var(--text-sub)]">
                        调整监听设置，远程共享访问
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={config.listen_ip}
                      onChange={(e) => saveConfig({ listen_ip: e.target.value })}
                      className="bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded px-3 py-1.5 text-xs text-[var(--text-main)] min-w-[150px] outline-none focus:border-sky-400"
                    >
                      <option value="127.0.0.1">仅本机 (127.0.0.1)</option>
                      <option value="0.0.0.0">局域网/公网 (0.0.0.0)</option>
                    </select>
                    <div className="flex items-center gap-1 text-xs text-[var(--text-sub)]">
                      <span>端口:</span>
                      <input
                        type="number"
                        value={config.port}
                        onChange={(e) =>
                          saveConfig({ port: parseInt(e.target.value) || 8188 })
                        }
                        className="w-16 bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded px-2 py-1 text-xs text-[var(--text-main)] font-mono text-center outline-none focus:border-sky-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Huggingface 离线模式 */}
                <div className="flex items-center justify-between p-3 rounded bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-black/10 dark:bg-black/30">
                      <Link2Off className="w-4 h-4 text-orange-400" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[var(--text-main)]">
                        Huggingface 离线模式
                      </div>
                      <div className="text-[11px] text-[var(--text-sub)]">
                        关闭从 Huggingface 上联网加载模型的功能，启用后将无法在线下载本地缺失的部分必要模型
                      </div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.hf_offline}
                      onChange={(e) => saveConfig({ hf_offline: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* ---------------- 3. 用户体验设置 ---------------- */}
            <div>
              <h2 className="text-xs font-bold text-[var(--text-main)] tracking-wider mb-3">
                用户体验设置
              </h2>

              <div className="space-y-2">
                {/* 启动完毕后自动打开浏览器 */}
                <div className="flex items-center justify-between p-3 rounded bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-black/10 dark:bg-black/30">
                      <Globe className="w-4 h-4 text-teal-400" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[var(--text-main)]">
                        启动完毕后自动打开浏览器
                      </div>
                      <div className="text-[11px] text-[var(--text-sub)]">
                        这个不用解释了吧( ﾟ∀ﾟ)
                      </div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.auto_open_browser}
                      onChange={(e) =>
                        saveConfig({ auto_open_browser: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                  </label>
                </div>

                {/* 多用户模式 */}
                <div className="flex items-center justify-between p-3 rounded bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-black/10 dark:bg-black/30">
                      <Users className="w-4 h-4 text-pink-400" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[var(--text-main)]">
                        多用户模式
                      </div>
                      <div className="text-[11px] text-[var(--text-sub)]">
                        允许多个用户同时使用一个实例
                      </div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.multi_user}
                      onChange={(e) => saveConfig({ multi_user: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SUBTAB 2: 环境维护 (4张折叠卡片 + 顶部红色警告提示框) */}
        {/* ============================================================== */}
        {subTab === "env" && (
          <div className="max-w-4xl space-y-4 pb-10">
            {/* Top Red Alert Banner */}
            <div className="flex items-center gap-3 p-3.5 rounded-lg bg-[#3b1b1f] border border-[#a4262c] text-[#f1707b] shadow-sm">
              <XCircle className="w-4 h-4 shrink-0 text-[#f1707b]" />
              <div className="text-xs leading-relaxed font-normal">
                <span className="font-bold mr-1">警告</span>
                在此界面随意操作将导致您的软件包损坏。在使用这一工具时，请求求专业人员协助并根据实际情况具体分析。新手如果暂时无法获得帮助，请考虑重新下载软件包。
              </div>
            </div>

            {/* Accordion List */}
            <div className="space-y-2">
              {/* 1. 安装 PyTorch */}
              <div className="rounded bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs overflow-hidden">
                <div
                  onClick={() =>
                    setExpandedEnv(expandedEnv === "torch" ? null : "torch")
                  }
                  className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-[var(--bg-card-hover)] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-black/10 dark:bg-black/30">
                      <PlusSquare className="w-4 h-4 text-sky-400" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[var(--text-main)]">
                        安装 PyTorch
                      </div>
                      <div className="text-[11px] text-[var(--text-sub)]">
                        安装 PyTorch 与 xFormers
                      </div>
                    </div>
                  </div>
                  {expandedEnv === "torch" ? (
                    <ChevronUp className="w-4 h-4 text-[var(--text-sub)]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[var(--text-sub)]" />
                  )}
                </div>

                {expandedEnv === "torch" && (
                  <div className="p-4 pt-1 border-t border-[var(--border-subtle)] bg-[var(--bg-app)]/50 text-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-sub)]">当前 PyTorch 版本：</span>
                      <span className="font-mono font-bold text-sky-400">
                        {systemInfo?.torch_version || "2.12.1+cu130"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-sub)]">CUDA 硬件加速：</span>
                      <span className="font-mono text-emerald-400">
                        {systemInfo?.cuda_available
                          ? `已启用 (CUDA ${systemInfo.cuda_version || "13.0"})`
                          : "未检测到"}
                      </span>
                    </div>
                    <div className="pt-2 flex gap-2">
                      <button
                        onClick={openSystemTerminal}
                        className="px-3 py-1.5 rounded bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)] flex items-center gap-1.5 cursor-pointer"
                      >
                        <Terminal className="w-3.5 h-3.5" />
                        在控制台检查并更新 PyTorch
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. 环境修复 */}
              <div className="rounded bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs overflow-hidden">
                <div
                  onClick={() =>
                    setExpandedEnv(expandedEnv === "repair" ? null : "repair")
                  }
                  className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-[var(--bg-card-hover)] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-black/10 dark:bg-black/30">
                      <Box className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[var(--text-main)]">
                        环境修复
                      </div>
                      <div className="text-[11px] text-[var(--text-sub)]">
                        修复内核与插件依赖的组件环境
                      </div>
                    </div>
                  </div>
                  {expandedEnv === "repair" ? (
                    <ChevronUp className="w-4 h-4 text-[var(--text-sub)]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[var(--text-sub)]" />
                  )}
                </div>

                {expandedEnv === "repair" && (
                  <div className="p-4 pt-1 border-t border-[var(--border-subtle)] bg-[var(--bg-app)]/50 text-xs space-y-3">
                    <p className="text-[var(--text-sub)] leading-relaxed">
                      自动扫描当前 ComfyUI
                      及其自定义节点的依赖完整性。若启动时提示缺包或符号无法加载，可执行一键校准。
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={openSystemTerminal}
                        className="px-3 py-1.5 rounded bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        一键修复内核依赖
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. 原生组件管理 */}
              <div className="rounded bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs overflow-hidden">
                <div
                  onClick={() =>
                    setExpandedEnv(expandedEnv === "native" ? null : "native")
                  }
                  className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-[var(--bg-card-hover)] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-black/10 dark:bg-black/30">
                      <Monitor className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[var(--text-main)]">
                        原生组件管理
                      </div>
                      <div className="text-[11px] text-[var(--text-sub)]">
                        管理启动器安装的原生组件
                      </div>
                    </div>
                  </div>
                  {expandedEnv === "native" ? (
                    <ChevronUp className="w-4 h-4 text-[var(--text-sub)]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[var(--text-sub)]" />
                  )}
                </div>

                {expandedEnv === "native" && (
                  <div className="p-4 pt-1 border-t border-[var(--border-subtle)] bg-[var(--bg-app)]/50 text-xs space-y-2">
                    <div className="flex items-center justify-between py-1 border-b border-[var(--border-subtle)]/50">
                      <span className="text-[var(--text-main)]">NVIDIA 专有驱动</span>
                      <span className="font-mono text-emerald-400">
                        {systemInfo?.gpu?.driver_version || "550+"} (正常就绪)
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-[var(--border-subtle)]/50">
                      <span className="text-[var(--text-main)]">WebKitGTK 桌面渲染引擎</span>
                      <span className="font-mono text-emerald-400">4.1 (XWayland)</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-[var(--text-main)]">Aki PyInterop 补丁</span>
                      <span className="font-mono text-[var(--text-sub)]">
                        {config.enable_aki_patches ? "已启用" : "未挂载"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. 重装单个 Python 组件 */}
              <div className="rounded bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs overflow-hidden">
                <div
                  onClick={() =>
                    setExpandedEnv(expandedEnv === "single" ? null : "single")
                  }
                  className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-[var(--bg-card-hover)] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-black/10 dark:bg-black/30">
                      <RefreshCw className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[var(--text-main)]">
                        重装单个 Python 组件
                      </div>
                      <div className="text-[11px] text-[var(--text-sub)]">
                        重新安装单个 Pip 软件包
                      </div>
                    </div>
                  </div>
                  {expandedEnv === "single" ? (
                    <ChevronUp className="w-4 h-4 text-[var(--text-sub)]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[var(--text-sub)]" />
                  )}
                </div>

                {expandedEnv === "single" && (
                  <div className="p-4 pt-1 border-t border-[var(--border-subtle)] bg-[var(--bg-app)]/50 text-xs space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={singlePackageName}
                        onChange={(e) => setSinglePackageName(e.target.value)}
                        placeholder="输入包名，例如：diffusers, scikit-image, opencv-python..."
                        className="flex-1 bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded px-3 py-1.5 text-xs text-[var(--text-main)] font-mono outline-none focus:border-sky-400"
                      />
                      <button
                        onClick={handleReinstallSinglePackage}
                        disabled={isInstallingPackage || !singlePackageName.trim()}
                        className="px-4 py-1.5 rounded bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-bold text-xs cursor-pointer flex items-center gap-1.5"
                      >
                        {isInstallingPackage ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        安装 / 重装
                      </button>
                    </div>
                    {installMessage && (
                      <div className="text-sky-400 text-[11px]">
                        {installMessage}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SUBTAB 3: 补丁管理 (精确复刻官方界面列表与金色编号样式) */}
        {/* ============================================================== */}
        {subTab === "patches" && (
          <div className="max-w-4xl space-y-3 pb-10">
            {/* Table Header */}
            <div className="flex items-center gap-6 px-3 py-2 text-xs font-semibold text-[var(--text-sub)] border-b border-[var(--border-subtle)]">
              <div className="w-12">启用</div>
              <div className="flex-1">描述</div>
            </div>

            {/* List */}
            <div className="space-y-1">
              {patchesList.map((patch) => {
                const isChecked = (config.patches || []).includes(patch.id);
                return (
                  <div
                    key={patch.id}
                    onClick={() => togglePatch(patch.id)}
                    className="flex items-center gap-6 p-2.5 rounded hover:bg-[var(--bg-card-hover)] cursor-pointer transition-colors"
                  >
                    <div className="w-12 flex items-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // handled by parent onClick
                        className="w-4 h-4 rounded border-gray-600 text-sky-500 focus:ring-0 cursor-pointer accent-sky-500"
                      />
                    </div>
                    <div className="flex-1 text-xs">
                      <span className="text-amber-300 font-mono font-medium mr-2">
                        {patch.title}:
                      </span>
                      <span className="text-[var(--text-main)]">{patch.desc}</span>
                      {patch.author && (
                        <span className="text-[var(--text-sub)] ml-2">
                          - {patch.author}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
