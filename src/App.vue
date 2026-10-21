<script setup lang="ts">
import { computed } from 'vue'
import Compass from '@/modules/compass/Compass.vue'
import SettingsPanel from '@/modules/settings/SettingsPanel.vue'
import { RINGS } from '@/config/compass.config'

const legend = computed(() => [
  { key: '一', label: '当前工具', note: '' },
  { key: '二', label: '工具与设置', note: String(RINGS[0].capacity) },
  { key: '三', label: '能力', note: String(RINGS[1].capacity) },
  { key: '四', label: '参数', note: String(RINGS[2].capacity) },
])
</script>

<template>
  <div class="app">
    <header class="topbar">
      <div class="brand">
        <span class="mark" />
        <div>
          <h1>罗盘工具栏</h1>
          <p>Compass Toolbar · Vue 3 + TypeScript</p>
        </div>
      </div>
      <nav class="legend">
        <span v-for="item in legend" :key="item.key">
          <i class="k">{{ item.key }}</i>{{ item.label }}
          <em v-if="item.note">· {{ item.note }}</em>
        </span>
      </nav>
    </header>

    <Compass />
    <SettingsPanel />
  </div>
</template>

<style scoped>
.app {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(1100px 700px at 50% 40%, #141a24 0%, transparent 70%),
    radial-gradient(700px 500px at 80% 90%, rgba(217, 178, 106, 0.05), transparent 70%),
    var(--ink-900);
}

.topbar {
  position: relative;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 26px;
  flex-wrap: wrap;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mark {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 1px solid var(--gold);
  position: relative;
  box-shadow: 0 0 14px rgba(217, 178, 106, 0.28);
}

.mark::after {
  content: '';
  position: absolute;
  inset: 7px;
  border-radius: 50%;
  background: var(--gold);
}

.brand h1 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.16em;
}

.brand p {
  margin: 2px 0 0;
  font-size: 11px;
  letter-spacing: 0.14em;
  color: var(--text-faint);
}

.legend {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
  font-size: 12px;
  color: var(--text-faint);
}

.legend span {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.legend em {
  font-style: normal;
  opacity: 0.55;
}

.legend .k {
  display: grid;
  place-items: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  font-style: normal;
  font-size: 11px;
  color: var(--gold);
  border: 1px solid rgba(217, 178, 106, 0.3);
}
</style>
