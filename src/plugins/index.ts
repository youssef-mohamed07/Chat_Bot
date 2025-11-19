import type { ChatMessage, Language } from '../types'

export interface ChatPluginContext {
 lang: Language
 setLang?: (l: Language) => void
 // Allow plugins to append messages
 pushMessage: (msg: ChatMessage) => void
}

export interface ChatPlugin {
 id: string
 init?(ctx: ChatPluginContext): void
 onUserMessage?(msg: ChatMessage, ctx: ChatPluginContext): Promise<void> | void
 onAssistantMessage?(msg: ChatMessage, ctx: ChatPluginContext): Promise<void> | void
 dispose?(): void
}

const registry: ChatPlugin[] = []

export const Plugins = {
 register(plugin: ChatPlugin) {
 if (!registry.find(p => p.id === plugin.id)) registry.push(plugin)
 },
 unregister(id: string) {
 const idx = registry.findIndex(p => p.id === id)
 if (idx >= 0) {
 try { registry[idx].dispose?.() } catch {}
 registry.splice(idx, 1)
 }
 },
 list(): ChatPlugin[] { return [...registry] },
}

export default Plugins
