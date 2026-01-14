# 铜陵杨铜工艺计算器 (Process Calculator)

这是一个基于 **Rust + Tauri + React** 的跨平台工艺计算应用，采用 macOS 风格的现代 Dashboard 界面设计。支持 macOS/Windows 桌面端以及纯 Web 端运行。

![UI Preview](https://github.com/kogekiplay/gongyi/assets/placeholder/preview.png)

## ✨ 功能特性

- **现代 UI 设计**: 采用 Surge 风格的 Dashboard 界面，支持卡片式布局、柔和阴影与动效 (Framer Motion)。
- **双标准支持**: 完整支持 **沈变标准** 与 **衡变标准** 切换。
- **灵活计算模式**:
  - **Dashboard 概览**: 快速访问常用参数计算。
  - **单参数模式**: 针对特定参数（如漆膜厚度、挤压模具）进行详细计算。
  - **全参数模式**: 一次性输入所有数据，批量计算并生成完整报告。
- **数据管理**:
  - **历史记录**: 自动保存计算历史（桌面端使用 AppData 持久化，Web 端使用 LocalStorage）。
  - **数据导出**: 支持导出计算记录为 **JSON** 或 **CSV** 格式。
  - **一键回填**: 点击历史记录可快速恢复现场，重新计算。
- **参数支持**:
  - a/b 边漆膜厚度
  - a/b 边挤压模具尺寸
  - 自动校验输入合法性（如导线根数必须为整数）。

## 🛠 技术栈

- **Core**: Rust (`crates/process_calc_core`) - 核心算法库，强类型保证。
- **Desktop**: Tauri v2 - 跨平台原生外壳。
- **Web / UI**:
  - React 18 + TypeScript
  - **Tailwind CSS** + **shadcn/ui** - 样式与组件库。
  - **Framer Motion** - 平滑的交互动画。
  - **React Hook Form** + **Zod** - 高性能表单与模式校验。

## 🚀 项目结构

- `crates/process_calc_core`: 纯 Rust 实现的核心计算逻辑。
- `apps/tauri-desktop`: Tauri 桌面应用主进程。
- `apps/web`: 前端 React 应用界面。

## 💻 开发指南

### 前置要求

- Node.js (v18+)
- Rust (Stable)
- Tauri CLI (`cargo install tauri-cli`)

### 安装依赖

```bash
# 安装前端依赖
cd apps/web
npm install

# 安装桌面端依赖
cd ../tauri-desktop
npm install
```

### 运行开发环境

**桌面端 (推荐)**:
启动 Tauri 应用，包含完整的 Rust 后端与文件存储功能。
```bash
cd apps/tauri-desktop
npm run dev
```

**Web 端预览**:
仅启动前端界面 (存储功能降级为 LocalStorage)。
```bash
cd apps/web
npm run dev
```

### 构建发布

```bash
cd apps/tauri-desktop
npm run build
```

## 📄 许可证

MIT License
