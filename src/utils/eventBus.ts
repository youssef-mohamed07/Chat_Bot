// Lightweight event bus for decoupled features (typing, notifications, uploads)
// Simple pub/sub with typed channels

export type EventMap = {
  'typing:start': void
  'typing:stop': void
  'message:new': { role: 'user' | 'assistant'; text?: string }
  'notify': { title: string; body?: string }
  'attachments:add': { files: Array<{ name: string; size: number; type: string; previewUrl?: string }> }
}

type Handler<T> = (payload: T) => void

class EventBus {
  // Use looser internal storage to avoid complex conditional type intersections
  private listeners: Partial<Record<keyof EventMap, Set<Function>>> = {}

  on<K extends keyof EventMap>(event: K, handler: Handler<EventMap[K]>): () => void {
    if (!this.listeners[event]) this.listeners[event] = new Set()
    ;(this.listeners[event] as Set<Function>).add(handler as any)
    return () => this.off(event, handler)
  }

  off<K extends keyof EventMap>(event: K, handler: Handler<EventMap[K]>) {
    (this.listeners[event] as Set<Function> | undefined)?.delete(handler as any)
  }

  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]) {
    (this.listeners[event] as Set<Function> | undefined)?.forEach(h => {
      try { (h as Handler<EventMap[K]>)(payload) } catch { /* noop */ }
    })
  }
}

export const eventBus = new EventBus()
