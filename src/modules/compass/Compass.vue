<script setup lang="ts">
import { computed, onBeforeUnmount, watch } from 'vue'
import CompassCore from './CompassCore.vue'
import CompassRing from './CompassRing.vue'
import { useCompassScale } from './composables/useCompassScale'
import { useRadialLayer } from './composables/useRadialLayer'
import {
  ANIMATION,
  CENTER,
  CORE_RADIUS,
  DESIGN_SIZE,
  RING_PRIMARY,
  RING_SECONDARY,
  RING_TOOLS,
  RINGS,
  SETTINGS_ENTRY,
} from '@/config/compass.config'
import { layerItems } from '@/config/tools.config'
import {
  activeTool,
  compassState,
  enabledTools,
  openSettings,
  selectLayerItem,
  selectionOf,
  setActiveTool,
} from '@/stores/compass'
import type { LayerItem, LayerIndex, RingSlot, SlotState, ToolConfig } from '@/types/compass'

const { stageRef, scale } = useCompassScale(DESIGN_SIZE)

/* ── 第三、四层：受动画驱动 ─────────────── */
const primary = useRadialLayer(RING_PRIMARY.capacity)
const secondary = useRadialLayer(RING_SECONDARY.capacity)

const primaryItems = computed<LayerItem[]>(() => layerItems(activeTool.value, 0))
const secondaryItems = computed<LayerItem[]>(() => layerItems(activeTool.value, 1))

watch(
  [primaryItems, secondaryItems],
  ([nextPrimary, nextSecondary]) => {
    // 展开时由内向外，收起时由外向内
    const primaryDelay = nextPrimary.length > primary.count.value ? 0 : ANIMATION.layerOffset
    const secondaryDelay =
      nextSecondary.length > secondary.count.value ? ANIMATION.layerOffset : 0
    primary.apply(nextPrimary, primaryDelay)
    secondary.apply(nextSecondary, secondaryDelay)
  },
  { immediate: true },
)

/* ── 第二层：静态槽位，由启用的工具直接实例化 ─── */
function toToolItem(tool: ToolConfig): LayerItem {
  return { id: tool.id, name: tool.name, kind: 'icon', icon: tool.icon }
}

const toolSlots = computed<RingSlot[]>(() => {
  const items: LayerItem[] = [
    ...enabledTools.value.slice(0, RING_TOOLS.capacity - 1).map(toToolItem),
    SETTINGS_ENTRY,
  ]
  return Array.from({ length: RING_TOOLS.capacity }, (_, index) => {
    const item = items[index] ?? null
    const state: SlotState = item ? 'stable' : 'hidden'
    return { token: 0, item, state, delay: 0 }
  })
})

const toolSelectedId = computed<string | null>(() =>
  compassState.settingsOpen ? SETTINGS_ENTRY.id : compassState.activeToolId,
)

/* ── 选中态 / 读数 ───────────────────────── */
const primarySelectedId = computed<string | null>(
  () => selectionOf(compassState.activeToolId)[0],
)
const secondarySelectedId = computed<string | null>(
  () => selectionOf(compassState.activeToolId)[1],
)

const accent = computed<string>(() => {
  const tool = activeTool.value
  if (!tool) return ''
  const [id0, id1] = selectionOf(tool.id)
  const hit = [...tool.layers[0], ...tool.layers[1]].find(
    (item) => item.id === id0 || item.id === id1,
  )
  return hit?.kind === 'color' ? hit.color : ''
})

const readout = computed<string>(() => {
  const tool = activeTool.value
  if (!tool) return '—'
  const [id0, id1] = selectionOf(tool.id)
  const names = [tool.layers[0], tool.layers[1]]
    .map((layer, index) => layer.find((item) => item.id === (index === 0 ? id0 : id1))?.name)
    .filter((name): name is string => Boolean(name))
  return [tool.name, ...names].join(' · ')
})

const animating = computed<boolean>(() => primary.animating.value || secondary.animating.value)

