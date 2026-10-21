<script setup lang="ts">
import { computed } from 'vue'
import { ICONS } from '@/config/icons'
import type { IconName } from '@/config/icons'

const props = withDefaults(
  defineProps<{
    name: IconName
    size?: number
    strokeWidth?: number
  }>(),
  { size: 24, strokeWidth: 1.7 },
)

const markup = computed<string>(() => ICONS[props.name] ?? ICONS.dot)
</script>

<template>
  <svg
    class="icon-svg"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    :stroke-width="strokeWidth"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    v-html="markup"
  />
</template>

<style scoped>
.icon-svg {
  display: block;
  overflow: visible;
}
</style>
