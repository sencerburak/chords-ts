// NoteSelector.tsx
import React from 'react'
import './chords.css'

interface NoteSelectorProps {
  notes: string[]
  onSelectNote: (chordKey: string) => void
  selectedNote: string | null
}

const NoteSelector: React.FC<NoteSelectorProps> = ({ notes: notes, onSelectNote: onSelectNote, selectedNote: selectedNote }) => {
  return (
    <div>
      {/* <h1>Select Chord Key</h1> */}
      <div className="button-container">
        {notes.map((note) => (
          <button
            key={note}
            className={`key-button ${selectedNote === note ? 'selected' : ''}`}
            onClick={() => onSelectNote(note)}
          >
            {note}
          </button>
        ))}
      </div>
    </div>
  )
}

export default NoteSelector
