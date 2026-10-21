import { RING_PRIMARY, RING_SECONDARY } from '@/config/compass.config'
import type { IconName } from '@/config/icons'
import type { ColorItem, LayerItem, ToolConfig, ToolId } from '@/types/compass'

/* ══════════════ 原子资源 ══════════════ */

const INK_PALETTE: ReadonlyArray<{ id: string; name: string; color: string }> = [
  { id: 'ink', name: '墨黑', color: '#1d2128' },
  { id: 'slate', name: '石墨', color: '#5d6674' },
  { id: 'crimson', name: '朱砂', color: '#e0483c' },
  { id: 'amber', name: '藤黄', color: '#f0a32a' },
  { id: 'jade', name: '石绿', color: '#42b183' },
  { id: 'teal', name: '青碧', color: '#2fa3bc' },
  { id: 'azure', name: '靛蓝', color: '#4472dd' },
  { id: 'violet', name: '紫檀', color: '#8d5cdb' },
]

const STROKE_WIDTHS: readonly number[] = [1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 18]

const ERASER_SIZES: readonly number[] = [8, 14, 20, 26, 32]

const SHAPES: ReadonlyArray<{ id: string; name: string; icon: IconName }> = [
  { id: 'line', name: '直线', icon: 'line' },
  { id: 'rect', name: '矩形', icon: 'rect' },
  { id: 'circle', name: '圆形', icon: 'circle' },
  { id: 'triangle', name: '三角', icon: 'triangle' },
  { id: 'arrow', name: '箭头', icon: 'arrow' },
  { id: 'star', name: '星形', icon: 'star' },
]

const FONT_STEPS: ReadonlyArray<{ id: string; name: string; px: number }> = [
  { id: 'sm', name: '小', px: 11 },
  { id: 'md', name: '中', px: 15 },
  { id: 'lg', name: '大', px: 19 },
]

/* ══════════════ 构造器 ══════════════ */

const asColors = (
  palette: ReadonlyArray<{ id: string; name: string; color: string }>,
): ColorItem[] => palette.map((c) => ({ id: c.id, name: c.name, kind: 'color', color: c.color }))

/* ══════════════ 工具池 ══════════════ */

/**
 * 工具注册表 —— 整个罗盘唯一的「能力来源」。
 *
 * `layers[0]` 对应第三层，`layers[1]` 对应第四层；
 * 数组长度决定该层实际渲染几个按钮（0 表示该层不存在），
 * 因此新增工具 / 增删能力只改这里，UI 与动画自动适配。
 */
export const TOOL_POOL: readonly ToolConfig[] = [
  {
    id: 'mouse',
    name: '鼠标',
    icon: 'cursor',
    hint: '平移与常规操作',
    layers: [[], []],
  },
  {
    id: 'pen',
    name: '笔',
    icon: 'pen',
    hint: '自由绘制',
    layers: [
      asColors(INK_PALETTE).slice(0, RING_PRIMARY.capacity),
      STROKE_WIDTHS.slice(0, RING_SECONDARY.capacity).map((px) => ({
        id: `w${px}`,
        name: `${px}px`,
        kind: 'thickness',
        px,
      })),
    ],
  },
  {
    id: 'eraser',
    name: '橡皮擦',
    icon: 'eraser',
    hint: '擦除笔迹',
    layers: [
      ERASER_SIZES.slice(0, RING_PRIMARY.capacity).map((px) => ({
        id: `s${px}`,
        name: `${px}px`,
        kind: 'size',
        px,
      })),
      [],
    ],
  },
  {
    id: 'select',
    name: '选择',
    icon: 'select',
    hint: '框选对象',
    layers: [[], []],
  },
  {
    id: 'shape',
    name: '形状',
    icon: 'shape',
    hint: '插入几何图形',
    layers: [
      SHAPES.slice(0, RING_PRIMARY.capacity).map((s) => ({ ...s, kind: 'icon' as const })),
      [],
    ],
  },
  {
    id: 'text',
    name: '文本',
    icon: 'text',
    hint: '插入文字',
    layers: [
      FONT_STEPS.slice(0, RING_PRIMARY.capacity).map((f) => ({
        id: `f${f.id}`,
        name: f.name,
        kind: 'glyph' as const,
        text: 'A',
        px: f.px,
      })),
      asColors(INK_PALETTE.slice(0, 6)),
    ],
  },
]

/** 默认出现在第二层的工具（末位留给设置入口） */
export const DEFAULT_ENABLED_TOOLS: readonly ToolId[] = ['mouse', 'pen', 'eraser', 'select']

export function findTool(id: ToolId | null): ToolConfig | null {
  if (!id) return null
  return TOOL_POOL.find((t) => t.id === id) ?? null
}

/** 取某工具在某层的功能按钮列表 */
export function layerItems(tool: ToolConfig | null, layerIndex: 0 | 1): LayerItem[] {
  return tool?.layers?.[layerIndex] ?? []
}
