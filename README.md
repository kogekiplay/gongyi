# 工艺单计算系统 (Process Calculator)

这是一个基于 Rust + Tauri + React 的跨平台工艺计算应用。支持 macOS/Windows 桌面端以及纯 Web 端运行。

## 项目结构

- `crates/process_calc_core`: 纯 Rust 实现的核心计算逻辑库。
- `apps/tauri-desktop`: Tauri 桌面应用（包含 Rust 后端与构建配置）。
- `apps/web`: 前端 React 应用（Vite 构建）。

## 功能特性

- **双标准支持**: 沈变标准 / 衡变标准
- **多种计算模式**: 单参数计算 / 全参数批量计算
- **参数计算**:
  - a边漆膜厚度
  - b边漆膜厚度
  - a边挤压模具尺寸
  - b边挤压模具尺寸
- **历史记录**: 本地存储最近 50 条记录，支持回填与导出 (JSON/CSV)。
- **跨平台**:
  - 桌面端: 使用 Rust Core 进行高性能计算。
  - Web 端: 使用 TypeScript 镜像逻辑（或 WASM）实现离线计算。

## 开发指南

### 前置要求

- Node.js (v18+)
- Rust (latest stable)
- Tauri CLI (`cargo install tauri-cli`)

### 安装依赖

```bash
# 在根目录
npm install # (若有根 package.json) 或进入 apps/web 安装
cd apps/web && npm install
cd ../../apps/tauri-desktop && npm install
```

### 运行开发环境

**桌面端 (Tauri)**:

```bash
cd apps/tauri-desktop
npm run tauri dev
# 或者
cargo tauri dev
```

**Web 端**:

```bash
cd apps/web
npm run dev
```

### 构建

**桌面端**:

```bash
cd apps/tauri-desktop
npm run tauri build
```

**Web 端**:

```bash
cd apps/web
npm run build
```

## 技术细节

- **核心算法**: 位于 `crates/process_calc_core`，强类型设计，确保计算准确性。
- **前端架构**: React + TypeScript + Tailwind CSS。
- **数据流**: 前端通过 Tauri Command 调用 Rust Core；Web 端回退到本地 TypeScript 实现。
