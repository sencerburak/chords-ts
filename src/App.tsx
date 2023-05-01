// index.tsx
import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { Chord, ChordBook, ChordData, ChordShape, getChords } from './utils/Chords'
import NoteSelector from './components/NoteSelector'
import ChordSelector from './components/ChordSelector'
import ShapeSelector from './components/ShapeSelector'
import ChordShapeComponent from './components/Shape'


const rootElement = document.getElementById("root") as HTMLElement
const root = ReactDOM.createRoot(rootElement)

const App: React.FC = () => {
  const [chordsData, setChordsData] = useState<ChordData | null>(null)
  const [chordBook, setChordBook] = useState<ChordBook | null>(null)
  const [selectedChordKey, setSelectedChordKey] = useState<string | null>('A')
  const [selectedChord, setSelectedChord] = useState<Chord | null>(null)
  const [selectedChordName, setSelectedChordName] = useState<string | null>(null)
  const [selectedChordShape, setSelectedChordShape] = useState<ChordShape | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const data = await getChords()
      setChordsData(data)
      const newChordBook = new ChordBook(data)
      setChordBook(newChordBook)

      // Set initial values
      const initialNote = 'A'
      const initialChord = newChordBook.getChordsByKey(initialNote)[0]
      const initialChordShape = initialChord.shapes[0]
      setSelectedChordKey(initialNote)
      setSelectedChord(initialChord)
      setSelectedChordName(initialChord.name)
      setSelectedChordShape(initialChordShape)
    }
    fetchData()
  }, [])


  const selectNote = (newChordKey: string) => {
    const subKeys = chordBook?.getChordsByKey(newChordKey) || []
    const firstChordInKey = subKeys[0]
    const firstShapeInChord = firstChordInKey?.shapes[0]

    setSelectedChordKey(newChordKey)
    setSelectedChord(firstChordInKey)
    setSelectedChordName(firstChordInKey?.name)
    setSelectedChordShape(firstShapeInChord)
  }


  const selectSubKey = (newSubKey: Chord) => {
    const firstShapeInChord = newSubKey.shapes[0]

    setSelectedChord(newSubKey)
    setSelectedChordName(newSubKey.name)
    setSelectedChordShape(firstShapeInChord)
  }


  const selectChordShape = (chordName: string, shape: ChordShape) => {
    setSelectedChordName(chordName)
    setSelectedChordShape(shape)
  }

  return (
    <div>
      <div className="key-container">
        <NoteSelector
          notes={Object.keys(chordsData || {})}
          onSelectNote={selectNote}
          selectedNote={selectedChordKey}
        />
        <br />
        <ChordSelector
          chords={chordBook?.getChordsByKey(selectedChordKey || '') || []}
          onSelectChord={selectSubKey}
          selectedChord={selectedChord}
        />
      </div>
      <h1 className="key-container">{selectedChordName}</h1>
      <div className="shape-container">
        {selectedChordShape && <ChordShapeComponent chordShape={selectedChordShape} />}
      </div>
      <br />
      <div className="button-container">
        <ShapeSelector
          chord={selectedChord}
          onSelectShape={selectChordShape}
          selectedShape={selectedChordShape}
        />
      </div>

    </div>
  )

}

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
