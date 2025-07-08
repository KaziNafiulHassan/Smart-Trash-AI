/**
 * Game Sound Service for EcoSort Adventures
 * Provides immersive audio feedback for enhanced user engagement
 */

export type SoundType = 
  | 'drag-start'
  | 'drag-hover'
  | 'drop-correct'
  | 'drop-incorrect'
  | 'level-complete'
  | 'game-start'
  | 'timer-warning'
  | 'timer-tick'
  | 'achievement-unlock'
  | 'button-click'
  | 'popup-open'
  | 'popup-close'
  | 'feedback-positive'
  | 'feedback-negative'
  | 'confetti'
  | 'whoosh'
  | 'sparkle';

interface SoundConfig {
  volume: number;
  playbackRate?: number;
  loop?: boolean;
  fadeIn?: boolean;
  fadeOut?: boolean;
}

interface GameSoundSettings {
  enabled: boolean;
  masterVolume: number;
  effectsVolume: number;
  musicVolume: number;
}

class GameSoundService {
  private audioContext: AudioContext | null = null;
  private sounds: Map<SoundType, AudioBuffer> = new Map();
  private activeSources: Set<AudioBufferSourceNode> = new Set();
  private settings: GameSoundSettings;
  private isInitialized = false;

  constructor() {
    this.settings = this.loadSettings();
    this.initializeAudioContext();
  }

  private loadSettings(): GameSoundSettings {
    const saved = localStorage.getItem('ecosort-sound-settings');
    return saved ? JSON.parse(saved) : {
      enabled: true,
      masterVolume: 0.7,
      effectsVolume: 0.8,
      musicVolume: 0.5
    };
  }

  private saveSettings(): void {
    localStorage.setItem('ecosort-sound-settings', JSON.stringify(this.settings));
  }

