import { useEffect, useRef, useState } from 'react'
import { closeModal } from '../../lib/commands/modal'
import { useCore } from '../../lib/state/core'
import { karolDefaultImage, View } from '../helper/View'
import { Heading } from '../../lib/state/types'
import { setAppearance } from '../../lib/storage/storage'

export function AppearanceModal() {
  const [count, setCount] = useState(0)
  const [isDrawing, setIsDrawing] = useState(false)
  const [selectedColor, setSelectedColor] = useState('#000000')
  const [tool, setTool] = useState<'brush' | 'paintBucket' | 'eraser'>('brush')
  const [brushSize, setBrushSize] = useState(3)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const core = useCore()

  // Undo stack: stores ImageData snapshots
  const undoStack = useRef<ImageData[]>([])
  // Flag to ensure one push per drawing operation.
  const hasPushedUndo = useRef(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prevCount) => prevCount + 1)
    }, 750)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Load default image into canvas if available.
    const img = new Image()
    img.src = core.ws.robotImageDataUrl ?? karolDefaultImage
    img.onload = () => {
      ctx.drawImage(img, 0, 0)
      updateImageDataUrl(canvas)
    }
    ctx.imageSmoothingEnabled = false
  }, [])

  const updateImageDataUrl = (canvas: HTMLCanvasElement) => {
    const dataUrl = canvas.toDataURL()
    core.mutateWs((ws) => {
      ws.robotImageDataUrl = dataUrl
    })
  }

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: -1, y: -1 }
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    return {
      x: Math.floor((e.clientX - rect.left) * scaleX),
      y: Math.floor((e.clientY - rect.top) * scaleY),
    }
  }

  // Helper: convert hex to RGBA array.
  const hexToRGBA = (hex: string): [number, number, number, number] => {
    hex = hex.replace('#', '')
    if (hex.length === 3) {
      hex = hex
        .split('')
        .map((c) => c + c)
        .join('')
    }
    const bigint = parseInt(hex, 16)
    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255, 255]
  }

  // Helper: compare two RGBA arrays.
  const colorsEqual = (a: number[], b: number[]) => {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3]
  }

  // Push the current canvas state onto the undo stack.
  const pushUndoState = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    // Capture the current state.
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    undoStack.current.push(imageData)
  }

  // Flood fill implementation for the paint bucket tool.
  const floodFill = (startX: number, startY: number, fillColor: string) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    const width = canvas.width
    const targetColor: [number, number, number, number] = [
      data[(startY * width + startX) * 4],
      data[(startY * width + startX) * 4 + 1],
      data[(startY * width + startX) * 4 + 2],
      data[(startY * width + startX) * 4 + 3],
    ]
    const replacementColor = hexToRGBA(fillColor)
    if (colorsEqual(targetColor, replacementColor)) return

    const stack: [number, number][] = [[startX, startY]]
    while (stack.length) {
      const [x, y] = stack.pop()!
      const index = (y * width + x) * 4
      const currentColor: [number, number, number, number] = [
        data[index],
        data[index + 1],
        data[index + 2],
        data[index + 3],
      ]
      if (!colorsEqual(currentColor, targetColor)) continue

      // Set new color.
      data[index] = replacementColor[0]
      data[index + 1] = replacementColor[1]
      data[index + 2] = replacementColor[2]
      data[index + 3] = replacementColor[3]

      // Add neighbors if within bounds.
      if (x > 0) stack.push([x - 1, y])
      if (x < width - 1) stack.push([x + 1, y])
      if (y > 0) stack.push([x, y - 1])
      if (y < canvas.height - 1) stack.push([x, y + 1])
    }
    ctx.putImageData(imageData, 0, 0)
    updateImageDataUrl(canvas)
  }

  // Draw function for brush and eraser.
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx || !canvas) return
    const { x, y } = getCanvasCoordinates(e)
    const offset = Math.floor(brushSize / 2)
    if (tool === 'eraser') {
      // Eraser clears pixels making them transparent.
      ctx.clearRect(x - offset, y - offset, brushSize, brushSize)
    } else {
      ctx.fillStyle = selectedColor
      ctx.fillRect(x - offset, y - offset, brushSize, brushSize)
    }
    updateImageDataUrl(canvas)
  }

  // Update the preview canvas with a dashed outline for brush/eraser.
  const updatePreview = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const overlayCanvas = previewCanvasRef.current
    const canvas = canvasRef.current
    if (!overlayCanvas || !canvas) return
    const ctx = overlayCanvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height)
    if (tool === 'brush' || tool === 'eraser') {
      const { x, y } = getCanvasCoordinates(e)
      const offset = Math.floor(brushSize / 2)
      ctx.beginPath()
      ctx.setLineDash([2, 2])
      ctx.strokeStyle = tool === 'eraser' ? '#FF0000' : '#000000'
      ctx.strokeRect(x - offset, y - offset, brushSize, brushSize)
      ctx.setLineDash([])
    }
  }

  const clearPreview = () => {
    const overlayCanvas = previewCanvasRef.current
    if (!overlayCanvas) return
    const ctx = overlayCanvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height)
  }

  // Handle mouse down events.
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Push the current state if not already pushed.
    if (!hasPushedUndo.current) {
      pushUndoState()
      hasPushedUndo.current = true
    }
    const { x, y } = getCanvasCoordinates(e)
    if (tool === 'paintBucket') {
      floodFill(x, y, selectedColor)
    } else {
      setIsDrawing(true)
      draw(e)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    updatePreview(e)
    if (!isDrawing || tool === 'paintBucket') return
    draw(e)
  }

  const handleMouseUpOrLeave = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(false)
    hasPushedUndo.current = false
    clearPreview()
  }

  // Handle Undo: restore the last state.
  const handleUndo = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx || undoStack.current.length === 0) return

    const previousState = undoStack.current.pop()!
    ctx.putImageData(previousState, 0, 0)
    updateImageDataUrl(canvas)
  }

  // Handle Reset: push current state and reset to the default image.
  const handleReset = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    pushUndoState()
    const img = new Image()
    img.src = karolDefaultImage
    img.onload = () => {
      // Clear canvas and draw default image.
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      updateImageDataUrl(canvas)
    }
  }

  const colors = [
    '#000000',
    '#FFFFFF',
    '#FF0000',
    '#00FF00',
    '#0000FF',
    '#FFFF00',
    '#FF00FF',
    '#00FFFF',
    '#808080',
    '#C0C0C0',
    '#FFA500', // orange
    '#800080', // purple
    '#008080', // teal
    '#FFC0CB', // pink
    '#A52A2A', // brown
    '#FFD700', // gold
  ]

  return (
    <div
      className="bg-black/20 fixed inset-0 flex justify-center items-center z-[150]"
      onClick={() => {
        setAppearance(core.ws.appearance)
        closeModal(core)
      }}
    >
      {/* Modal width increased to 900px */}
      <div
        className="min-h-[430px] w-[900px] bg-white z-[200] rounded-xl relative flex flex-col px-3 pb-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-center font-bold text-xl mt-5">
          {core.strings.outfit.title}
        </h2>

        <div className="flex justify-center mt-4">
          <div className="w-[200px] h-[200px] flex justify-center items-center">
            <View
              robotImageDataUrl={core.ws.robotImageDataUrl}
              world={{
                dimX: 1,
                dimY: 1,
                karol: {
                  x: 0,
                  y: 0,
                  dir: ['east', 'north', 'west', 'south'][count % 4] as Heading,
                },
                blocks: [[false]],
                marks: [[false]],
                bricks: [[0]],
                height: 1,
              }}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-col items-center">
          {/* Canvas container with refined checkerboard background */}
          <div
            className="relative"
            style={{
              backgroundColor: '#fff',
              backgroundImage:
                'linear-gradient(45deg, #e0e0e0 25%, transparent 25%), linear-gradient(-45deg, #e0e0e0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e0e0e0 75%), linear-gradient(-45deg, transparent 75%, #e0e0e0 75%)',
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
            }}
          >
            {/* Reference image with low opacity */}
            <img
              src={karolDefaultImage}
              alt="Reference"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '800px',
                height: '355px',
                opacity: 0.2,
                pointerEvents: 'none',
                zIndex: 1,
                objectFit: 'cover',
              }}
            />
            {/* Main drawing canvas */}
            <canvas
              ref={canvasRef}
              width={160}
              height={71}
              style={{
                width: '800px',
                height: '355px',
                imageRendering: 'pixelated',
                position: 'relative',
                zIndex: 2,
              }}
              className="border-2 border-gray-300"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
            />
            {/* Overlay canvas for brush preview */}
            <canvas
              ref={previewCanvasRef}
              width={160}
              height={71}
              style={{
                width: '800px',
                height: '355px',
                imageRendering: 'pixelated',
                position: 'absolute',
                top: 0,
                left: 0,
                pointerEvents: 'none',
                zIndex: 3,
              }}
            />
          </div>

          {/* Color Palette */}
          <div className="flex gap-1 mt-4 flex-wrap justify-center">
            {colors.map((color) => (
              <button
                key={color}
                className={`w-8 h-8 border-2 ${
                  selectedColor === color ? 'border-black' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setSelectedColor(color)}
              />
            ))}
          </div>

          {/* Tool Selector */}
          <div className="flex gap-2 mt-4">
            <button
              className={`px-3 py-1 border rounded ${
                tool === 'brush' ? 'bg-gray-300' : 'bg-white'
              }`}
              onClick={() => setTool('brush')}
            >
              Brush
            </button>
            <button
              className={`px-3 py-1 border rounded ${
                tool === 'paintBucket' ? 'bg-gray-300' : 'bg-white'
              }`}
              onClick={() => setTool('paintBucket')}
            >
              Paint Bucket
            </button>
            <button
              className={`px-3 py-1 border rounded ${
                tool === 'eraser' ? 'bg-gray-300' : 'bg-white'
              }`}
              onClick={() => setTool('eraser')}
            >
              Eraser
            </button>
          </div>

          {/* Brush Size (for brush and eraser) */}
          {(tool === 'brush' || tool === 'eraser') && (
            <div className="mt-2">
              <label htmlFor="brushSize" className="mr-2">
                Brush Size: {brushSize}
              </label>
              <input
                id="brushSize"
                type="range"
                min="1"
                max="10"
                value={brushSize}
                onChange={(e) => setBrushSize(parseInt(e.target.value))}
              />
            </div>
          )}

          {/* Undo & Reset Buttons */}
          <div className="flex gap-2 mt-4">
            <button
              className="px-4 py-2 bg-blue-200 hover:bg-blue-300 rounded"
              onClick={handleUndo}
            >
              Undo
            </button>
            <button
              className="px-4 py-2 bg-red-200 hover:bg-red-300 rounded"
              onClick={handleReset}
            >
              Reset
            </button>
          </div>
        </div>

        <div className="text-center mt-4">
          <button
            className="px-4 py-2 bg-green-200 hover:bg-green-300 rounded"
            onClick={() => {
              setAppearance(core.ws.appearance)
              closeModal(core)
            }}
          >
            {core.strings.outfit.close}
          </button>
        </div>
      </div>
    </div>
  )
}
