<script setup lang="ts">
import { computed } from 'vue'
import CompassButton from './CompassButton.vue'
import { useSlotLayout } from './composables/useSlotLayout'
import { CENTER, DESIGN_SIZE } from '@/config/compass.config'
import type { LayerItem, RingConfig, RingSlot } from '@/types/compass'

/**
 * 单层圆环。
 *
 * 渲染的功能按钮实例数量完全由静态配置决定：
 * `slots` 的长度 = `ring.capacity`，每个槽位有内容就实例化一个 CompassButton，
 * 没有内容就退化为刻度点（仅动画层）。
 */
const props = withDefaults(
  defineProps<{
    /** 圆环静态配置（半径 / 厚度 / 容量 / 按钮尺寸） */
    ring: RingConfig
    /** 槽位数组，长度应等于 ring.capacity */
    slots: RingSlot[]
    /** 环带是否展开（容量 > 0） */
    ringOn?: boolean
    /** 该层当前选中项 id */
    selectedId?: string | null
  }>(),
  { ringOn: true, selectedId: null },
)

const emit = defineEmits<{
  pick: [item: LayerItem]
}>()

const layout = useSlotLayout(() => props.ring)

const innerRadius = computed<number>(() => props.ring.radius - props.ring.thickness / 2)
const outerRadius = computed<number>(() => props.ring.radius + props.ring.thickness / 2)

/** 非动画层（第二层）永远展开 */
const bandVisible = computed<boolean>(() => (props.ring.animated ? props.ringOn : true))
</script>

<template>
  <div class="ring-root">
    <svg class="band-layer" :viewBox="`0 0 ${DESIGN_SIZE} ${DESIGN_SIZE}`" aria-hidden="true">
      <g class="band-group" :class="{ 'is-off': !bandVisible }">
        <circle
          class="band"
          :cx="CENTER"
          :cy="CENTER"
          :r="ring.radius"
          :stroke-width="ring.thickness"
        />
        <circle class="edge" :cx="CENTER" :cy="CENTER" :r="innerRadius" />
        <circle class="edge" :cx="CENTER" :cy="CENTER" :r="outerRadius" />
      </g>
    </svg>

    <div
      v-for="(slot, index) in slots"
      :key="`${ring.id}-${index}`"
      class="slot"
      :style="{ transform: layout[index] }"
    >
      <CompassButton
        v-if="slot.item && slot.state !== 'hidden'"
        :key="slot.token"
        :item="slot.item"
        :state="slot.state"
        :delay="slot.delay"
        :size="ring.buttonSize"
        :selected="slot.item.id === selectedId"
        @pick="emit('pick', $event)"
      />
      <i v-else-if="ring.animated" class="tick" :class="{ 'is-on': ringOn }" />
    </div>
  </div>
</template>

<style scoped>
.ring-root {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.band-layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.band-layer circle {
  transform-box: view-box;
  transform-origin: 300px 300px;
}

.band {
  fill: none;
  stroke: rgba(217, 178, 106, 0.055);
}

.edge {
  fill: none;
  stroke: rgba(217, 178, 106, 0.16);
  stroke-width: 1;
}

.band-group {
  transition:
    transform 0.55s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.38s ease;
}

.band-group.is-off {
  transform: scale(0.72);
  opacity: 0;
}

.slot {
  position: absolute;
  left: 50%;
  top: 50%;
  pointer-events: auto;
}

.tick {
  display: block;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(217, 178, 106, 0.22);
  opacity: 0;
  transition: opacity 0.35s ease;
}

.tick.is-on {
  opacity: 1;
}
</style>
