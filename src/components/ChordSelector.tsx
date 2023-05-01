// ChordSelector.tsx
import React from 'react'
import { Chord } from '../utils/Chords'
import './chords.css' // Add this line to import the CSS

interface ChordSelectorProps {
  chords: Chord[]
  onSelectChord: (chord: Chord) => void
  selectedChord: Chord | null
}

const ChordSelector: React.FC<ChordSelectorProps> = ({ chords, onSelectChord: onSelectChord, selectedChord: selectedChord }) => {
  if (chords.length === 0) {
    return null
  }

  return (
    <div>
      {/* <h2>Select Chord Sub-Key</h2> */}
      <div className="button-container">
        {chords.map((chord) => (
          <button
            key={chord.name}
            className={`subkey-button ${selectedChord === chord ? 'selected' : ''}`}

            // Apply the subkey-button class
            onClick={() => onSelectChord(chord)}
          >
            {chord.name}
          </button>
        ))}
      </div>
    </div>
  )
}

export default ChordSelector
