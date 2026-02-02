import { useEffect, useRef } from 'react'
import type { World, Preview, Canvas } from '../../lib/state/types'
import { drawCanvasObject } from './View'
import { CanvasObjects } from '../../lib/state/canvas-objects'

interface View2DProps {
  world: World
  preview?: Preview
  className?: string
  canvas?: Canvas
}

export function View2D({ world, preview, className, canvas }: View2DProps) {
  const co = CanvasObjects.useState()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cellSize = world.dimX > 9 || world.dimY > 9 ? 34 : 50
  const width = world.dimX * cellSize + 1
  const height = world.dimY * cellSize + 1

  useEffect(() => {
    const canvasElement = canvasRef.current
    if (!canvasElement) return
    const ctx = canvasElement.getContext('2d')
    if (!ctx) return

    // Canvas leeren
    ctx.clearRect(0, 0, width, height)

    for (let y = 0; y < world.dimY; y++) {
      for (let x = 0; x < world.dimX; x++) {
        const cellX = x * cellSize
        const cellY = y * cellSize

        // Gitterlinien in blau zeichnen
        ctx.strokeStyle = 'blue'
        ctx.lineWidth = 1
        ctx.strokeRect(cellX + 0.5, cellY + 0.5, cellSize, cellSize)
      }
    }

    if (co) {
      ctx.save()
      ctx.setTransform(cellSize, 0, 0, cellSize, 0, 0)
      ctx.beginPath()
      ctx.rect(0, 0, world.dimX, world.dimY)
      ctx.clip()
      drawCanvasObject(co, ctx)
      ctx.restore()
    }

    for (let y = 0; y < world.dimY; y++) {
      for (let x = 0; x < world.dimX; x++) {
        const cellX = x * cellSize
        const cellY = y * cellSize
        const brickCount = world.bricks[y][x]

        // Hintergrundfarbe festlegen:
        // - Bei einem Quader: grau
        // - Liegt eine Marke (world.marks) vor: gelb
        // - Sonst, wenn Ziegel (brickCount > 0) vorhanden sind: leicht rotes Overlay (transparent)
        // - Andernfalls: weiß.
        let backgroundColor = 'transparent'
        if (world.blocks?.[y]?.[x]) {
          backgroundColor = 'grey'
        } else if (world.marks?.[y]?.[x]) {
          backgroundColor = 'yellow'
        } else if (brickCount > 0) {
          backgroundColor = 'rgba(255, 0, 0, 0.2)'
        }
        ctx.fillStyle = backgroundColor
        const diff = backgroundColor == 'yellow' ? 1.5 : 1
        ctx.fillRect(cellX + 1, cellY + 1, cellSize - diff, cellSize - diff)

        // Falls in der Vorschau an dieser Stelle eine Marke hinzugefügt werden soll,
        // aber aktuell noch keine Marke vorliegt, zeichne als Platzhalter ein großes "X"
        // mit Umriss – dieses wird **zuerst** gezeichnet, sodass spätere Texte (Ziegelzahl)
        // darüber liegen.
        if (preview && !world.marks?.[y]?.[x] && preview.world.marks[y][x]) {
          ctx.font = '55px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          // Füllung und Umriss für das "X"
          ctx.fillStyle = 'yellow'
          ctx.lineWidth = 2
          const centerX = cellX + cellSize / 2
          const centerY = cellY + cellSize / 2
          ctx.fillText('×', centerX, centerY + 2)
        }

        // Falls aktuell eine Marke gelegt ist, in der Vorschau aber entfernt werden soll,
        // zeichne zwei diagonale schwarze Linien über das ganze Feld.
        if (preview && world.marks?.[y]?.[x] && !preview.world.marks[y][x]) {
          ctx.strokeStyle = 'gray'
          ctx.globalAlpha = 0.5
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(cellX + 4, cellY + 4)
          ctx.lineTo(cellX + cellSize - 4, cellY + cellSize - 4)
          ctx.stroke()
          ctx.beginPath()
          ctx.moveTo(cellX + cellSize - 4, cellY + 4)
          ctx.lineTo(cellX + 4, cellY + cellSize - 4)
          ctx.stroke()
          ctx.globalAlpha = 1
        }

        // Ziegelstapel anzeigen – wenn brickCount > 0,
        // wird die Zahl in Schwarz zentriert dargestellt.
        if (brickCount > 0) {
          ctx.fillStyle = 'black'
          ctx.font = '20px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(
            brickCount.toString(),
            cellX + cellSize / 2,
            cellY + cellSize / 2,
          )
        }

        // Falls eine Vorschau vorliegt, wird in der oberen rechten Ecke die Differenz
        // (preview - brickCount) angezeigt – in roter Farbe.
        if (preview) {
          const previewBrick = preview.world.bricks[y][x]
          const diff = previewBrick - brickCount
          if (diff !== 0) {
            ctx.font = '12px sans-serif'
            ctx.textAlign = 'right'
            ctx.textBaseline = 'top'
            ctx.fillStyle = 'red'
            const diffText = diff > 0 ? `+${diff}` : diff.toString()
            ctx.fillText(diffText, cellX + cellSize - 2, cellY + 2)
          }
        }
      }
    }

    // Karol einzeichnen – als spitzes Dreieck, das in die jeweilige Blickrichtung zeigt.
    if (world.karol) {
      for (let i = 0; i < world.karol.length; i++) {
        const { x, y, dir } = world.karol[i]
        const cx = x * cellSize + cellSize / 2
        const cy = y * cellSize + cellSize / 2
        drawKarol(ctx, cx, cy, dir, cellSize)

        if (world.karol.length > 1) {
          ctx.font = '12px sans-serif'
          ctx.fillStyle = 'black'
          ctx.textAlign = 'right'
          ctx.textBaseline = 'top'
          ctx.fillText((i + 1).toString(), cx + 10, cy + 3)
        }
      }
    }
  }, [world, preview, width, height, cellSize, canvas, co])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
    />
  )
}

/**
 * Zeichnet Karol als spitzes Dreieck, das in die angegebene Richtung zeigt.
 *
 * Die Drehung erfolgt wie folgt:
 * - north: zeigt nach oben (0° Rotation)
 * - east: zeigt nach rechts (90° im Uhrzeigersinn)
 * - south: zeigt nach unten (180°)
 * - west: zeigt nach links (-90°)
 *
 * @param ctx Canvas-RenderingContext2D
 * @param cx x-Koordinate des Zellenmittelpunkts
 * @param cy y-Koordinate des Zellenmittelpunkts
 * @param direction Blickrichtung von Karol
 * @param cellSize Größe der Zelle (zur Skalierung des Dreiecks)
 */
function drawKarol(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  direction: 'north' | 'east' | 'south' | 'west',
  cellSize: number,
) {
  const size = cellSize * 0.4
  let angle = 0
  switch (direction) {
    case 'north':
      angle = 0
      break
    case 'east':
      angle = Math.PI / 2
      break
    case 'south':
      angle = Math.PI
      break
    case 'west':
      angle = -Math.PI / 2
      break
    default:
      angle = 0
  }
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(angle)
  ctx.beginPath()
  ctx.moveTo(0, -size)
  ctx.lineTo(-size / 2, size)
  ctx.lineTo(size / 2, size)
  ctx.closePath()
  ctx.fillStyle = 'black'
  ctx.fill()
  ctx.restore()
}
