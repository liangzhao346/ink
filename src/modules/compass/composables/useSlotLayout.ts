import { computed, toValue } from 'vue'
import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import type { RingConfig } from '@/types/compass'

/**
 * 槽位定位：以圆心为基准，绕到角度 θ 后向外推 radius，再反向旋转回正。
 * θ 从 12 点方向起顺时针，按容量均分整个圆周。
 */
export function slotTransform(index: number, capacity: number, radius: number): string {
  const angle = (index / capacity) * 360
  return `translate(-50%, -50%) rotate(${angle}deg) translateY(${-radius}px) rotate(${-angle}deg)`
}

/** 按圆环配置生成全部槽位的 transform（长度 = 容量） */
export function useSlotLayout(ring: MaybeRefOrGetter<RingConfig>): ComputedRef<string[]> {
  return computed(() => {
    const config = toValue(ring)
    return Array.from({ length: config.capacity }, (_, index) =>
      slotTransform(index, config.capacity, config.radius),
    )
  })
}
