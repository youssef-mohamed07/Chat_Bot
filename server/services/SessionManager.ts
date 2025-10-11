import type { ChatMessage } from '../types/index.js'

export class SessionManager {
  private sessions = new Map<string, ChatMessage[]>()

  getSession(userId: string): ChatMessage[] {
    if (!this.sessions.has(userId)) {
      this.sessions.set(userId, [])
    }
    return this.sessions.get(userId)!
  }

  addMessage(userId: string, message: ChatMessage): void {
    const session = this.getSession(userId)
    session.push(message)
  }

  clearSession(userId: string): void {
    this.sessions.delete(userId)
  }

  getAllSessions(): Map<string, ChatMessage[]> {
    return new Map(this.sessions)
  }

  getSessionCount(): number {
    return this.sessions.size
  }
}
