import type { LayerItem, RingConfig, RingId } from '@/types/compass'

/* ══════════════ 画布 ══════════════ */

/** 内部设计坐标系边长（组件内部按此坐标布局，外层用 scale 自适应） */
export const DESIGN_SIZE = 600
export const CENTER = DESIGN_SIZE / 2

/** 第一层（中心圆）半径 */
export const CORE_RADIUS = 56

/* ══════════════ 动画时序 ══════════════ */

export const ANIMATION = {
  /** 相邻按钮的错峰间隔 */
  stagger: 42,
  /** 冒泡（显示）时长 */
  bubbleMs: 420,
  /** 破碎（消失）时长 */
  shatterMs: 340,
  /** 层间错峰：展开时第四层延后，收起时第三层延后 */
  layerOffset: 150,
} as const

/* ══════════════ 四层圆环 ══════════════ */

interface RingSeed {
  id: RingId
  label: string
  thickness: number
  capacity: number
  buttonSize: number
  animated: boolean
}

/**
 * 只需声明「厚度 + 容量 + 按钮尺寸」，半径由厚度累加推导，
 * 保证三层圆环从核心向外严格紧密相连，不会出现缝隙或重叠。
 */
const RING_SEEDS: readonly RingSeed[] = [
  { id: 'tools', label: '第二层', thickness: 76, capacity: 5, buttonSize: 54, animated: false },
  { id: 'primary', label: '第三层', thickness: 68, capacity: 8, buttonSize: 46, animated: true },
  { id: 'secondary', label: '第四层', thickness: 64, capacity: 12, buttonSize: 40, animated: true },
]

function buildRings(seeds: readonly RingSeed[]): RingConfig[] {
  let inner = CORE_RADIUS
  return seeds.map((seed) => {
    const radius = inner + seed.thickness / 2
    inner += seed.thickness
    return { ...seed, radius }
  })
}

export const RINGS: readonly RingConfig[] = buildRings(RING_SEEDS)

export function getRing(id: RingId): RingConfig {
  const ring = RINGS.find((r) => r.id === id)
  if (!ring) throw new Error(`[compass] 未定义的圆环：${id}`)
  return ring
}

/** 第二层：工具 + 设置 */
export const RING_TOOLS = getRing('tools')
/** 第三层 */
export const RING_PRIMARY = getRing('primary')
/** 第四层 */
export const RING_SECONDARY = getRing('secondary')

/** 参与显隐动画的圆环（按由内到外顺序） */
export const ANIMATED_RINGS: readonly RingConfig[] = RINGS.filter((r) => r.animated)

/** 各层边界半径（含核心外沿），用于绘制分隔线 */
export const EDGE_RADII: readonly number[] = RING_SEEDS.reduce<number[]>((acc, seed) => {
  acc.push((acc[acc.length - 1] ?? CORE_RADIUS) + seed.thickness)
  return acc
}, [CORE_RADIUS])

/** 第二层末位固定为设置入口 */
export const SETTINGS_ENTRY: LayerItem = {
  id: '__settings__',
  name: '设置',
  kind: 'action',
  action: 'open-settings',
  icon: 'settings',
}

/** 第二层可容纳的实体工具数量（末位被设置占用） */
export const MAX_TOOLS = RING_TOOLS.capacity - 1
