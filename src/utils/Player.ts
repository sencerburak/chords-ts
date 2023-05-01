// Player.ts
import { ChordShape } from './Chords'
import { AcousticGuitar } from './AcousticGuitar'
import { WebAudioFontPlayer } from './WebAudioFontPlayer'

type GuitarType = typeof AcousticGuitar

export class GuitarPlayer {
  player: WebAudioFontPlayer
  audioContext: AudioContext
  output: AudioNode | null
  guitar: GuitarType | null
  now: number
  _6th: number
  _5th: number
  _4th: number
  _3rd: number
  _2nd: number
  _1st: number

  constructor() {
    this.player = new (WebAudioFontPlayer)()
    this.audioContext = new AudioContext()
    this.output = null
    this.guitar = null
    this.now = 0
    this._6th = 0
    this._5th = 0
    this._4th = 0
    this._3rd = 0
    this._2nd = 0
    this._1st = 0
  }

  async initialize(): Promise<void> {
    this.guitar = AcousticGuitar


    if (typeof AudioContext == "undefined") {
      console.error("Your browser does not support the Web Audio API.")
    }

    this.audioContext = new AudioContext()

    if (this.audioContext) {
      this.output = this.audioContext.destination
    }

    this.player = new (WebAudioFontPlayer)()

    this.now = 0

    const C = 0, Cs = 1, D = 2, Ds = 3, E = 4, F = 5, Fs = 6, G = 7, Gs = 8, A = 9, As = 10, B = 11
    const O = 12

    this._6th = E + O * 3
    this._5th = A + O * 3
    this._4th = D + O * 4
    this._3rd = G + O * 4
    this._2nd = B + O * 4
    this._1st = E + O * 5

    this.player.loader.decodeAfterLoading(this.audioContext, '_tone_0253_Acoustic_Guitar_sf2_file')
  }

  play(chordShape: ChordShape): void {
    console.log('play', chordShape)
    const fingers = [
      Number(chordShape.E2),
      Number(chordShape.A2),
      Number(chordShape.D3),
      Number(chordShape.G3),
      Number(chordShape.B3),
      Number(chordShape.E4),
    ]
    this.player.queueChord(this.audioContext, this.output, this.guitar, this.now, this.pitches(fingers), 1.5, 0.5, [])
  }

  pitches(frets: number[]): number[] {
    const p: number[] = []
    if (frets[0] > -1) p.push(this._6th + frets[0])
    if (frets[1] > -1) p.push(this._5th + frets[1])
    if (frets[2] > -1) p.push(this._4th + frets[2])
    if (frets[3] > -1) p.push(this._3rd + frets[3])
    if (frets[4] > -1) p.push(this._2nd + frets[4])
    if (frets[5] > -1) p.push(this._1st + frets[5])
    return p
  }

  cancel(): void {
    if (this.player && this.audioContext && this.output && this.guitar && this.now) {
      this.player.cancelQueue(this.audioContext)
    }
  }
}
