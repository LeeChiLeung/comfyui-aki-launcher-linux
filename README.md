# ComfyUI 绘世启动器 (Linux 原生版本)

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-24C8DB?logo=tauri&logoColor=white)](https://v2.tauri.app/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TailwindCSS v4](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

> **ComfyUI Aki Launcher for Linux** —— 基于 **Tauri v2 (Rust) + React 19 + TypeScript + TailwindCSS v4** 深度重构的秋叶绘世启动器 Linux 原生桌面端。

---

## ✨ 核心特性

- 🎨 **原版 1:1 视觉设计**：完整还原秋叶启动器 Windows 版的 7 大核心模块布局，内嵌官方原画星空横幅。
- 💡 **双主题无缝切换**：左侧边栏「灯泡」按钮支持 **Fluent 炭黑暗色** 与 **清爽瓷白浅色** 主题一键毫秒级切换，偏好自动持久化。
- 🐧 **纯正 Linux 原生**：无缝融入系统窗口管理器（KDE Plasma / GNOME / Wayland 等），无多余伪 Windows 装饰条。
- ⚡ **超轻量独立二进制**：前端资源与官方素材全部内嵌在 Rust 可执行文件中，Release 二进制仅约 **8.9 MB**，秒级启动，告别 Wine/模拟器。
- 🚀 **硬件与性能调度**：
  - 实时探测并监控显卡（如 NVIDIA RTX 50 系列）显存与核心温度。
  - 支持生成引擎切换（GPU / CPU）、显存优化等级（highvram / lowvram / gpu-only）、Cross-Attention 优化算法、精度控制、CPU VAE 等。
- 📟 **内嵌 xterm.js 实时终端**：完整支持 ANSI 彩色高亮输出、日志复制、清空与状态监控。
- 📂 **原生桌面文件联动**：一键调用系统原生文件管理器（Dolphin / Nautilus / Thunar）直达根目录、`custom_nodes`、`input`、`output`。
- 🌐 **国内镜像源加速**：一键切换配置 PyPI、Git、HuggingFace、GitHub 下载加速。
- 🩺 **系统环境诊断**：自动扫描并检测 Python 解释器、CUDA 驱动加速、Git 控制与插件节点完整性。

---

## 🛠️ 技术栈

- **框架**：[Tauri v2](https://v2.tauri.app/) (Rust 2024 Backend)
- **前端**：React 19 + TypeScript + Vite
- **样式**：TailwindCSS v4 + Lucide Icons
- **状态管理**：Zustand
- **终端**：xterm.js + @xterm/addon-fit

---

## 🚀 快速启动

### 方式 1：使用便捷脚本运行
在启动器目录直接运行启动脚本（已内嵌 Wayland/X11 及 NVIDIA 驱动防崩溃兼容指令）：

```bash
./启动器-linux.sh
```

### 方式 2：开发与构建

#### 环境要求
- Node.js >= 18
- pnpm
- Rust >= 1.78 / Cargo
- WebKitGTK 4.1 开发库（如 `webkit2gtk-4.1`）

#### 本地开发
```bash
pnpm install
pnpm tauri dev
```

#### 生产打包构建
```bash
pnpm tauri build
```
编译产物将生成在 `src-tauri/target/release/comfyui-launcher-linux`。

---

## 📜 鸣谢与版权声明
- 原版启动器设计灵感与素材来源于 [秋叶aaaki](https://space.bilibili.com/12566101) 的「绘世启动器」。
- ComfyUI 官方项目：[comfyanonymous/ComfyUI](https://github.com/comfyanonymous/ComfyUI)。
- 本项目旨在为 Linux 开发者提供第一方原生级别的 ComfyUI 启动与管理体验。

---

## 📄 开源许可证 (License)

本项目采用 **Apache License 2.0** 开源许可证。详细内容请参阅 [LICENSE](LICENSE) 文件。

```text
Copyright 2026 LeeChiLeung <1261620535@qq.com>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

