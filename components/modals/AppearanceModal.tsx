import { useEffect, useRef, useState } from 'react'
import { closeModal } from '../../lib/commands/modal'
import { useCore } from '../../lib/state/core'
import { karolDefaultImage, View } from '../helper/View'
import { Heading } from '../../lib/state/types'
import { setRobotImage } from '../../lib/storage/storage'
import { FaIcon } from '../helper/FaIcon'
import {
  faEraser,
  faFillDrip,
  faPaintBrush,
  faStar,
  faTimes,
  faUndo,
} from '@fortawesome/free-solid-svg-icons'
import { submitAnalyzeEvent } from '../../lib/commands/analyze'
import { sub } from 'date-fns'
import { backend } from '../../backend'

export function AppearanceModal() {
  const [count, setCount] = useState(0)
  const [isDrawing, setIsDrawing] = useState(false)
  const [selectedColor, setSelectedColor] = useState('#000000')
  const [tool, setTool] = useState<'brush' | 'paintBucket' | 'eraser'>('brush')
  const [brushSize, setBrushSize] = useState(3)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const core = useCore()

  // Undo-Stack: speichert ImageData-Snapshots
  const undoStack = useRef<ImageData[]>([])
  // Flag, um pro Zeichenvorgang nur einmal zu pushen.
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

  // Zeichnen für Pinsel und Radiergummi.
  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx || !canvas) return
    const { x, y } = getCanvasCoordinates(e)
    const offset = Math.floor(brushSize / 2)
    if (tool === 'eraser') {
      // Beim Radiergummi werden Pixel gelöscht (transparent gemacht).
      ctx.clearRect(x - offset, y - offset, brushSize, brushSize)
    } else {
      ctx.fillStyle = selectedColor
      ctx.fillRect(x - offset, y - offset, brushSize, brushSize)
    }
    updateImageDataUrl(canvas)
  }

  // Aktualisiert die Vorschau-Leinwand mit einer gestrichelten Umrandung.
  const updatePreview = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const overlayCanvas = previewCanvasRef.current
    const canvas = canvasRef.current
    if (!overlayCanvas || !canvas) return
    const ctx = overlayCanvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height)
    ctx.globalAlpha = 0.2
    if (tool === 'brush' || tool === 'eraser') {
      const { x, y } = getCanvasCoordinates(e)
      const offset = Math.floor(brushSize / 2)
      ctx.fillRect(x - offset, y - offset, brushSize, brushSize)
    } else {
      const { x, y } = getCanvasCoordinates(e)
      ctx.fillRect(x, y, 1, 1)
    }
    ctx.globalAlpha = 1.0
  }

  const clearPreview = () => {
    const overlayCanvas = previewCanvasRef.current
    if (!overlayCanvas) return
    const ctx = overlayCanvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height)
  }

  // Maus- und Touch-Handler

  // Gemeinsame Logik für den Start des Zeichnens.
  const handleStart = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    e.preventDefault()
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
  const handleMove = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    e.preventDefault()
    updatePreview(e)
    if (!isDrawing || tool === 'paintBucket') return
    draw(e)
  }

  // Gemeinsame Logik für das Beenden des Zeichnens.
  const handleEnd = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    e.preventDefault()
    setIsDrawing(false)
    hasPushedUndo.current = false
    clearPreview()
  }

  // Spezifische Wrapper für Touch-Events.
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    handleStart(e)
  }
  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    handleMove(e)
  }
  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    handleEnd(e)
  }

  // Maus-Handler.
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    handleStart(e)
  }
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    handleMove(e)
  }
  const handleMouseUpOrLeave = (e: React.MouseEvent<HTMLCanvasElement>) => {
    handleEnd(e)
  }

  // Undo: stellt den letzten Zustand wieder her.
  const handleUndo = () => {
    submitAnalyzeEvent(core, 'ev_click_appearance_undo')
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
    <div
      className="bg-black/50 fixed inset-0 z-[150]"
      onClick={() => {
        setRobotImage(core.ws.robotImageDataUrl)
        closeModal(core)
      }}
    >
      {/* Modal mit angepasster Breite */}
      <div
        className="fixed inset-8 bg-white z-[200] rounded-xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-3 right-3 h-8 w-8 flex justify-center items-center rounded-full bg-gray-200 hover:bg-gray-300"
          onClick={() => {
            setRobotImage(core.ws.robotImageDataUrl)
            closeModal(core)
          }}
        >
          <FaIcon icon={faTimes} />
        </button>
        <div className="flex w-full h-full">
          <div className="flex-grow-0 flex-shrink-0 w-[120px] bg-white ">
            <div className="flex flex-wrap justify-center gap-3 mt-3">
              <button
                className={`px-3 py-1 border rounded ${
                  tool === 'brush' ? 'bg-gray-300' : 'bg-white'
                }`}
                onClick={() => {
                  submitAnalyzeEvent(core, 'ev_click_appearance_brush')
                  setTool('brush')
                }}
              >
                <FaIcon icon={faPaintBrush} />
              </button>
              <button
                className={`px-3 py-1 border rounded ${
                  tool === 'paintBucket' ? 'bg-gray-300' : 'bg-white'
                }`}
                onClick={() => {
                  submitAnalyzeEvent(core, 'ev_click_appearance_fill')
                  setTool('paintBucket')
                }}
              >
                <FaIcon icon={faFillDrip} />
              </button>
              <button
                className={`px-3 py-1 border rounded ${
                  tool === 'eraser' ? 'bg-gray-300' : 'bg-white'
                }`}
                onClick={() => {
                  submitAnalyzeEvent(core, 'ev_click_appearance_eraser')
                  setTool('eraser')
                }}
              >
                <FaIcon icon={faEraser} />
              </button>
              <button
                className="px-3 py-1 bg-purple-200 hover:bg-purple-300 rounded"
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
                  className={`w-6 h-6 border-2 ${
                    selectedColor === color ? 'border-black' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    submitAnalyzeEvent(
                      core,
                      'ev_click_appearance_selectColor_' + color
                    )
                    setSelectedColor(color)
                    if (tool === 'eraser') {
                      setTool('brush')
                    }
                  }}
                />
              ))}
              <div className="flex items-center gap-2 flex-wrap justify-center mt-3">
                {[1, 2, 3, 10].map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      submitAnalyzeEvent(
                        core,
                        'ev_click_appearance_selectBrushSize_' + size
                      )
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
                        backgroundColor: '#000',
                        borderRadius: '50%',
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="w-[120px] h-[120px] flex justify-center items-center mt-8">
              <View
                robotImageDataUrl={core.ws.robotImageDataUrl}
                world={{
                  dimX: 1,
                  dimY: 1,
                  karol: {
                    x: 0,
                    y: 0,
                    dir: ['east', 'north', 'west', 'south'][
                      count % 4
                    ] as Heading,
                  },
                  blocks: [[false]],
                  marks: [[false]],
                  bricks: [[0]],
                  height: 1,
                }}
              />
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
                  window.open(
                    'https://github.com/Entkenntnis/robot-karol-online/blob/main/FIGUREN-GALERIE.md',
                    '_self'
                  )
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
                    const link = `${
                      window.location.origin
                    }/#ROBOT:${encodeURIComponent(dataUrl)}`
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
                    }}
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
                    }}
                    className="border-2 border-gray-300"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUpOrLeave}
                    onMouseLeave={handleMouseUpOrLeave}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onTouchCancel={handleTouchEnd}
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
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
