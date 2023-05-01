// Chords.ts
export interface ChordShapeData {
  E2: number
  A2: number
  D3: number
  G3: number
  B3: number
  E4: number
  Barre: number
}

export class ChordShape {
  public E2: number
  public A2: number
  public D3: number
  public G3: number
  public B3: number
  public E4: number
  public Barre: number

  constructor(data: ChordShapeData) {
    this.E2 = data.E2
    this.A2 = data.A2
    this.D3 = data.D3
    this.G3 = data.G3
    this.B3 = data.B3
    this.E4 = data.E4
    this.Barre = data.Barre
  }
}

export interface ChordData {
  [key: string]: {
    [chordName: string]: ChordShapeData[]
  }
}

export class Chord {
  public key: string
  public name: string
  public shapes: ChordShape[]

  constructor(key: string, name: string, shapesData: ChordShapeData[]) {
    this.key = key
    this.name = name
    this.shapes = shapesData.map(shapeData => new ChordShape(shapeData))
  }
}

export class ChordBook {
  public chords: Chord[]

  constructor(chordsData: ChordData) {
    this.chords = []
    for (const key in chordsData) {
      for (const chordName in chordsData[key]) {
        this.chords.push(new Chord(key, chordName, chordsData[key][chordName]))
      }
    }
  }

  getChord(chordKey: string): Chord | null {
    return this.chords.find(chord => chord.key === chordKey) || null
  }

  getChordsByKey(chordKey: string): Chord[] {
    return this.chords.filter(chord => chord.key === chordKey)
  }
}

export async function getChords(): Promise<ChordData> {
  const request = new Request('chords-data.json', {
    headers: {
      'Accept': 'application/json',
    },
  })
  const data = await fetch(request).then((response) => response.json())
  return data
}