  private async initializeAudioContext(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      await this.generateSounds();
      this.isInitialized = true;
      console.log('Game sound service initialized successfully');
    } catch (error) {
      console.warn('Failed to initialize audio context:', error);
    }
  }

  /**
   * Generate procedural sounds using Web Audio API
   * This eliminates the need for external audio files
   */
  private async generateSounds(): Promise<void> {
    if (!this.audioContext) return;

    const sampleRate = this.audioContext.sampleRate;
    
    // Generate different sound types
    const soundGenerators = {
      'drag-start': () => this.generateTone(800, 0.1, 'sine', 0.3),
      'drag-hover': () => this.generateTone(600, 0.05, 'sine', 0.2),
      'drop-correct': () => this.generateSuccessSound(),
      'drop-incorrect': () => this.generateErrorSound(),
      'level-complete': () => this.generateVictorySound(),
      'game-start': () => this.generateStartSound(),
      'timer-warning': () => this.generateWarningSound(),
      'timer-tick': () => this.generateTone(400, 0.1, 'square', 0.1),
      'achievement-unlock': () => this.generateAchievementSound(),
      'button-click': () => this.generateTone(1000, 0.05, 'square', 0.2),
      'popup-open': () => this.generateTone(660, 0.2, 'sine', 0.3),
      'popup-close': () => this.generateTone(440, 0.15, 'sine', 0.2),
      'feedback-positive': () => this.generatePositiveFeedback(),
      'feedback-negative': () => this.generateNegativeFeedback(),
      'confetti': () => this.generateConfettiSound(),
      'whoosh': () => this.generateWhooshSound(),
      'sparkle': () => this.generateSparkleSound()
    };

    for (const [soundType, generator] of Object.entries(soundGenerators)) {
      try {
        const buffer = await generator();
        this.sounds.set(soundType as SoundType, buffer);
      } catch (error) {
        console.warn(`Failed to generate sound: ${soundType}`, error);
      }
    }
  }

  private async generateTone(
    frequency: number, 
    duration: number, 
    type: OscillatorType = 'sine',
    volume: number = 0.5
  ): Promise<AudioBuffer> {
    if (!this.audioContext) throw new Error('Audio context not available');

    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      let sample = 0;

      switch (type) {
        case 'sine':
          sample = Math.sin(2 * Math.PI * frequency * t);
          break;
        case 'square':
          sample = Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1;
          break;
        case 'triangle':
          sample = (2 / Math.PI) * Math.asin(Math.sin(2 * Math.PI * frequency * t));
          break;
        case 'sawtooth':
          sample = 2 * (t * frequency - Math.floor(t * frequency + 0.5));
          break;
      }

      // Apply envelope (fade in/out)
      const envelope = Math.min(
        1,
        Math.min(i / (sampleRate * 0.01), (length - i) / (sampleRate * 0.05))
      );
      
      data[i] = sample * volume * envelope;
    }

    return buffer;
  }

  private async generateSuccessSound(): Promise<AudioBuffer> {
    if (!this.audioContext) throw new Error('Audio context not available');

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.5;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    // Create a pleasant ascending chord
    const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
    
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      let sample = 0;
      
      frequencies.forEach((freq, index) => {
        const delay = index * 0.1;
        if (t >= delay) {
          sample += Math.sin(2 * Math.PI * freq * (t - delay)) * 0.3;
        }
      });

      // Apply envelope
      const envelope = Math.exp(-t * 3) * Math.min(1, i / (sampleRate * 0.01));
      data[i] = sample * envelope;
    }

    return buffer;
  }

  private async generateErrorSound(): Promise<AudioBuffer> {
    if (!this.audioContext) throw new Error('Audio context not available');

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.3;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    // Create a descending dissonant sound
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const freq1 = 200 - (t * 50); // Descending tone
      const freq2 = 150 - (t * 30); // Slightly different descending tone
      
      const sample = (
        Math.sin(2 * Math.PI * freq1 * t) * 0.4 +
        Math.sin(2 * Math.PI * freq2 * t) * 0.3
      );

      // Apply envelope
      const envelope = Math.exp(-t * 5) * Math.min(1, i / (sampleRate * 0.01));
      data[i] = sample * envelope;
    }

    return buffer;
  }

  private async generateVictorySound(): Promise<AudioBuffer> {
    if (!this.audioContext) throw new Error('Audio context not available');

    const sampleRate = this.audioContext.sampleRate;
    const duration = 1.5;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    // Create a triumphant fanfare
    const melody = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      let sample = 0;
      
      melody.forEach((freq, index) => {
        const noteStart = index * 0.3;
        const noteEnd = noteStart + 0.4;
        
        if (t >= noteStart && t <= noteEnd) {
          const noteTime = t - noteStart;
          sample += Math.sin(2 * Math.PI * freq * noteTime) * 0.25;
          // Add harmonics for richness
          sample += Math.sin(2 * Math.PI * freq * 2 * noteTime) * 0.1;
        }
      });

      // Apply envelope
      const envelope = Math.min(1, Math.min(i / (sampleRate * 0.02), (length - i) / (sampleRate * 0.1)));
      data[i] = sample * envelope;
    }

    return buffer;
  }

  private async generateStartSound(): Promise<AudioBuffer> {
    return this.generateTone(440, 0.3, 'sine', 0.4);
  }

  private async generateWarningSound(): Promise<AudioBuffer> {
    if (!this.audioContext) throw new Error('Audio context not available');

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.2;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    // Create an urgent beeping sound
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const freq = 800 + Math.sin(t * 20) * 100; // Oscillating frequency
      const sample = Math.sin(2 * Math.PI * freq * t) * 0.5;
      
      // Apply envelope
      const envelope = Math.min(1, Math.min(i / (sampleRate * 0.01), (length - i) / (sampleRate * 0.01)));
      data[i] = sample * envelope;
    }

    return buffer;
  }

  private async generateAchievementSound(): Promise<AudioBuffer> {
    return this.generateSuccessSound(); // Reuse success sound for achievements
  }

  private async generatePositiveFeedback(): Promise<AudioBuffer> {
    return this.generateTone(880, 0.2, 'sine', 0.3);
  }

  private async generateNegativeFeedback(): Promise<AudioBuffer> {
    return this.generateTone(220, 0.2, 'sine', 0.3);
  }

  private async generateConfettiSound(): Promise<AudioBuffer> {
    if (!this.audioContext) throw new Error('Audio context not available');

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.8;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    // Create sparkly confetti sound
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      let sample = 0;
      
      // Multiple high-frequency tones with random timing
      for (let j = 0; j < 5; j++) {
        const freq = 1000 + j * 200 + Math.random() * 100;
        const phase = Math.random() * Math.PI * 2;
        sample += Math.sin(2 * Math.PI * freq * t + phase) * 0.1 * Math.random();
      }

      // Apply envelope
      const envelope = Math.exp(-t * 2) * Math.min(1, i / (sampleRate * 0.01));
      data[i] = sample * envelope;
    }

    return buffer;
  }

  private async generateWhooshSound(): Promise<AudioBuffer> {
    if (!this.audioContext) throw new Error('Audio context not available');

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.4;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    // Create a whoosh sound using filtered noise
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const noise = (Math.random() - 0.5) * 2;
      const freq = 200 - (t * 150); // Descending frequency
      const filter = Math.sin(2 * Math.PI * freq * t);
      
      const sample = noise * filter * 0.3;
      
      // Apply envelope
      const envelope = Math.exp(-t * 3) * Math.min(1, i / (sampleRate * 0.01));
      data[i] = sample * envelope;
    }

    return buffer;
  }

  private async generateSparkleSound(): Promise<AudioBuffer> {
    return this.generateTone(1200, 0.15, 'sine', 0.2);
  }

  /**
   * Play a sound effect
   */
  public async playSound(
    soundType: SoundType, 
    config: Partial<SoundConfig> = {}
  ): Promise<void> {
    if (!this.settings.enabled || !this.isInitialized || !this.audioContext) {
      return;
    }

    const buffer = this.sounds.get(soundType);
    if (!buffer) {
      console.warn(`Sound not found: ${soundType}`);
      return;
    }

    try {
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = buffer;
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Apply configuration
      const volume = (config.volume ?? 1) * this.settings.effectsVolume * this.settings.masterVolume;
      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
      
      if (config.playbackRate) {
        source.playbackRate.setValueAtTime(config.playbackRate, this.audioContext.currentTime);
      }

      source.loop = config.loop ?? false;

      // Track active sources for cleanup
      this.activeSources.add(source);
      source.onended = () => {
        this.activeSources.delete(source);
      };

      source.start();
    } catch (error) {
      console.warn(`Failed to play sound: ${soundType}`, error);
    }
  }

  /**
   * Update sound settings
   */
  public updateSettings(newSettings: Partial<GameSoundSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  /**
   * Get current settings
   */
  public getSettings(): GameSoundSettings {
    return { ...this.settings };
  }

  /**
   * Stop all currently playing sounds
   */
  public stopAllSounds(): void {
    this.activeSources.forEach(source => {
      try {
        source.stop();
      } catch (error) {
        // Source might already be stopped
      }
    });
    this.activeSources.clear();
  }

  /**
   * Initialize audio context on user interaction (required by browsers)
   */
  public async resumeAudioContext(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }
}

// Export singleton instance
export const gameSoundService = new GameSoundService();
