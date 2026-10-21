<script setup lang="ts">
import { computed } from 'vue'
import IconSvg from '@/components/IconSvg.vue'
import type { ToolConfig } from '@/types/compass'

/** 第一层：展示当前工具，永远不参与合拢 */
const props = withDefaults(
  defineProps<{
    tool: ToolConfig | null
    radius: number
    accent?: string
  }>(),
  { accent: '' },
)

const diameter = computed<number>(() => props.radius * 2)
const accentColor = computed<string>(() => props.accent || 'var(--gold)')
</script>

<template>
  <div
    class="core"
    :style="{ width: `${diameter}px`, height: `${diameter}px`, '--accent': accentColor }"
  >
    <span class="core-glow" />
    <span class="core-face">
      <IconSvg :name="tool?.icon ?? 'dot'" :size="40" />
      <em class="core-name">{{ tool?.name ?? '工具' }}</em>
    </span>
  </div>
</template>

<style scoped>
.core {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  display: grid;
  place-items: center;
  background:
    radial-gradient(120% 120% at 30% 20%, rgba(255, 255, 255, 0.1), transparent 60%),
    linear-gradient(180deg, #1a1f29 0%, #0e1116 100%);
  box-shadow:
    inset 0 0 0 1px rgba(217, 178, 106, 0.34),
    0 10px 30px rgba(0, 0, 0, 0.55);
}

.core-glow {
  position: absolute;
  inset: -14px;
  border-radius: 50%;
  border: 1px solid var(--accent);
  opacity: 0.28;
  animation: breathe 4.5s ease-in-out infinite;
}

@keyframes breathe {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.22;
  }
  50% {
    transform: scale(1.06);
    opacity: 0.42;
  }
}

.core-face {
  display: grid;
  justify-items: center;
  gap: 5px;
  color: var(--gold-bright);
}

.core-name {
  font-size: 12px;
  font-style: normal;
  letter-spacing: 0.14em;
  color: var(--text-dim);
}
</style>
