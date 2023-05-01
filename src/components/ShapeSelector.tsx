// ShapeSelector.tsx
import React, { useState, useEffect } from 'react'

import { Chord, ChordShape } from '../utils/Chords'
import './chords.css'


interface ShapeCircleProps {
  isSelected: boolean
}

const ShapeCircle: React.FC<ShapeCircleProps> = ({ isSelected }) => {
  return (
    <div
      style={{
        width: '15px',
        height: '15px',
        borderRadius: '50%',
        backgroundColor: isSelected ? 'black' : 'transparent',
        border: '1px solid black',
        margin: '0 3px',
      }}
    />
  )
}


interface ShapeSelectorProps {
  chord: Chord | null
  onSelectShape: (chordName: string, shape: ChordShape) => void
  selectedShape: ChordShape | null
}

// Replace the ShapeSelector component with this updated code
const ShapeSelector: React.FC<ShapeSelectorProps> = ({
  chord,
  onSelectShape,
  selectedShape,
}) => {
  const [selectedShapeIndex, setSelectedShapeIndex] = useState(0)

  useEffect(() => {
    if (chord) {
      setSelectedShapeIndex(chord.shapes.findIndex((shape) => shape === selectedShape))
    }
  }, [chord, selectedShape])

  if (!chord) {
    return null
  }

  const previousShape = () => {
    const newIndex = selectedShapeIndex === 0 ? chord.shapes.length - 1 : selectedShapeIndex - 1
    setSelectedShapeIndex(newIndex)
    onSelectShape(chord.name, chord.shapes[newIndex])
  }

  const nextShape = () => {
    const newIndex = (selectedShapeIndex + 1) % chord.shapes.length
    setSelectedShapeIndex(newIndex)
    onSelectShape(chord.name, chord.shapes[newIndex])
  }


  return (
    <div>
      <div className="arrow-container">
        <div
          className="arrow-left"
          onClick={previousShape}
        ></div>
        {chord.shapes.map((_, index) => (
          <div
            key={index}
            className={`circle ${selectedShapeIndex === index ? 'filled' : ''}`}
            onClick={() => {
              setSelectedShapeIndex(index)
              onSelectShape(chord.name, chord.shapes[index])
            }}
          ></div>
        ))}
        <div
          className="arrow-right"
          onClick={nextShape}
        ></div>
      </div>
    </div>
  )
}


export default ShapeSelector
