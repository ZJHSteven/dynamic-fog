---
title: 动态雾效
description: 添加墙体、门与光源，获得简单易用的动态雾效果
author: ZJHSteven
image: https://raw.githubusercontent.com/ZJHSteven/dynamic-fog/main/docs/header.jpg
icon: https://dynamic-fog.owlbear.rodeo/logo.png
tags:
  - built-by-owlbear
  - fog
manifest: https://dynamic-fog.owlbear.rodeo/manifest.json
learn-more: https://github.com/ZJHSteven/dynamic-fog
---

# 动态雾效（Dynamic Fog，中文汉化版）

> 本页为上游插件“Dynamic Fog”的中文说明，内容基于上游进行翻译与表述优化；功能请以上游为准。上游仓库：https://github.com/owlbear-rodeo/dynamic-fog 。

为场景添加墙体（Wall）、门（Door）与光源（Light），获得简单易用的“动态雾”体验。

## 添加光源（Add a Light）

在场景中选中任意图片（Image）后，打开右键上下文菜单，点击“添加光源（Add Light）”。

![添加光源菜单项](https://raw.githubusercontent.com/ZJHSteven/dynamic-fog/main/docs/light.jpg)

添加后，可通过“光源设置（Light Settings）”面板调整参数。

![光源设置菜单项](https://raw.githubusercontent.com/ZJHSteven/dynamic-fog/main/docs/settings.jpg)

各参数含义如下：

| 菜单项 | 说明 |
| ------ | ---- |
| Range  | 光源半径，单位与当前场景单位一致 |
| Angle  | 光源角度：整圆或扇形 |
| Edge   | 光源边缘：硬边或软边 |
| Type   | 光源类型：主光源或次光源（见下文） |

若需移除光源，可在“光源设置”面板底部点击“移除光源（Remove Light）”。

## 添加墙体（Add a Wall）

墙体会基于 Owlbear Rodeo 自带的雾工具（Fog Tool）绘制的雾形状自动创建。如何使用原生雾工具，请参考官方文档：[链接](https://docs.owlbear.rodeo/docs/fog/)。

## 添加门（Add a Door）

在雾工具栏中选择“门（Door）”工具，可在任意墙体边缘拖拽创建门。

![门工具](https://raw.githubusercontent.com/ZJHSteven/dynamic-fog/main/docs/doorTool.jpg)

选择门工具后，在雾形状边缘拖动即可创建门（如下图左）。创建后，会出现代表门范围的路径与代表门中心的门图标；仅在选择雾工具时可见。门关闭时为红色路径，图标为“关”；门开启时为绿色路径，图标为“开”（如下图中、右）。

![创建门示意](https://raw.githubusercontent.com/ZJHSteven/dynamic-fog/main/docs/doors.jpg)

- 选择门工具时，单击门可开/关切换。
- 选择门工具时，双击门可删除该门。

## 次级光照（Secondary Lighting）

每个光源可被标记为“主光源（Primary）”或“次光源（Secondary）”，由“光源设置”中的 Type 选项控制。人物图标代表主光源；营火图标代表次光源。

- 主光源：常规投射阴影的光源，只要可见，始终会从雾中切出可视区域。
- 次光源：仅影响已被主光源照亮、对玩家可见的雾。例如，将敌人营地的火把设置为“次光源”，则只有当玩家的主光源获得到该火把的视线时，营地才会变得可见。

**支持（Support）**

本汉化仅覆盖文字与文档；如需功能支持或反馈 Bug，请优先联系上游：<support@owlbear.rodeo>。
