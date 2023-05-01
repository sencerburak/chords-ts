// shape.tsx
import React, { useRef, useEffect } from 'react'
import { ChordShape } from '../utils/Chords'
import { GuitarPlayer } from '../utils/Player'

interface ChordShapeProps {
  chordShape: ChordShape
}

const ChordShapeComponent: React.FC<ChordShapeProps> = ({ chordShape }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) {
      return
    }

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      return
    }

    // Clear the canvas before drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw the fretboard and chord shape
    const frets = 5
    const strings = 6
    const lineWidth = 4
    const yOffset = 40 // Add a yOffset to adjust element positions
    const fretHeight = (canvas.height - lineWidth - yOffset) / frets
    const stringWidth = (canvas.width - lineWidth / 2) / strings

    ctx.lineWidth = lineWidth

    // Draw fretboard
    for (let i = 0; i < strings; i++) {
      ctx.beginPath()
      ctx.moveTo(i * stringWidth + stringWidth / 2, yOffset)
      ctx.lineTo(i * stringWidth + stringWidth / 2, canvas.height)
      ctx.stroke()
    }
    for (let j = 0; j <= frets; j++) {
      ctx.beginPath()
      if (j === 0) {
        ctx.moveTo(stringWidth / 2 - lineWidth, j * fretHeight + lineWidth / 2 + yOffset)
        ctx.lineTo(canvas.width - stringWidth / 2 + lineWidth / 2, j * fretHeight + lineWidth / 2 + yOffset)
        ctx.strokeStyle = 'darkturquoise'
        ctx.lineWidth = lineWidth * 4
      } else {
        ctx.moveTo(stringWidth / 2 - lineWidth / 2, j * fretHeight + lineWidth / 2 + yOffset)
        ctx.lineTo(canvas.width - stringWidth / 2, j * fretHeight + lineWidth / 2 + yOffset)
        ctx.strokeStyle = 'black'
        ctx.lineWidth = lineWidth
      }
      ctx.stroke()
    }

    const drawX = (stringIndex: number) => {
      const xPos = stringIndex * stringWidth + stringWidth / 2
      const yPos = yOffset / 2
      const halfSize = Math.min(stringWidth, fretHeight) / 8

      ctx.strokeStyle = 'black'
      ctx.lineWidth = 4

      ctx.beginPath()
      ctx.moveTo(xPos - halfSize, yPos - halfSize)
      ctx.lineTo(xPos + halfSize, yPos + halfSize)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(xPos - halfSize, yPos + halfSize)
      ctx.lineTo(xPos + halfSize, yPos - halfSize)
      ctx.stroke()
    }

    const drawCircle = (stringIndex: number) => {
      const xPos = stringIndex * stringWidth + stringWidth / 2
      const yPos = yOffset / 2
      const radius = Math.min(stringWidth, fretHeight) / 6

      ctx.strokeStyle = 'black'
      ctx.lineWidth = 4

      ctx.beginPath()
      ctx.arc(xPos, yPos, radius, 0, 2 * Math.PI)
      ctx.stroke()
    }

    // const drawFingerPosition = (position: number, stringIndex: number) => {



    const drawFingerPosition = (position: number, stringIndex: number) => {
      if (position == -1) {
        drawX(stringIndex)
      } else if (position == 0) {
        drawCircle(stringIndex)
      } else {
        const xPos = stringIndex * stringWidth + stringWidth / 2
        const yPos = position * fretHeight - fretHeight / 2 + yOffset
        const radius = Math.min(stringWidth, fretHeight) / 3

        ctx.beginPath()
        ctx.arc(xPos, yPos, radius, 0, 2 * Math.PI)
        ctx.fillStyle = 'darkturquoise'
        ctx.fill()
      }
    }

    // Draw finger positions based on chordShape properties
    drawFingerPosition(chordShape.E2, 0)
    drawFingerPosition(chordShape.A2, 1)
    drawFingerPosition(chordShape.D3, 2)
    drawFingerPosition(chordShape.G3, 3)
    drawFingerPosition(chordShape.B3, 4)
    drawFingerPosition(chordShape.E4, 5)

    // Draw barre if its value is greater than 0
    if (chordShape.Barre > 0) {
      const barreYPos = chordShape.Barre * fretHeight - fretHeight / 4 + yOffset
      drawFingerPosition(chordShape.Barre, 0)
      drawFingerPosition(chordShape.Barre, 5)
      ctx.fillRect(lineWidth / 2 + stringWidth / 2, barreYPos - fretHeight / 2, canvas.width - lineWidth - stringWidth, fretHeight / 2)
    }
  }, [chordShape])

  return (
    <div
      className="chord-shape"
      onClick={() => {
        const myGuitarPlayer = new GuitarPlayer
        console.log('Initializing')
        myGuitarPlayer.initialize()
        console.log('Playing')
        myGuitarPlayer.play(chordShape)
      }
      }
    >
      <canvas ref={canvasRef} width="330" height="440" />
    </div>
  )
}


export default ChordShapeComponent


