/**
 * Âm thanh của thư mời: nhạc nền + hiệu ứng, tạo hoàn toàn bằng Web Audio API.
 * - Không cần file âm thanh → không lo bản quyền, không tốn dung lượng tải.
 * - Nếu event.json có "music": "audio/xxx.mp3" thì dùng file đó làm nhạc nền thay cho nhạc tổng hợp.
 * - Trình duyệt chỉ cho phát âm thanh sau khi người dùng chạm → gọi audio.start() trong sự kiện click.
 */
import event from '../config/event.json'

export type Sfx =
  | 'tap'
  | 'whoosh'
  | 'crack'
  | 'paper'
  | 'slide'
  | 'stamp'
  | 'tick'
  | 'chime'
  | 'plane'
  | 'drop'
  | 'pop'
  | 'confetti'
  | 'scribble'

const STORE_KEY = 'invite-sound'
const midi = (n: number) => 440 * 2 ** ((n - 69) / 12)

// Vòng hoà âm C – G – Am – F (76 BPM), giai điệu 8 ô nhịp tự soạn
const BPM = 76
const CHORDS = [
  { bass: 48, tones: [60, 64, 67] },
  { bass: 43, tones: [59, 62, 67] },
  { bass: 45, tones: [57, 60, 64] },
  { bass: 41, tones: [57, 60, 65] },
]
// [nốt MIDI, độ dài tính bằng phách]; 0 = lặng
const MELODY: [number, number][][] = [
  [[76, 2], [79, 1], [77, 1]],
  [[74, 3], [71, 1]],
  [[72, 2], [76, 1], [74, 1]],
  [[72, 4]],
  [[79, 2], [81, 1], [79, 1]],
  [[77, 2], [76, 1], [74, 1]],
  [[76, 2], [72, 1], [74, 1]],
  [[72, 3], [0, 1]],
]
const ARP = [0, 1, 2, 3, 2, 1, 2, 1] // nốt rải theo móc đơn

class AudioEngine {
  private ctx: AudioContext | null = null
  private master!: GainNode
  private music!: GainNode
  private sfxBus!: GainNode
  private reverb!: ConvolverNode
  private noise!: AudioBuffer
  private step = 0
  private nextTime = 0
  private file: HTMLAudioElement | null = null
  private listeners = new Set<() => void>()
  muted = readMuted()

  get started() {
    return !!this.ctx
  }

  subscribe(fn: () => void) {
    this.listeners.add(fn)
    return () => void this.listeners.delete(fn)
  }
  private emit() {
    this.listeners.forEach((f) => f())
  }

  /** Gọi trong sự kiện chạm/click đầu tiên */
  start() {
    if (this.ctx) return void this.ctx.resume()
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AC) return
    const ctx = (this.ctx = new AC())
    this.master = ctx.createGain()
    this.master.gain.value = this.muted ? 0 : 1
    // limiter nhẹ: tránh rè khi nhiều hiệu ứng chồng lên nhau trên loa điện thoại
    const limiter = ctx.createDynamicsCompressor()
    limiter.threshold.value = -10
    limiter.knee.value = 6
    limiter.ratio.value = 8
    limiter.attack.value = 0.003
    limiter.release.value = 0.2
    this.master.connect(limiter).connect(ctx.destination)

    this.reverb = ctx.createConvolver()
    this.reverb.buffer = impulse(ctx, 2.8)
    const wet = ctx.createGain()
    wet.gain.value = 0.35
    this.reverb.connect(wet).connect(this.master)

    this.music = ctx.createGain()
    this.music.gain.value = 0
    this.music.connect(this.master)
    this.music.connect(this.reverb)
    this.sfxBus = ctx.createGain()
    this.sfxBus.gain.value = 0.8
    this.sfxBus.connect(this.master)
    this.sfxBus.connect(this.reverb)

    this.noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
    const d = this.noise.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1

