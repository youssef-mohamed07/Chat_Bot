// ===================================
// PLUGIN SYSTEM
// Extensibility framework for chat
// ===================================

import type { Language, FrontendChatMessage } from '@/types/index'

export interface ChatPluginContext {
  lang: Language
  setLang?: (l: Language) => void
  pushMessage: (msg: FrontendChatMessage) => void
}

export interface ChatPlugin {
  id: string
  init?(ctx: ChatPluginContext): void
  onUserMessage?(msg: FrontendChatMessage, ctx: ChatPluginContext): Promise<void> | void
  onAssistantMessage?(msg: FrontendChatMessage, ctx: ChatPluginContext): Promise<void> | void
  dispose?(): void
}

const registry: ChatPlugin[] = []

export const Plugins = {
  register(plugin: ChatPlugin) {
    if (!registry.find(p => p.id === plugin.id)) {
      registry.push(plugin)
    }
  },
  unregister(id: string) {
    const idx = registry.findIndex(p => p.id === id)
    if (idx >= 0) {
      try {
        registry[idx].dispose?.()
      } catch (error) {
        console.error('Plugin dispose error:', error)
      }
      registry.splice(idx, 1)
    }
  },
  list(): ChatPlugin[] {
    return [...registry]
  },
}

export default Plugins
