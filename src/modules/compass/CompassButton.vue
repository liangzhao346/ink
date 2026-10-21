<script setup lang="ts">
import { computed } from 'vue'
import IconSvg from '@/components/IconSvg.vue'
import type { IconName } from '@/config/icons'
import type { LayerItem, SlotState } from '@/types/compass'

const props = withDefaults(
  defineProps<{
    /** 按钮绑定的功能定义，来自静态配置 */
    item: LayerItem
    /** 生命周期状态，决定动画与可点击性 */
    state: SlotState
    /** 按钮直径 */
    size: number
    /** 动画延迟，ms */
    delay?: number
    /** 是否为该层当前选中项 */
    selected?: boolean
  }>(),
  { delay: 0, selected: false },
)

const emit = defineEmits<{
  pick: [item: LayerItem]
}>()

const iconSize = computed<number>(() => Math.round(props.size * 0.46))

/** 图标型（含动作入口） */
const iconName = computed<IconName>(() =>
  props.item.kind === 'icon' || props.item.kind === 'action' ? props.item.icon : 'dot',
)

/** 笔触条高度，按按钮尺寸收敛上限 */
const barHeight = computed<number>(() =>
  props.item.kind === 'thickness' ? Math.min(props.item.px, props.size - 16) : 0,
)

/** 橡皮点直径 */
const dotSize = computed<number>(() => (props.item.kind === 'size' ? props.item.px : 0))

const interactive = computed<boolean>(() => props.state === 'stable')

function onClick(): void {
  if (!interactive.value) return
  emit('pick', props.item)
}
</script>

<template>
  <button
    class="cbtn"
    :class="[`is-${state}`, { 'is-on': selected }]"
    :style="{ width: `${size}px`, height: `${size}px`, animationDelay: `${delay}ms` }"
    type="button"
    :title="item.name"
    :aria-disabled="!interactive"
    @click="onClick"
  >
    <span class="face">
      <i v-if="item.kind === 'color'" class="swatch" :style="{ background: item.color }" />
      <i v-else-if="item.kind === 'thickness'" class="bar" :style="{ height: `${barHeight}px` }" />
      <i
        v-else-if="item.kind === 'size'"
        class="dot"
        :style="{ width: `${dotSize}px`, height: `${dotSize}px` }"
      />
      <span
        v-else-if="item.kind === 'glyph'"
        class="glyph"
        :style="{ fontSize: `${item.px}px` }"
      >{{ item.text }}</span>
      <IconSvg v-else :name="iconName" :size="iconSize" />
    </span>

    <span v-if="state === 'exiting'" class="shards" aria-hidden="true">
      <i
        v-for="n in 6"
        :key="n"
        :style="{ '--a': `${(n - 1) * 60}deg`, animationDelay: `${delay}ms` }"
      />
    </span>
  </button>
</template>

<style scoped>
.cbtn {
  position: relative;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: var(--text-dim);
  background:
    radial-gradient(120% 120% at 30% 22%, rgba(255, 255, 255, 0.09), transparent 58%),
    linear-gradient(180deg, #1b202a 0%, #12161e 100%);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.06),
    inset 0 -2px 6px rgba(0, 0, 0, 0.45),
    0 6px 16px rgba(0, 0, 0, 0.45);
  transition:
    transform 0.18s cubic-bezier(0.22, 1, 0.36, 1),
    color 0.18s ease,
    box-shadow 0.22s ease;
  will-change: transform, opacity;
}

.face {
  display: grid;
  place-items: center;
  pointer-events: none;
}

.cbtn.is-stable:hover {
  transform: scale(1.13);
  color: var(--gold-bright);
  box-shadow:
    inset 0 0 0 1px rgba(217, 178, 106, 0.38),
    0 8px 20px rgba(0, 0, 0, 0.5);
}

.cbtn.is-on {
  color: var(--gold-bright);
  background:
    radial-gradient(120% 120% at 30% 22%, rgba(243, 220, 172, 0.24), transparent 60%),
    linear-gradient(180deg, #2b2a24 0%, #1a1a18 100%);
  box-shadow:
    inset 0 0 0 1.5px var(--gold),
    0 0 18px rgba(217, 178, 106, 0.28),
    0 6px 16px rgba(0, 0, 0, 0.45);
}

/* 冒泡：显示 */
.cbtn.is-entering {
  pointer-events: none;
  animation: bubble-in 420ms cubic-bezier(0.3, 1.4, 0.5, 1) both;
}

@keyframes bubble-in {
  0% {
    opacity: 0;
    transform: scale(0.1) translateY(10px);
  }
  22% {
    opacity: 1;
  }
  58% {
    opacity: 1;
    transform: scale(1.22) translateY(0);
  }
  76% {
    transform: scale(0.93);
  }
  90% {
    transform: scale(1.04);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* 破碎：消失 */
.cbtn.is-exiting {
  pointer-events: none;
  animation: shatter-out 340ms cubic-bezier(0.36, 0.02, 0.7, 0.4) both;
}

@keyframes shatter-out {
  0% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
    filter: blur(0);
  }
  30% {
    opacity: 0.95;
    transform: scale(1.16) rotate(-5deg);
  }
  100% {
    opacity: 0;
    transform: scale(0.22) rotate(16deg);
    filter: blur(3px);
  }
}

.shards {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.shards i {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 7px;
  height: 7px;
  margin: -3.5px 0 0 -3.5px;
  border-radius: 2px;
  background: linear-gradient(140deg, var(--gold-bright), var(--gold-soft));
  opacity: 0;
  animation: shard-fly 340ms cubic-bezier(0.2, 0.7, 0.35, 1) both;
}

@keyframes shard-fly {
  0% {
    opacity: 0.95;
    transform: rotate(var(--a)) translateY(-9px) scale(1) rotate(0deg);
  }
  100% {
    opacity: 0;
    transform: rotate(var(--a)) translateY(-32px) scale(0.25) rotate(140deg);
  }
}

.swatch {
  width: 58%;
  height: 58%;
  border-radius: 50%;
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.22),
    0 2px 6px rgba(0, 0, 0, 0.5);
}

.bar {
  width: 56%;
  border-radius: 99px;
  background: currentColor;
}

.dot {
  max-width: 76%;
  max-height: 76%;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.85;
}

.glyph {
  font-weight: 600;
  line-height: 1;
}
</style>