    // nhạc nền nhỏ dần lên trong 4 giây
    this.music.gain.setValueAtTime(0, ctx.currentTime)
    this.music.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 4)
    if (event.music) this.playFile(event.music)
    else this.startScheduler()

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        void ctx.suspend()
        this.file?.pause()
      } else {
        void ctx.resume()
        void this.file?.play().catch(() => {})
      }
    })
    this.emit()
  }

  toggle() {
    if (!this.ctx) this.start()
    this.muted = !this.muted
    try {
      localStorage.setItem(STORE_KEY, this.muted ? 'off' : 'on')
    } catch {
      /* chế độ ẩn danh: bỏ qua */
    }
    if (this.ctx) this.master.gain.setTargetAtTime(this.muted ? 0 : 1, this.ctx.currentTime, 0.08)
    this.emit()
  }

  // ---------------- nhạc nền ----------------
  private playFile(src: string) {
    const el = (this.file = new Audio(`${import.meta.env.BASE_URL}${src}`))
    el.loop = true
    el.crossOrigin = 'anonymous'
    this.ctx!.createMediaElementSource(el).connect(this.music)
    void el.play().catch(() => this.startScheduler())
  }

  private startScheduler() {
    const ctx = this.ctx!
    this.nextTime = ctx.currentTime + 0.1
    const eighth = 60 / BPM / 2
    window.setInterval(() => {
      while (this.nextTime < ctx.currentTime + 0.4) {
        this.scheduleStep(this.step, this.nextTime, eighth)
        this.nextTime += eighth
        this.step++
      }
    }, 60)
  }

  private scheduleStep(step: number, t: number, eighth: number) {
    const bar = Math.floor(step / 8) % 8
    const inBar = step % 8
    const chord = CHORDS[bar % 4]
    const beat = eighth * 2
    if (inBar === 0) {
      this.pluck(midi(chord.bass), t, 3.2, 0.12, this.music, 'sine')
      chord.tones.forEach((n) => this.pad(midi(n), t, beat * 4, this.music))
      // giai điệu của ô nhịp này
      let at = 0
      for (const [note, len] of MELODY[bar]) {
        if (note) this.pluck(midi(note), t + at * beat, 2.6, 0.16, this.music)
        at += len
      }
    }
    const tones = [...chord.tones.map((n) => n + 12), chord.tones[0] + 24]
    this.pluck(midi(tones[ARP[inBar]]), t, 1.4, 0.05, this.music)
  }

  /** Tiếng hộp nhạc / piano nhẹ */
  private pluck(f: number, t: number, decay: number, gain: number, out: AudioNode, type: OscillatorType = 'triangle') {
    const ctx = this.ctx!
    const g = ctx.createGain()
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(gain, t + 0.006)
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay)
    g.connect(out)
    const o1 = ctx.createOscillator()
    o1.type = type
    o1.frequency.value = f
    const o2 = ctx.createOscillator()
    o2.type = 'sine'
    o2.frequency.value = f * 4
    const g2 = ctx.createGain()
    g2.gain.value = 0.12
    o1.connect(g)
    o2.connect(g2).connect(g)
    for (const o of [o1, o2]) {
      o.start(t)
      o.stop(t + decay + 0.05)
    }
  }

  /** Lớp đệm dây mềm */
  private pad(f: number, t: number, dur: number, out: AudioNode) {
    const ctx = this.ctx!
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 900
    const g = ctx.createGain()
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.018, t + dur * 0.35)
    g.gain.linearRampToValueAtTime(0, t + dur + 0.6)
    lp.connect(g).connect(out)
    for (const cents of [-7, 7]) {
      const o = ctx.createOscillator()
      o.type = 'sawtooth'
      o.frequency.value = f
      o.detune.value = cents
      o.connect(lp)
      o.start(t)
      o.stop(t + dur + 0.7)
    }
  }

  // ---------------- hiệu ứng ----------------
  private tone(o: { f: number; f2?: number; dur: number; gain: number; type?: OscillatorType; at?: number; attack?: number }) {
    const ctx = this.ctx!
    const t = ctx.currentTime + (o.at ?? 0)
    const osc = ctx.createOscillator()
    osc.type = o.type ?? 'sine'
    osc.frequency.setValueAtTime(o.f, t)
    if (o.f2) osc.frequency.exponentialRampToValueAtTime(o.f2, t + o.dur)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(o.gain, t + (o.attack ?? 0.005))
    g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur)
    osc.connect(g).connect(this.sfxBus)
    osc.start(t)
    osc.stop(t + o.dur + 0.05)
  }

  private hiss(o: {
    dur: number
    gain: number
    filter?: BiquadFilterType
    f: number
    f2?: number
    q?: number
    at?: number
    attack?: number
  }) {
    const ctx = this.ctx!
    const t = ctx.currentTime + (o.at ?? 0)
    const src = ctx.createBufferSource()
    src.buffer = this.noise
    src.loop = true
    const bp = ctx.createBiquadFilter()
    bp.type = o.filter ?? 'bandpass'
    bp.Q.value = o.q ?? 1
    bp.frequency.setValueAtTime(o.f, t)
    if (o.f2) bp.frequency.exponentialRampToValueAtTime(o.f2, t + o.dur)
    const g = ctx.createGain()
    const atk = o.attack ?? 0.005
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(o.gain, t + atk)
    g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur)
    src.connect(bp).connect(g).connect(this.sfxBus)
    src.start(t, Math.random() * 0.5)
    src.stop(t + o.dur + 0.05)
  }

  private bells(notes: number[], at = 0, gain = 0.12) {
    notes.forEach((n, i) => this.pluck(midi(n), this.ctx!.currentTime + at + i * 0.09, 2.4, gain, this.sfxBus, 'sine'))
  }

  play(name: Sfx) {
    if (!this.ctx || this.muted) return
    switch (name) {
      case 'tap':
        return this.tone({ f: 900, f2: 620, dur: 0.08, gain: 0.12 })
      case 'whoosh':
        return this.hiss({ dur: 0.7, gain: 0.35, f: 280, f2: 2600, q: 0.8, attack: 0.3 })
      case 'crack':
        this.hiss({ dur: 0.09, gain: 0.6, filter: 'highpass', f: 1800 })
        this.tone({ f: 160, f2: 50, dur: 0.25, gain: 0.5 })
        return this.bells([88, 91, 96], 0.05, 0.08)
      case 'paper':
        ;[0, 0.07, 0.16].forEach((at, i) => this.hiss({ at, dur: 0.18, gain: 0.22 - i * 0.05, f: 1400, f2: 700, q: 1.2 }))
        return
      case 'slide':
        return this.hiss({ dur: 0.8, gain: 0.18, filter: 'lowpass', f: 700, f2: 2600, attack: 0.25 })
      case 'stamp':
        this.tone({ f: 150, f2: 42, dur: 0.3, gain: 0.85 })
        return this.hiss({ dur: 0.06, gain: 0.5, filter: 'lowpass', f: 900 })
      case 'tick':
        return this.hiss({ dur: 0.025, gain: 0.18, filter: 'highpass', f: 3200 })
      case 'chime':
        return this.bells([84, 88, 91, 96])
      case 'plane':
        this.hiss({ dur: 2.6, gain: 0.22, f: 350, f2: 1600, q: 1.4, attack: 1.1 })
        return this.tone({ f: 190, f2: 150, dur: 2.4, gain: 0.03, type: 'sawtooth', attack: 1 })
      case 'drop':
        this.tone({ f: 110, f2: 40, dur: 0.35, gain: 0.55 })
        return this.hiss({ dur: 0.12, gain: 0.3, filter: 'lowpass', f: 600 })
      case 'pop':
        this.tone({ f: 700, f2: 220, dur: 0.1, gain: 0.3, type: 'triangle' })
        return this.hiss({ dur: 0.05, gain: 0.25, filter: 'highpass', f: 1500 })
      case 'confetti':
        for (let i = 0; i < 7; i++) {
          const at = i * 0.06 + Math.random() * 0.05
          this.tone({ at, f: 500 + Math.random() * 500, f2: 180, dur: 0.09, gain: 0.22, type: 'triangle' })
          this.hiss({ at, dur: 0.05, gain: 0.2, filter: 'highpass', f: 2000 })
        }
        this.hiss({ at: 0.1, dur: 1.6, gain: 0.06, filter: 'highpass', f: 5000, attack: 0.2 }) // tiếng giấy rơi
        return this.bells([79, 84, 88, 91, 96], 0.15, 0.1)
      case 'scribble':
        for (let i = 0; i < 12; i++) this.hiss({ at: i * 0.11, dur: 0.08, gain: 0.05, f: 2600 + Math.random() * 1200, q: 3 })
        return
    }
  }
}

function readMuted() {
  try {
    return localStorage.getItem(STORE_KEY) === 'off'
  } catch {
    return false
  }
}

/** Tạo xung phản hồi tiếng vang (reverb) */
function impulse(ctx: AudioContext, seconds: number) {
  const len = Math.floor(ctx.sampleRate * seconds)
  const buf = ctx.createBuffer(2, len, ctx.sampleRate)
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c)
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3
  }
  return buf
}

export const audio = new AudioEngine()
export const sfx = (name: Sfx) => audio.play(name)

// Chỉ ở chế độ dev: cho script kiểm thử ghi âm lại
if (import.meta.env.DEV) (window as unknown as { __audio: AudioEngine }).__audio = audio
