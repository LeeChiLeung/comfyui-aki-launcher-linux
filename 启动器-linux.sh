#!/usr/bin/env bash
set -e

# Linux NVIDIA + Wayland 环境兼容性修复：
# WebKitGTK 在 NVIDIA 专有驱动的 Wayland 环境下会触发 DMA-BUF 协议错误 (Error 71)。
# 通过 XWayland (GDK_BACKEND=x11) 与禁用 DMA-BUF 渲染，确保窗口与 WebView 100% 稳定运行。
export GDK_BACKEND="${GDK_BACKEND:-x11}"
export WEBKIT_DISABLE_DMABUF_RENDERER="${WEBKIT_DISABLE_DMABUF_RENDERER:-1}"

# 防止系统代理（如 socks5/http_proxy）拦截 WebKitGTK 内部的 localhost / tauri.localhost 通信
export no_proxy="localhost,127.0.0.1,tauri.localhost,::1,${no_proxy}"
export NO_PROXY="localhost,127.0.0.1,tauri.localhost,::1,${NO_PROXY}"

# 脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BIN_PATH="$SCRIPT_DIR/src-tauri/target/debug/comfyui-launcher-linux"
RELEASE_BIN_PATH="$SCRIPT_DIR/src-tauri/target/release/comfyui-launcher-linux"

if [ -f "$RELEASE_BIN_PATH" ]; then
    echo "[绘世启动器] 启动 Release 版本..."
    exec "$RELEASE_BIN_PATH" "$@"
elif [ -f "$BIN_PATH" ]; then
    echo "[绘世启动器] 启动 Debug 版本..."
    exec "$BIN_PATH" "$@"
else
    echo "[绘世启动器] 首次运行，正在构建可执行文件..."
    cd "$SCRIPT_DIR"
    pnpm install
    pnpm tauri build
    exec "$RELEASE_BIN_PATH" "$@"
fi
