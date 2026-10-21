# 项目长期记忆 · ink-v2（罗盘工具栏）

## 工作空间

当前工作空间：`/Users/joyce/workbuddy-ai/program/ink-v2`（2026-10-21 由用户确认切换）。
v1 纯 JS 版在 `/Users/joyce/workbuddy-ai/program/ink`，已冻结仅作对照，**不要改动或删除，先问**。

## 项目是什么

四层径向「罗盘」工具栏（Vue 3 + TypeScript + Vite，无 UI 库、无状态库）。
中心圆显示当前工具，向外三层圆环分别放工具、能力、参数；第三、四层随工具显隐，
用冒泡 / 破碎动画接续展开或收起。

## 约定（用户明确要求，务必沿用）

- **全量 TypeScript**，不允许再出现新的 `.js` 业务文件。
  `npm run build` 前置 `vue-tsc --noEmit`；`strict` + `noUnusedLocals` +
  `noUnusedParameters` + `verbatimModuleSyntax`（类型导入必须 `import type`）+ `@/*` 别名。
- **目录分层**：`src/types`（全量类型）/ `src/config`（静态配置，唯一真相来源）/
  `src/stores` / `src/modules/<feature>`（按领域分模块）/ `src/components`（通用 UI）。
- **四层圆环是一个模块**：`src/modules/compass/`。
  `CompassRing` 的 `slots` 长度 = `ring.capacity`，有内容实例化一个 `CompassButton`，
  没内容退化为刻度点——**按钮实例数完全由静态配置驱动，不要硬编码数量**。
- 新增能力只改 `src/config/tools.config.ts`，UI 与动画自动适配。

## 关键实现要点

- 内部固定 600×600 设计坐标系，圆心 (300,300)，外层 `useCompassScale` 用 ResizeObserver 算 scale。
- 环半径由厚度累加推导（`buildRings`），不硬编码，保证三层严格紧密相连。
- 槽位按最大容量固定（位置恒定），这是「接续动画」成立的前提。
- 内容与动画解耦：切换工具瞬间替换所有 `item`，动画只跑在数量差的那一段
  （变多从旧数量起冒泡，变少从旧数量-1 倒序破碎），层间错峰 150ms。
- 槽位状态机 `hidden / entering / stable / exiting`，只有 `stable` 可点击；
  `token` 自增 + 组件 `:key` 强制重建 DOM 以重启动画。

## 协作偏好

- 用户会直接指定工作空间；未指定时以上一次确认为准。
- 并行/独立任务优先派子 agent，而不是复制一份项目出来。
- 不要擅自删除旧版本或旧目录。
