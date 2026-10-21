<script setup lang="ts">
import IconSvg from '@/components/IconSvg.vue'
import { MAX_TOOLS, RING_PRIMARY, RING_SECONDARY } from '@/config/compass.config'
import { TOOL_POOL } from '@/config/tools.config'
import { closeSettings, compassState, toggleTool } from '@/stores/compass'
import type { ToolConfig } from '@/types/compass'

function isOn(id: string): boolean {
  return compassState.enabledToolIds.includes(id)
}

function isLocked(id: string): boolean {
  return isOn(id) && compassState.enabledToolIds.length <= 1
}

function layerInfo(tool: ToolConfig): string {
  const third = tool.layers[0].length
  const fourth = tool.layers[1].length
  return [
    third ? `三级 ${third}/${RING_PRIMARY.capacity}` : '无三级',
    fourth ? `四级 ${fourth}/${RING_SECONDARY.capacity}` : '无四级',
  ].join(' · ')
}
</script>

<template>
  <Transition name="mask">
    <div v-if="compassState.settingsOpen" class="mask" @click="closeSettings" />
  </Transition>

  <Transition name="drawer">
    <aside v-if="compassState.settingsOpen" class="panel">
      <header class="panel-head">
        <div>
          <h2>工具配置</h2>
          <p>第二层共 {{ MAX_TOOLS + 1 }} 位，末位固定为设置入口，因此最多启用 {{ MAX_TOOLS }} 个工具。</p>
        </div>
        <button class="close" type="button" @click="closeSettings">
          <IconSvg name="close" :size="16" />
        </button>
      </header>

      <p class="counter">
        已启用 <b>{{ compassState.enabledToolIds.length }}</b> / {{ MAX_TOOLS }}
      </p>

      <ul class="tool-list">
        <li
          v-for="tool in TOOL_POOL"
          :key="tool.id"
          class="tool-row"
          :class="{ 'is-on': isOn(tool.id), 'is-locked': isLocked(tool.id) }"
          @click="toggleTool(tool.id)"
        >
          <span class="tool-icon">
            <IconSvg :name="tool.icon" :size="20" />
          </span>
          <span class="tool-text">
            <b>{{ tool.name }}</b>
            <em>{{ tool.hint }}</em>
            <i>{{ layerInfo(tool) }}</i>
          </span>
          <span class="switch">
            <IconSvg v-if="isOn(tool.id)" name="check" :size="13" />
          </span>
        </li>
      </ul>

      <footer class="panel-foot">
        工具增减在第二层即时生效；第三、四层按新工具的能力重新排布。
      </footer>
    </aside>
  </Transition>
</template>

<style scoped>
.mask {
  position: fixed;
  inset: 0;
  background: rgba(5, 6, 9, 0.55);
  backdrop-filter: blur(2px);
  z-index: 20;
}

.panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(360px, 88vw);
  z-index: 21;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 22px;
  overflow-y: auto;
  background: linear-gradient(180deg, #12161d 0%, #0b0d12 100%);
  border-left: 1px solid var(--line);
  box-shadow: -24px 0 60px rgba(0, 0, 0, 0.55);
}

.panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.panel-head h2 {
  margin: 0 0 6px;
  font-size: 16px;
  letter-spacing: 0.06em;
}

.panel-head p {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--text-faint);
}

.close {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  color: var(--text-dim);
  border: 1px solid var(--line-soft);
  transition: all 0.18s ease;
}

.close:hover {
  color: var(--gold-bright);
  border-color: var(--line);
}

.counter {
  margin: 0;
  font-size: 12px;
  color: var(--text-faint);
}

.counter b {
  color: var(--gold);
}

.tool-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 8px;
}

.tool-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 12px;
  border-radius: 12px;
  cursor: pointer;
  border: 1px solid var(--line-soft);
  background: rgba(255, 255, 255, 0.02);
  transition: all 0.18s ease;
}

.tool-row:hover {
  border-color: rgba(217, 178, 106, 0.26);
  background: rgba(217, 178, 106, 0.05);
}

.tool-row.is-on {
  border-color: rgba(217, 178, 106, 0.42);
  background: rgba(217, 178, 106, 0.08);
}

.tool-row.is-locked {
  cursor: not-allowed;
  opacity: 0.85;
}

.tool-icon {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  color: var(--text-dim);
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid var(--line-soft);
}

.tool-row.is-on .tool-icon {
  color: var(--gold-bright);
}

.tool-text {
  display: grid;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.tool-text b {
  font-size: 13px;
  font-weight: 600;
}

.tool-text em {
  font-style: normal;
  font-size: 11px;
  color: var(--text-faint);
}

.tool-text i {
  font-style: normal;
  font-size: 11px;
  color: var(--gold-soft);
}

.switch {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  border-radius: 6px;
  color: #0c0e13;
  border: 1px solid var(--line-soft);
}

.tool-row.is-on .switch {
  background: var(--gold);
  border-color: var(--gold);
}

.panel-foot {
  margin-top: auto;
  font-size: 11px;
  line-height: 1.7;
  color: var(--text-faint);
  padding-top: 10px;
  border-top: 1px solid var(--line-soft);
}

.mask-enter-active,
.mask-leave-active {
  transition: opacity 0.25s ease;
}

.mask-enter-from,
.mask-leave-to {
  opacity: 0;
}

.drawer-enter-active,
.drawer-leave-active {
  transition:
    transform 0.32s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.32s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(100%);
  opacity: 0.4;
}
</style>
