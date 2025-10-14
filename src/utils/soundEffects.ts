// Sound effects utility for enhanced user experience
// Using Web Audio API for better performance and control

class SoundManager {
  private audioContext: AudioContext | null = null
  private sounds: Map<string, AudioBuffer> = new Map()
  private isEnabled: boolean = true

  constructor() {
    // Audio context will be initialized on first user interaction
  }

  private async initAudioContext() {
    if (this.audioContext) return // Already initialized
    
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    } catch (error) {
      console.warn('Web Audio API not supported:', error)
    }
  }

  // Generate simple sound effects using Web Audio API
  private createTone(frequency: number, duration: number, type: OscillatorType = 'sine'): AudioBuffer | null {
    if (!this.audioContext) return null

    const sampleRate = this.audioContext.sampleRate
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate
      let value = 0

      switch (type) {
        case 'sine':
          value = Math.sin(2 * Math.PI * frequency * t)
          break
        case 'square':
          value = Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1
          break
        case 'triangle':
          value = 2 * Math.abs(2 * ((frequency * t) % 1) - 1) - 1
          break
      }

      // Apply envelope to prevent clicks
      const envelope = Math.exp(-t * 3)
      data[i] = value * envelope * 0.1 // Low volume
    }

    return buffer
  }

  private async playSound(buffer: AudioBuffer | null) {
    if (!buffer || !this.isEnabled) return

    // Initialize audio context on first use (after user interaction)
    await this.initAudioContext()
    
    if (!this.audioContext) return

    try {
      const source = this.audioContext.createBufferSource()
      const gainNode = this.audioContext.createGain()
      
      source.buffer = buffer
      source.connect(gainNode)
      gainNode.connect(this.audioContext.destination)
      
      // Fade in/out to prevent clicks
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3)
      
      source.start()
    } catch (error) {
      console.warn('Error playing sound:', error)
    }
  }

  // Predefined sound effects
  async playClick() {
    const buffer = this.createTone(800, 0.1, 'square')
    await this.playSound(buffer)
  }

  async playHover() {
    const buffer = this.createTone(600, 0.05, 'sine')
    await this.playSound(buffer)
  }

  async playSend() {
    const buffer = this.createTone(1000, 0.15, 'triangle')
    await this.playSound(buffer)
  }

  async playReceive() {
    const buffer = this.createTone(400, 0.2, 'sine')
    await this.playSound(buffer)
  }

  async playSuccess() {
    // Two-tone success sound
    const buffer1 = this.createTone(523, 0.1, 'sine') // C5
    const buffer2 = this.createTone(659, 0.1, 'sine') // E5
    
    if (buffer1) await this.playSound(buffer1)
    setTimeout(async () => {
      if (buffer2) await this.playSound(buffer2)
    }, 100)
  }

  async playError() {
    const buffer = this.createTone(200, 0.3, 'square')
    await this.playSound(buffer)
  }

  async playTyping() {
    const buffer = this.createTone(300, 0.05, 'triangle')
    await this.playSound(buffer)
  }

  // Enable/disable sounds
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled
  }

  isSoundEnabled(): boolean {
    return this.isEnabled
  }
}

// Create singleton instance
export const soundManager = new SoundManager()

// Hook for React components
export const useSoundEffects = () => {
  return {
    playClick: () => soundManager.playClick(),
    playHover: () => soundManager.playHover(),
    playSend: () => soundManager.playSend(),
    playReceive: () => soundManager.playReceive(),
    playSuccess: () => soundManager.playSuccess(),
    playError: () => soundManager.playError(),
    playTyping: () => soundManager.playTyping(),
    setEnabled: (enabled: boolean) => soundManager.setEnabled(enabled),
    isEnabled: () => soundManager.isSoundEnabled()
  }
}
