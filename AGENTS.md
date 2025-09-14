# AGENTS 指南（dynamic-fog 汉化版）

> 本仓库为上游 Owlbear Rodeo 插件 “Dynamic Fog” 的汉化分支（Localization Fork）。上游仓库：https://github.com/owlbear-rodeo/dynamic-fog 。本仓库仅对文档与界面文案进行中文本地化与最小改动；功能与问题反馈请优先参考与反馈至上游。

## 工作约定
- 代码改动后必须小步提交：每次编辑后执行 `git add -A && git commit -m "<conventional message>"`。
- 提交信息采用 Conventional Commits。例如：`feat(meta): 汉化 manifest 与文档标题`。
- 文档、代码中的中文注释须详尽，解释思路与取舍，便于初学者学习与 Review。
- 结构模块化与分层：UI 文案分散处统一在各文件内就地汉化（保持最小侵入）。
- 错误与边界处理另行抽象；本插件主要为 UI/图形强化，暂不扩展额外错误层。

## 元数据与链接策略
- GitHub 链接：如出现上游 `github.com/owlbear-rodeo/dynamic-fog`，统一改为本仓库 `github.com/ZJHSteven/dynamic-fog`。
- 非 GitHub 的部署/商店链接（例如 `extensions.owlbear.rodeo` 或自托管域名）：保持不变。待后续自有部署完成后再切换为自有地址。
- 插件标识（`rodeo.owlbear.dynamic-fog/...`）保持不变，以便与上游保持兼容（如需侧载并与上游共存，建议另建分支调整 ID）。

## 可配置项（需按需更新）
- 作者名：当前为 `Steven ZJH`（来自本地 `git config user.name`）。如需变更，请在后续提交中一并修改：
  - `public/manifest.json` 的 `author` 字段
  - `docs/store.md` Front Matter 的 `author`
  - `README.md` 顶部声明中的作者/维护者信息
- 自有部署地址：暂无。完成部署后，请回到本文件“自有部署替换清单”一节进行替换。

## 自有部署替换清单（待部署后执行）
- `public/manifest.json` 中的 `homepage_url`：改为你的插件主页或商店页。
- `docs/store.md` 中的以下字段：
  - `image`（若改为你 Fork 的 Raw 链接或自有 CDN）
  - `icon`（如改为你部署的图标地址）
  - `manifest`（指向你部署的 `manifest.json`）
  - `learn-more`（你的插件介绍页）

## 本次汉化范围
- 元数据：`public/manifest.json` 名称、描述与作者。
- 文档：`README.md`、`docs/store.md` 全量中文化，并在开头注明“上游来源 + 汉化说明 + 反馈路径”。
- UI 文案：
  - 上下文菜单与设置：`src/background/createLightMenu.ts`（“添加光源/光源设置”）。
  - 工具模式名：`src/background/createDoorMode.ts`（“门”）、`src/background/createLineMode.ts`（“线段”）。
  - 菜单界面：`src/menu/Menu.tsx`（“角度/边缘/类型/旋转/移除光源”等）。
  - 图标可访问名称：`src/menu/icons/*`（用于无障碍/提示）。
  - HTML 页面标题与语言：`menu.html`、`background.html`。

## 构建与本地开发
- 安装依赖：`npm ci`
- 开发模式：`npm run dev`（Vite，默认 `http://localhost:5173`）
- 生产构建：`npm run build`

## 变更日志（维护者使用）
- 2025-09-14：初始化 AGENTS.md，确立汉化策略与提交流程。

