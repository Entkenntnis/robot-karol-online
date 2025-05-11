import React, { useEffect, useRef, useState } from 'react'
import { closeModal } from '../../lib/commands/modal'
import { useCore } from '../../lib/state/core'
import { View } from '../helper/View'
import { Heading } from '../../lib/state/types'
import { setRobotImage } from '../../lib/storage/storage'
import { FaIcon } from '../helper/FaIcon'
import {
  faArrowLeft,
  faArrowRight,
  faEraser,
  faFillDrip,
  faPaintBrush,
  faStar,
  faUndo,
} from '@fortawesome/free-solid-svg-icons'
import { submitAnalyzeEvent } from '../../lib/commands/analyze'
import { backend } from '../../backend'
import { karolDefaultImage } from '../../lib/data/images'

export function AppearanceModal() {
  const [count, setCount] = useState(0)
  const [isDrawing, setIsDrawing] = useState(false)
  const lastDrawingPosition = useRef({ x: 0, y: 0 })
  const [selectedColor, setSelectedColor] = useState('#000000')
  const [tool, setTool] = useState<
    'brush' | 'paintBucket' | 'eraser' | 'line' | 'rectangle' | 'ellipse'
  >('brush')
  const [brushSize, setBrushSize] = useState(3)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const core = useCore()

  const [originalImage] = useState(() => {
    return core.ws.robotImageDataUrl
  })

  // Undo-Stack: speichert ImageData-Snapshots
  const undoStack = useRef<ImageData[]>([])
  // Flag, um pro Zeichenvorgang nur einmal zu pushen.
  const hasPushedUndo = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Lade Standardbild in die Leinwand, falls vorhanden.
    const img = new Image()
    img.src = core.ws.robotImageDataUrl ?? karolDefaultImage
    img.onload = () => {
      ctx.drawImage(img, 0, 0)
      updateImageDataUrl(canvas)
    }
    ctx.imageSmoothingEnabled = false
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateImageDataUrl = (canvas: HTMLCanvasElement) => {
    const dataUrl = canvas.toDataURL()
    core.mutateWs((ws) => {
      ws.robotImageDataUrl = dataUrl
    })
  }

  // Unterstützt sowohl Maus- als auch Touch-Events.
  const getCanvasCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: -1, y: -1 }
    const rect = canvas.getBoundingClientRect()
    let clientX: number, clientY: number
    if ('touches' in e) {
      // Bei touchend können keine touches vorhanden sein – verwende changedTouches.
      if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX
        clientY = e.touches[0].clientY
      } else {
        clientX = e.changedTouches[0].clientX
        clientY = e.changedTouches[0].clientY
      }
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    return {
      x: Math.floor((clientX - rect.left) * scaleX),
      y: Math.floor((clientY - rect.top) * scaleY),
    }
  }

  // Hilfsfunktion: Konvertiert hex in RGBA-Array.
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

  // Hilfsfunktion: Vergleicht zwei RGBA-Arrays.
  const colorsEqual = (a: number[], b: number[]) => {
    const tolerance = 20 // ungefähr 5% von 255
    return (
      Math.abs(a[0] - b[0]) <= tolerance &&
      Math.abs(a[1] - b[1]) <= tolerance &&
      Math.abs(a[2] - b[2]) <= tolerance &&
      Math.abs(a[3] - b[3]) <= tolerance
    )
  }

  // Schiebt den aktuellen Zustand der Leinwand auf den Undo-Stack.
  const pushUndoState = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    // Zustand erfassen.
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    undoStack.current.push(imageData)
  }

  // Flood-Fill-Implementierung für das Farbeimer-Werkzeug.
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

      // Neue Farbe setzen.
      data[index] = replacementColor[0]
      data[index + 1] = replacementColor[1]
      data[index + 2] = replacementColor[2]
      data[index + 3] = replacementColor[3]

      // Nachbarn hinzufügen, wenn innerhalb der Grenzen.
      if (x > 0) stack.push([x - 1, y])
      if (x < width - 1) stack.push([x + 1, y])
      if (y > 0) stack.push([x, y - 1])
      if (y < canvas.height - 1) stack.push([x, y + 1])
    }
    ctx.putImageData(imageData, 0, 0)
    updateImageDataUrl(canvas)
  }

  const drawLineTo = (
    ctx: CanvasRenderingContext2D,
    toolCall: (ctx: CanvasRenderingContext2D, x: number, y: number) => void,
    from: { x: number; y: number },
    to: { x: number; y: number },
    offset: number
  ) => {
    ctx.save()
    const distance = Math.sqrt((to.x - from.x) ** 2 + (to.y - from.y) ** 2) // a global distance function might be useful
    // interpolating between last and current position as to avoid gaps
    // moveTo and lineTo do not work here because of anti-aliasing
    let stepSize = 1 // looks the best
    for (let d = 0; d < distance; d += stepSize) {
      toolCall(
        // vector normalization could also be a global function
        ctx,
        Math.round(from.x + (d * (to.x - from.x)) / distance - offset),
        Math.round(from.y + (d * (to.y - from.y)) / distance - offset)
      )
    }
    toolCall(ctx, to.x - offset, to.y - offset)
    ctx.restore()
  }

  const drawRectangle = (
    ctx: CanvasRenderingContext2D,
    toolCall: (ctx: CanvasRenderingContext2D, x: number, y: number) => void,
    from: { x: number; y: number },
    to: { x: number; y: number },
    offset: number
  ) => {
    ctx.save()
    drawLineTo(ctx, toolCall, from, { x: from.x, y: to.y }, offset)
    drawLineTo(ctx, toolCall, from, { x: to.x, y: from.y }, offset)
    drawLineTo(ctx, toolCall, to, { x: from.x, y: to.y }, offset)
    drawLineTo(ctx, toolCall, to, { x: to.x, y: from.y }, offset)
    ctx.restore()
  }

  const drawEllipse = (
    ctx: CanvasRenderingContext2D,
    toolCall: (ctx: CanvasRenderingContext2D, x: number, y: number) => void,
    from: { x: number; y: number },
    to: { x: number; y: number },
    offset: number
  ) => {
    ctx.save()
    let a = (to.x - from.x) / 2
    let b = (to.y - from.y) / 2
    let step = (Math.PI * 2) / 100 // looks okay
    let lastPoint = { x: 0, y: 0 }
    for (let theta = 0; theta <= Math.PI * 2; theta += step) {
      // sample point
      let x = Math.round(a * Math.sin(theta) + from.x + a)
      let y = Math.round(b * Math.cos(theta) + from.y + b)
      if (theta === 0) lastPoint = { x, y }
      drawLineTo(ctx, toolCall, lastPoint, { x, y }, offset)
      // save last point
      lastPoint = { x, y }
    }
    ctx.restore()
  }

  // Zeichnen für Pinsel, Linie und Radiergummi.
  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx || !canvas) return

    const { x, y } = getCanvasCoordinates(e)
    const offset = Math.floor(brushSize / 2)

    let toolCall: (ctx: CanvasRenderingContext2D, x: number, y: number) => void
    if (tool === 'eraser') {
      // Beim Radiergummi werden Pixel gelöscht (transparent gemacht).
      toolCall = (ctx: CanvasRenderingContext2D, x: number, y: number) =>
        ctx.clearRect(x, y, brushSize, brushSize)
    } else {
      ctx.fillStyle = selectedColor
      toolCall = (ctx: CanvasRenderingContext2D, x: number, y: number) =>
        ctx.fillRect(x, y, brushSize, brushSize)
    }

    const previewCanvas = previewCanvasRef.current
    const previewCtx = previewCanvas?.getContext('2d')
    if (!previewCtx || !canvas) return

    if (tool === 'line') {
      if (isDrawing) {
        previewCtx.save() // for safety
        previewCtx.fillStyle = selectedColor
        drawLineTo(previewCtx, toolCall, lastDrawingPosition.current, { x, y }, offset)
        previewCtx.restore()
      } else {
        // only store this at the start of a new line!
        lastDrawingPosition.current = { x, y }
      }
    } else if (tool === 'rectangle') {
      if (isDrawing) {
        previewCtx.save() // for safety
        previewCtx.fillStyle = selectedColor
        drawRectangle(
          previewCtx,
          toolCall,
          lastDrawingPosition.current,
          { x, y },
          offset
        )
        previewCtx.restore()
      } else {
        // only store this at the start of a new line!
        lastDrawingPosition.current = { x, y }
      }
    } else if (tool === 'ellipse') {
      if (isDrawing) {
        previewCtx.save() // for safety
        previewCtx.fillStyle = selectedColor
        drawEllipse(previewCtx, toolCall, lastDrawingPosition.current, { x, y }, offset)
        previewCtx.restore()
      } else {
        // only store this at the start of a new line!
        lastDrawingPosition.current = {x, y}
      }
    } else {
      if (isDrawing) {
        drawLineTo(ctx, toolCall, lastDrawingPosition.current, { x, y }, offset)
      }
      // always draw at least one point
      ctx.save()
      toolCall(ctx, x - offset, y - offset)
      ctx.restore()
      // store the last drawing position
      lastDrawingPosition.current = { x, y } // is that how you use React?
    }

    updateImageDataUrl(canvas)
  }

  // Abschluss einer Zeichnung (aktuell nur Linie)
  const endDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx || !canvas) return

    const { x, y } = getCanvasCoordinates(e)
    const offset = Math.floor(brushSize / 2)

    let toolCall = (ctx: CanvasRenderingContext2D, x: number, y: number) =>
      ctx.fillRect(x, y, brushSize, brushSize)

    ctx.save() // for safety
    ctx.fillStyle = selectedColor
    if (isDrawing) {
      if (tool === 'line') {
        // complete the line
        drawLineTo(ctx, toolCall, lastDrawingPosition.current, { x, y }, offset)
        lastDrawingPosition.current = { x, y }
      } else if (tool === 'rectangle') {
        // complete the line
        drawRectangle(ctx, toolCall, lastDrawingPosition.current, { x, y }, offset)
        lastDrawingPosition.current = {x, y}
      } else if (tool === 'ellipse') {
        // complete the line
        drawEllipse(ctx, toolCall, lastDrawingPosition.current, { x, y }, offset)
        lastDrawingPosition.current = { x, y }
      }
    }
    ctx.restore()
  }

  // Aktualisiert die Vorschau-Leinwand mit einer gestrichelten Umrandung.
  const updatePreview = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const overlayCanvas = previewCanvasRef.current
    const canvas = canvasRef.current
    if (!overlayCanvas || !canvas) return
    const ctx = overlayCanvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height)
    ctx.globalAlpha = 0.2

    const { x, y } = getCanvasCoordinates(e)
    if (tool === 'brush' || tool === 'eraser' || tool === 'line') {
      const offset = Math.floor(brushSize / 2)
      ctx.fillRect(x - offset, y - offset, brushSize, brushSize)
    } else {
      ctx.fillRect(x, y, 1, 1)
    }
    ctx.globalAlpha = 1.0

    // Show sprite boundary while drawing.
    // This should make it easier to keep 'inside the lines'
    /*ctx.save()
    ctx.globalAlpha = 0.2
    ctx.fillStyle = 'black'
    const panelWidth = overlayCanvas.width / 4
    for (let i = 0; i < 4; i++) {
      if (x < i * panelWidth || x >= (i + 1) * panelWidth)
        ctx.fillRect(i * panelWidth, 0, panelWidth, overlayCanvas.height)
    }
    ctx.restore()*/
  }

  const clearPreview = () => {
    const overlayCanvas = previewCanvasRef.current
    if (!overlayCanvas) return
    const ctx = overlayCanvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height)
  }

  // Gemeinsame Logik für den Start des Zeichnens.
  const handleStart = (e: React.PointerEvent<HTMLCanvasElement>) => {
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

  // Gemeinsame Logik für Bewegung.
  const handleMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    updatePreview(e)
    if (!isDrawing || tool === 'paintBucket') return
    draw(e)
  }

  // Gemeinsame Logik für das Beenden des Zeichnens.
  const handleEnd = (
    e: React.PointerEvent<HTMLCanvasElement>,
    clear: boolean
  ) => {
    endDraw(e)
    setIsDrawing(false)
    hasPushedUndo.current = false
    if (clear) clearPreview()
    else updatePreview(e)
  }

  

  // Pointer Events for everything
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    // capture the event, so moves outside of the canvas are still registered
    // this would probably also work for close-on-click in modals
    e.currentTarget.setPointerCapture(e.pointerId)
    handleStart(e)
  }
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    handleMove(e)
  }
  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    handleEnd(e, false)
  }

  const handlePointerLeave = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    handleEnd(e, true)
  }

  // Undo: stellt den letzten Zustand wieder her.
  const handleUndo = () => {
    // submitAnalyzeEvent(core, 'ev_click_appearance_undo')
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx || undoStack.current.length === 0) return

    const previousState = undoStack.current.pop()!
    ctx.putImageData(previousState, 0, 0)
    updateImageDataUrl(canvas)
  }

  // Reset: speichert aktuellen Zustand und setzt auf das Standardbild zurück.
  const handleReset = () => {
    submitAnalyzeEvent(core, 'ev_click_appearance_resetFigure')
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    pushUndoState()
    const img = new Image()
    img.src = karolDefaultImage
    img.onload = () => {
      // Leinwand leeren und Standardbild zeichnen.
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      updateImageDataUrl(canvas)
    }
  }

  const colors = [
    '#000000',
    '#ffffff',
    '#464646',
    '#b4b4b4',
    '#e96b6d',
    '#2e5691',
    '#ffd266',
    '#990030',
    '#9c5a3c',
    '#ed1c24',
    '#ffa3b1',
    '#ff7e00',
    '#e5aa7a',
    '#ffc20e',
    '#f5e49c',
    '#fff200',
    '#fff9bd',
    '#a8e61d',
    '#d3f9bc',
    '#22b14c',
    '#00b7ef',
    '#99d9ea',
    '#4d6df3',
    '#709ad1',
    '#2f3699',
    '#546d8e',
    '#6f3198',
    '#b5a5d5',
  ]

  return (
    <div className="bg-black/50 fixed inset-0 z-[1150]" onClick={() => {}}>
      {/* Modal mit angepasster Breite */}
      <div
        className="fixed inset-8 bg-white z-[1200] rounded-xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-3 right-3">
          <button
            className="py-1 px-3 rounded-full bg-red-200 hover:bg-red-300 mr-3"
            onClick={() => {
              submitAnalyzeEvent(core, 'ev_click_appearance_abort')
              core.mutateWs((ws) => {
                ws.robotImageDataUrl = originalImage
              })
              closeModal(core)
            }}
          >
            abbrechen
          </button>
          <button
            className="py-1 px-3 rounded-full bg-green-200 hover:bg-green-300"
            onClick={() => {
              submitAnalyzeEvent(core, 'ev_click_appearance_save')
              setRobotImage(core.ws.robotImageDataUrl)
              closeModal(core)
            }}
          >
            Speichern und schließen
          </button>
        </div>
        <div className="flex w-full h-full">
          <div className="flex-grow-0 flex-shrink-0 w-[120px] bg-white overflow-y-auto pb-3">
            <div className="text-center mt-4">
              <button
                className="mr-4 text-gray-400 hover:text-gray-500"
                onClick={() => {
                  // submitAnalyzeEvent(core, 'ev_click_appearance_prev')
                  setCount((prev) => prev + 3)
                }}
              >
                <FaIcon icon={faArrowLeft} />
              </button>
              <button
                className="text-gray-400 hover:text-gray-500"
                onClick={() => {
                  // submitAnalyzeEvent(core, 'ev_click_appearance_next')
                  setCount((prev) => prev + 1)
                }}
              >
                <FaIcon icon={faArrowRight} />
              </button>
            </div>
            <div className="w-full h-[120px] flex justify-center items-center -mt-3">
              <View
                robotImageDataUrl={core.ws.robotImageDataUrl}
                world={{
                  dimX: 1,
                  dimY: 1,
                  karol: [
                    {
                      x: 0,
                      y: 0,
                      dir: ['east', 'north', 'west', 'south'][
                        count % 4
                      ] as Heading,
                    },
                  ],
                  blocks: [[false]],
                  marks: [[false]],
                  bricks: [[0]],
                  height: 1,
                }}
              />
            </div>
            <div className="flex flex-wrap justify-center justify-items-center gap-2 mt-2">
              <button
                title="Pinsel"
                className={`h-8 w-10 flex justify-center items-center border rounded ${
                  tool === 'brush' ? 'bg-gray-300' : 'bg-white'
                }`}
                onClick={() => {
                  // submitAnalyzeEvent(core, 'ev_click_appearance_brush')
                  setTool('brush')
                }}
              >
                <FaIcon icon={faPaintBrush} />
              </button>
              <button
                title="Füllen"
                className={`h-8 w-10 flex justify-center items-center border rounded ${
                  tool === 'paintBucket' ? 'bg-gray-300' : 'bg-white'
                }`}
                onClick={() => {
                  // submitAnalyzeEvent(core, 'ev_click_appearance_fill')
                  setTool('paintBucket')
                }}
              >
                <FaIcon icon={faFillDrip} />
              </button>
              <button
                title="Linie"
                className={`h-8 w-10 flex justify-center items-center border rounded ${
                  tool === 'line' ? 'bg-gray-300' : 'bg-white'
                }`}
                onClick={() => {
                  // submitAnalyzeEvent(core, 'ev_click_appearance_eraser')
                  setTool('line')
                }}
              >
                <svg width="18" height="18" viewBox="0 0 14 14">
                  <line
                    x1="2"
                    y1="12"
                    x2="12"
                    y2="2"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              {/*<button
                title="Rechteck"
                className={`px-3 py-1 border rounded ${tool === 'rectangle' ? 'bg-gray-300' : 'bg-white'
                  }`}
                onClick={() => {
                  // submitAnalyzeEvent(core, 'ev_click_appearance_fill')
                  setTool('rectangle')
                }}
              >
                <svg width="18" height="18" viewBox="0 0 14 14">
                  <rect x="1" y="2" width="12" height="10" strokeLinejoin='round' fill='none' stroke='currentColor' strokeWidth="2" />
                </svg>
              </button>*/}
              <button
                title="Ellipse"
                className={`h-8 w-10 flex justify-center items-center border rounded ${
                  tool === 'ellipse' ? 'bg-gray-300' : 'bg-white'
                }`}
                onClick={() => {
                  // submitAnalyzeEvent(core, 'ev_click_appearance_fill')
                  setTool('ellipse')
                }}
              >
                <svg width="18" height="18" viewBox="0 0 14 14">
                  <ellipse
                    cx="7"
                    cy="7"
                    rx="6"
                    ry="5"
                    strokeLinejoin="round"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </button>
              <button
                title="Radierer"
                className={`h-8 w-10 flex justify-center items-center border rounded ${
                  tool === 'eraser' ? 'bg-gray-300' : 'bg-white'
                }`}
                onClick={() => {
                  // submitAnalyzeEvent(core, 'ev_click_appearance_eraser')
                  setTool('eraser')
                }}
              >
                <FaIcon icon={faEraser} />
              </button>
              <button
                title="Rückgängig"
                className="h-8 w-10 flex justify-center items-center bg-purple-200 hover:bg-purple-300 rounded"
                onClick={handleUndo}
              >
                <FaIcon icon={faUndo} />
              </button>
            </div>
            {/* Farbpalette */}
            <div className="flex gap-1 mt-4 flex-wrap justify-center">
              {colors.map((color) => (
                <button
                  key={color}
                  className={`w-6 h-6 rounded border-black border ${
                    selectedColor === color
                      ? 'border-2 border-opacity-100'
                      : 'border-opacity-50'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    /*submitAnalyzeEvent(
                      core,
                      'ev_click_appearance_selectColor_' + color
                    )*/
                    setSelectedColor(color)
                    if (tool === 'eraser') {
                      setTool('brush')
                    }
                  }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-center mt-3">
              {[1, 2, 3, 10].map((size) => (
                <button
                  key={size}
                  onClick={() => {
                    /*submitAnalyzeEvent(
                      core,
                      'ev_click_appearance_selectBrushSize_' + size
                    )*/
                    setBrushSize(size)
                  }}
                  className={`flex items-center justify-center w-10 h-10 border rounded-full ${
                    brushSize === size ? 'bg-gray-300' : 'bg-white'
                  }`}
                >
                  <div
                    style={{
                      width: `${size * 3}px`,
                      height: `${size * 3}px`,
                      backgroundColor: `${
                        tool === 'eraser' ? 'black' : selectedColor
                      }`,
                      borderRadius: '50%',
                      border: '1px solid rgba(0, 0, 0, 0.5)',
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="flex-grow flex-shrink flex flex-col">
            <div className="flex-grow-0 flex-shrink-0 h-[52px] bg-gray-100 flex gap-4 rounded-tr-xl items-center">
              <button
                className="px-4 py-0.5 bg-gray-200 hover:bg-gray-300 rounded ml-4"
                onClick={handleReset}
              >
                Figur zurücksetzen
              </button>
              <button
                onClick={() => {
                  submitAnalyzeEvent(core, 'ev_click_appearance_openGallery')
                  setTimeout(() => {
                    window.open(
                      'https://github.com/Entkenntnis/robot-karol-online/blob/main/FIGUREN-GALERIE.md',
                      '_self'
                    )
                  }, 100)
                }}
                className="hover:underline"
              >
                Figuren-Galerie
              </button>
              <button
                className="px-4 py-0.5 bg-gray-200 hover:bg-gray-300 rounded"
                onClick={() => {
                  submitAnalyzeEvent(core, 'ev_click_appearance_copyLink')
                  const dataUrl = canvasRef.current?.toDataURL()

                  if (dataUrl) {
                    // Absoluten Link konstruieren und in die Zwischenablage kopieren.
                    const link = `${window.location.origin}/#ROBOT:${dataUrl}`
                    navigator.clipboard.writeText(link).then(() => {
                      alert(
                        'Link kopiert! Öffne den Link in einem Browser, um deine Figur zu laden.'
                      )
                    })
                  }
                }}
              >
                Link kopieren
              </button>
              <button
                className="px-4 py-0.5 bg-yellow-200 hover:bg-yellow-300 rounded"
                onClick={async () => {
                  submitAnalyzeEvent(core, 'ev_click_appearance_sendToGallery')
                  const dataUrl = canvasRef.current?.toDataURL()

                  if (dataUrl) {
                    // Absoluten Link konstruieren und in die Zwischenablage kopieren.
                    const link = `${window.location.origin}/#ROBOT:${dataUrl}`

                    const rawResponse = await fetch(
                      backend.urlShortenerEndpoint,
                      {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ content: link }),
                      }
                    )
                    const shortUrl = await rawResponse.text()

                    window.open(
                      `https://docs.google.com/forms/d/e/1FAIpQLSfPGqtxcktRCgOhLdvTSy-OpseGX1h7zHxrtlvj2cD3zPHMiQ/viewform?usp=pp_url&entry.898288828=${encodeURIComponent(
                        shortUrl
                      )}`,
                      '_blank'
                    )
                  }
                }}
              >
                <FaIcon icon={faStar} className="mr-1" /> Einsenden zur Galerie
              </button>
            </div>
            <div className="flex-grow flex-shrink flex justify-center items-center bg-gray-800 relative">
              <div className="absolute left-2 bottom-2">
                <button
                  className="text-sm bg-gray-500 hover:bg-gray-400 px-1 rounded"
                  onClick={() => {
                    submitAnalyzeEvent(core, 'ev_click_appearance_resetCanvas')
                    pushUndoState()
                    // Leinwand löschen.
                    const canvas = canvasRef.current
                    const ctx = canvas?.getContext('2d')
                    if (!ctx || !canvas) return
                    ctx.clearRect(0, 0, canvas.width, canvas.height)
                    updateImageDataUrl(canvas)
                  }}
                >
                  Leinwand löschen
                </button>
              </div>
              <div className="absolute right-3 bottom-2 text-gray-500 text-sm">
                Nutze zum Zoomen Strg + / -
              </div>
              <div className="mt-4 flex flex-col items-center">
                {/* Container mit verfeinertem Rautenmuster */}
                <div
                  className="relative"
                  style={{
                    background:
                      'repeating-conic-gradient(rgba(255, 255, 255, 0.7) 0% 25%, #e0e0e0 0% 50%) 50% / 20px 20px',
                  }}
                >
                  {/* Referenzbild mit geringer Deckkraft */}
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
                      touchAction: 'none',
                    }}
                    onContextMenu={(e) => e.preventDefault()}
                  />
                  {/* Haupt-Zeichenleinwand */}
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
                      touchAction: 'none',
                    }}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerLeave}
                    onPointerLeave={handlePointerLeave}
                    onContextMenu={(e) => e.preventDefault()}
                  />
                  {/* Overlay-Leinwand für die Pinselvorschau */}
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
                      touchAction: 'none',
                    }}
                    onContextMenu={(e) => e.preventDefault()}
                  />
                  {/* Sprite boundary overlay*/}
                  <div
                    className="grid grid-cols-4"
                    style={{
                      width: '800px',
                      height: '355px',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      pointerEvents: 'none',
                      zIndex: 4,
                      touchAction: 'none',
                    }}
                  >
                    <div className="border-r border-black border-opacity-50"></div>
                    <div className="border-r border-black border-opacity-50"></div>
                    <div className="border-r border-black border-opacity-50"></div>
                    <div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
