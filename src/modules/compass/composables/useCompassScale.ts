import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { Ref } from 'vue'

export interface CompassScale {
  stageRef: Ref<HTMLElement | null>
  scale: Ref<number>
}

/**
 * 监听舞台尺寸，把固定设计坐标系等比缩放进可视区域。
 */
export function useCompassScale(designSize: number, padding = 40, max = 1.2): CompassScale {
  const stageRef = ref<HTMLElement | null>(null)
  const scale = ref(1)
  let observer: ResizeObserver | null = null

  onMounted(() => {
    const el = stageRef.value
    if (!el) return
    observer = new ResizeObserver((entries) => {
      const box = entries[0]?.contentRect
      if (!box || box.width === 0 || box.height === 0) return
      scale.value = Math.min(Math.min(box.width, box.height) / (designSize + padding), max)
    })
    observer.observe(el)
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    observer = null
  })

  return { stageRef, scale }
}
