import { reactive, ref } from 'vue'
import type { Ref } from 'vue'
import { ANIMATION } from '@/config/compass.config'
import type { LayerItem, RingSlot } from '@/types/compass'

export interface RadialLayer {
  /** 最大容量，即槽位数量 */
  readonly capacity: number
  /** 固定槽位数组，长度恒等于 capacity */
  readonly slots: RingSlot[]
  /** 当前稳定显示的数量 */
  readonly count: Ref<number>
  /** 环带是否需要绘制 */
  readonly ringOn: Ref<boolean>
  /** 是否正在播放动画 */
  readonly animating: Ref<boolean>
  apply(items: readonly LayerItem[], baseDelay?: number): void
  dispose(): void
}

function createSlot(): RingSlot {
  return { token: 0, item: null, state: 'hidden', delay: 0 }
}

/**
 * 径向层状态机（第三层 / 第四层共用）
 *
 * 1. 槽位按最大容量固定，位置恒定，是「接续动画」成立的前提。
 * 2. 内容瞬时替换：切换工具那一刻所有槽位的 item 就已更新，与动画完全解耦。
 * 3. 动画只发生在数量差的那一段：
 *      变多 -> 从 index = 旧数量 起依次冒泡
 *      变少 -> 从 index = 旧数量-1 起倒序破碎
 * 4. 只有 stable 的槽位可交互。
 */
export function useRadialLayer(capacity: number): RadialLayer {
  const slots = reactive<RingSlot[]>(Array.from({ length: capacity }, createSlot))
  const count = ref(0)
  const ringOn = ref(false)
  const animating = ref(false)

  let settleTimer: ReturnType<typeof setTimeout> | null = null

  function settle(): void {
    settleTimer = null
    for (const slot of slots) {
      if (slot.state === 'entering') {
        slot.state = 'stable'
        slot.delay = 0
      } else if (slot.state === 'exiting') {
        slot.state = 'hidden'
        slot.item = null
        slot.delay = 0
      }
    }
    animating.value = false
  }

  function apply(items: readonly LayerItem[], baseDelay = 0): void {
    const next = Math.min(items.length, capacity)
    const prev = count.value

    if (settleTimer !== null) {
      clearTimeout(settleTimer)
      settleTimer = null
    }

    for (let i = 0; i < capacity; i++) {
      const slot = slots[i]
      if (!slot) continue

      if (i < next) {
        // 内容立刻换成新工具的，不等动画
        slot.item = items[i] ?? null
        if (i < prev) {
          slot.state = 'stable'
          slot.delay = 0
        } else {
          slot.state = 'entering'
          slot.delay = baseDelay + (i - prev) * ANIMATION.stagger
          slot.token++
        }
      } else if (i < prev) {
        // 保留旧内容，用于破碎表现
        slot.state = 'exiting'
        slot.delay = baseDelay + (prev - 1 - i) * ANIMATION.stagger
        slot.token++
      } else {
        slot.state = 'hidden'
        slot.item = null
        slot.delay = 0
      }
    }

    count.value = next
    ringOn.value = next > 0

    const delta = Math.abs(next - prev)
    if (delta === 0) {
      animating.value = false
      return
    }

    animating.value = true
    const duration = next > prev ? ANIMATION.bubbleMs : ANIMATION.shatterMs
    settleTimer = setTimeout(settle, baseDelay + (delta - 1) * ANIMATION.stagger + duration + 30)
  }

  function dispose(): void {
    if (settleTimer !== null) {
      clearTimeout(settleTimer)
      settleTimer = null
    }
  }

  return { capacity, slots, count, ringOn, animating, apply, dispose }
}
