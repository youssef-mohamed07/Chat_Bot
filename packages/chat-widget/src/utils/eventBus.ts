// ===================================
// EVENT BUS
// Lightweight pub/sub for UI events
// ===================================

export type EventMap = {
  'typing:start': void
  'typing:stop': void
  'message:new': { role: 'user' | 'assistant'; text?: string }
  'notify': { title: string; body?: string }
  'attachments:add': { files: Array<{ name: string; size: number; type: string; previewUrl?: string }> }
}

type Handler<T> = (payload: T) => void

class EventBus {
  private listeners: Partial<Record<keyof EventMap, Set<Function>>> = {}

  on<K extends keyof EventMap>(event: K, handler: Handler<EventMap[K]>): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set()
    }
    ;(this.listeners[event] as Set<Function>).add(handler as any)
    
    // Return unsubscribe function
    return () => this.off(event, handler)
  }

  off<K extends keyof EventMap>(event: K, handler: Handler<EventMap[K]>): void {
    (this.listeners[event] as Set<Function> | undefined)?.delete(handler as any)
  }

  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void {
    (this.listeners[event] as Set<Function> | undefined)?.forEach(h => {
      try {
        (h as Handler<EventMap[K]>)(payload)
      } catch (error) {
        console.error('Event handler error:', error)
      }
    })
  }

  clear(): void {
    this.listeners = {}
  }
}

export const eventBus = new EventBus()