/** 最外层装饰刻度半径 */
const dialRadius = computed<number>(() => {
  const outer = RINGS[RINGS.length - 1]
  return outer.radius + outer.thickness / 2 + 17
})

/* ── 交互 ────────────────────────────────── */
function onPickTool(item: LayerItem): void {
  if (item.kind === 'action' && item.action === 'open-settings') {
    openSettings()
    return
  }
  setActiveTool(item.id)
}

function onPickLayer(layer: LayerIndex): (item: LayerItem) => void {
  return (item: LayerItem) => {
    const tool = activeTool.value
    if (tool) selectLayerItem(tool.id, layer, item.id)
  }
}

onBeforeUnmount(() => {
  primary.dispose()
  secondary.dispose()
})
</script>

<template>
  <div ref="stageRef" class="stage">
    <div class="compass" :style="{ transform: `translate(-50%, -50%) scale(${scale})` }">
      <!-- 罗盘装饰刻度 -->
      <svg class="chrome" :viewBox="`0 0 ${DESIGN_SIZE} ${DESIGN_SIZE}`" aria-hidden="true">
        <circle class="dial" :cx="CENTER" :cy="CENTER" :r="dialRadius" stroke-dasharray="2 10" />
      </svg>

      <!-- 第一层：当前工具 -->
      <CompassCore :tool="activeTool" :radius="CORE_RADIUS" :accent="accent" />

      <!-- 第二层：工具 + 设置，永不合拢 -->
      <CompassRing
        :ring="RING_TOOLS"
        :slots="toolSlots"
        :ring-on="true"
        :selected-id="toolSelectedId"
        @pick="onPickTool"
      />

      <!-- 第三层 -->
      <CompassRing
        :ring="RING_PRIMARY"
        :slots="primary.slots"
        :ring-on="primary.ringOn.value"
        :selected-id="primarySelectedId"
        @pick="onPickLayer(0)"
      />

      <!-- 第四层 -->
      <CompassRing
        :ring="RING_SECONDARY"
        :slots="secondary.slots"
        :ring-on="secondary.ringOn.value"
        :selected-id="secondarySelectedId"
        @pick="onPickLayer(1)"
      />
    </div>

    <div class="readout">
      <span class="live" :class="{ 'is-busy': animating }" />
      <span class="readout-text">{{ readout }}</span>
      <span class="readout-counts">
        三级 {{ primary.count.value }}/{{ RING_PRIMARY.capacity }}
        <em>·</em>
        四级 {{ secondary.count.value }}/{{ RING_SECONDARY.capacity }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.stage {
  position: relative;
  flex: 1;
  min-height: 0;
  width: 100%;
  overflow: hidden;
}

.compass {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 600px;
  height: 600px;
  transform-origin: 50% 50%;
}

.chrome {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
}

.chrome circle {
  transform-box: view-box;
  transform-origin: 300px 300px;
}

.dial {
  fill: none;
  stroke: rgba(217, 178, 106, 0.22);
  stroke-width: 1;
  animation: spin 140s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.readout {
  position: absolute;
  left: 50%;
  bottom: 10px;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  border-radius: 99px;
  font-size: 12px;
  color: var(--text-dim);
  background: rgba(18, 21, 28, 0.72);
  border: 1px solid var(--line-soft);
  backdrop-filter: blur(8px);
  white-space: nowrap;
}

.live {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--gold);
  box-shadow: 0 0 8px rgba(217, 178, 106, 0.6);
  transition: background 0.2s ease;
}

.live.is-busy {
  background: #6ea8ff;
  box-shadow: 0 0 8px rgba(110, 168, 255, 0.7);
  animation: blink 0.7s ease-in-out infinite;
}

@keyframes blink {
  50% {
    opacity: 0.35;
  }
}

.readout-text {
  color: var(--text);
  letter-spacing: 0.04em;
}

.readout-counts em {
  font-style: normal;
  opacity: 0.4;
  margin: 0 2px;
}
</style>
