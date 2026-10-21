import { computed, reactive } from 'vue'
import { MAX_TOOLS } from '@/config/compass.config'
import { DEFAULT_ENABLED_TOOLS, TOOL_POOL, findTool } from '@/config/tools.config'
import type { LayerIndex, ToolConfig, ToolId } from '@/types/compass'

/** 每个工具在第三 / 第四层的选中项 id */
type ToolSelection = Record<ToolId, [string | null, string | null]>

export interface CompassState {
  /** 当前工具 */
  activeToolId: ToolId
  /** 第二层显示的工具（不含设置位） */
  enabledToolIds: ToolId[]
  settingsOpen: boolean
  selection: ToolSelection
}

function createInitialSelection(): ToolSelection {
  return Object.fromEntries(
    TOOL_POOL.map((tool) => [
      tool.id,
      [tool.layers[0][0]?.id ?? null, tool.layers[1][0]?.id ?? null] as [string | null, string | null],
    ]),
  )
}

export const compassState = reactive<CompassState>({
  activeToolId: DEFAULT_ENABLED_TOOLS[1] ?? DEFAULT_ENABLED_TOOLS[0] ?? TOOL_POOL[0].id,
  enabledToolIds: [...DEFAULT_ENABLED_TOOLS],
  settingsOpen: false,
  selection: createInitialSelection(),
})

export const activeTool = computed<ToolConfig | null>(() =>
  findTool(compassState.activeToolId),
)

export const enabledTools = computed<ToolConfig[]>(() =>
  compassState.enabledToolIds
    .map((id) => findTool(id))
    .filter((tool): tool is ToolConfig => tool !== null),
)

export function setActiveTool(id: ToolId): void {
  if (!findTool(id)) return
  compassState.activeToolId = id
}

export function toggleTool(id: ToolId): void {
  const index = compassState.enabledToolIds.indexOf(id)
  if (index >= 0) {
    if (compassState.enabledToolIds.length <= 1) return
    compassState.enabledToolIds.splice(index, 1)
    if (compassState.activeToolId === id) {
      compassState.activeToolId = compassState.enabledToolIds[0]
    }
    return
  }
  if (compassState.enabledToolIds.length >= MAX_TOOLS) return
  compassState.enabledToolIds.push(id)
}

export function selectionOf(id: ToolId): [string | null, string | null] {
  return compassState.selection[id] ?? [null, null]
}

export function selectLayerItem(id: ToolId, layer: LayerIndex, itemId: string): void {
  const pair = compassState.selection[id]
  if (!pair) return
  pair[layer] = itemId
}

export function openSettings(): void {
  compassState.settingsOpen = true
}

export function closeSettings(): void {
  compassState.settingsOpen = false
}
