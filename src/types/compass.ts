import type { IconName } from '@/config/icons'

/* ══════════════ 功能按钮 ══════════════ */

/**
 * 功能按钮的数据形态（可辨识联合）。
 * `kind` 是判别式：按钮组件按 kind 决定渲染方式，
 * 新增一种呈现只需在这里加一个分支，编译器会强制所有 switch / v-if 分支被处理。
 */
export type LayerItem =
  | ColorItem
  | ThicknessItem
  | SizeItem
  | GlyphItem
  | IconItem
  | ActionItem

export interface ItemBase {
  id: string
  name: string
}

/** 色块 */
export interface ColorItem extends ItemBase {
  kind: 'color'
  color: string
}

/** 笔触粗细（px） */
export interface ThicknessItem extends ItemBase {
  kind: 'thickness'
  px: number
}

/** 橡皮尺寸（px） */
export interface SizeItem extends ItemBase {
  kind: 'size'
  px: number
}

/** 字号字母 */
export interface GlyphItem extends ItemBase {
  kind: 'glyph'
  text: string
  px: number
}

/** 纯图标 */
export interface IconItem extends ItemBase {
  kind: 'icon'
  icon: IconName
}

/** 动作型入口（不对应某个工具能力，例如设置） */
export interface ActionItem extends ItemBase {
  kind: 'action'
  action: 'open-settings'
  icon: IconName
}

export type LayerItemKind = LayerItem['kind']

/* ══════════════ 槽位与动画 ══════════════ */

/** 槽位生命周期：隐藏 → 冒泡进入 → 稳定（可点击）→ 破碎退出 */
export type SlotState = 'hidden' | 'entering' | 'stable' | 'exiting'

/**
 * 一个圆周槽位。
 * `token` 自增可强制按钮组件重建 DOM，从而重启动画（连续快速切换工具时必需）。
 */
export interface RingSlot {
  token: number
  item: LayerItem | null
  state: SlotState
  /** 动画延迟，ms */
  delay: number
}

/* ══════════════ 圆环 ══════════════ */

export type RingId = 'tools' | 'primary' | 'secondary'

/** 单层圆环的静态描述 */
export interface RingConfig {
  id: RingId
  label: string
  /** 槽位中心到圆心的距离 */
  radius: number
  /** 环带厚度 */
  thickness: number
  /** 最大容量：决定圆周被均分成几份，也决定最多实例化几个按钮 */
  capacity: number
  /** 按钮直径 */
  buttonSize: number
  /** 是否参与显隐动画（第三、四层为 true，第二层永不合拢为 false） */
  animated: boolean
}

/* ══════════════ 工具 ══════════════ */

export type ToolId = string

/** 工具在第三、四层的能力，索引 0 = 第三层，1 = 第四层 */
export type ToolLayers = readonly [LayerItem[], LayerItem[]]

export interface ToolConfig {
  id: ToolId
  name: string
  icon: IconName
  hint: string
  layers: ToolLayers
}

/** 第三层 / 第四层的索引 */
export type LayerIndex = 0 | 1
