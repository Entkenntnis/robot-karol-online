import { useEffect, useRef, useState } from 'react'

import type {
  Canvas,
  Heading,
  ICanvsObjects,
  Preview,
  World,
} from '../../lib/state/types'
import {
  karolDefaultImage,
  markeBild,
  markeVorschau,
  markeWeg,
  quaderBild,
  ziegelBild,
  ziegelPlus,
  ziegelWeg,
} from '../../lib/data/images'
import { moveRaw, reverse, twoWorldsEqual } from '../../lib/commands/world'
import { CanvasObjects } from '../../lib/state/canvas-objects'

interface ViewProps {
  world: World
  wireframe?: boolean
  preview?: Preview
  hideKarol?: boolean
  className?: string
  robotImageDataUrl?: string | null
  hideWorld?: boolean
  animationDuration?: number
  canvas?: Canvas
  onClick?: () => void
  externallyScaled?: boolean
  lowQuality?: boolean
  scale?: number
}

interface Resources {
  ziegel: HTMLImageElement
  ziegel_weg: HTMLImageElement
  ziegel_plus: HTMLImageElement
  ziegel_plus_bright: HTMLCanvasElement[]
  robot: HTMLImageElement
  marke: HTMLImageElement
  marke_weg: HTMLImageElement
  quader: HTMLImageElement
  markeKlein: HTMLImageElement
  ctx: CanvasRenderingContext2D
}

const showFps = false
let lastFrameTimes: number[] = []

export function View({
  onClick,
  world,
  wireframe,
  hideKarol,
  preview,
  className,
  robotImageDataUrl,
  hideWorld,
  animationDuration,
  canvas,
  externallyScaled,
  lowQuality,
  scale = 1,
}: ViewProps) {
  const canvasElement = useRef<HTMLCanvasElement>(null)
  const [resources, setResources] = useState<Resources | null>(null)
  const co = CanvasObjects.useState()

  const width = 30 * world.dimX + 15 * world.dimY + 1
  const height = 15 * world.dimY + 15 * world.height + 1 + 61

  const maxCanvasDimension = 5000
  const maxRenderScale = lowQuality ? 1 : 3

  // größter ganzzahliger Faktor, der beide Seiten ≤ maxCanvasDimension hält, bevorzugt 3x, Deckelung bei 1
  const renderScale = Math.max(
    1,
    Math.min(
      maxRenderScale,
      Math.floor(maxCanvasDimension / width),
      Math.floor(maxCanvasDimension / height),
    ),
  )

  const originX = 15 * world.dimY
  const originY = 15 * world.height + 61

  function to2d(x: number, y: number, z: number) {
    return {
      x: originX + x * 30 - y * 15,
      y: originY + y * 15 - z * 15,
    }
  }

  const prevWorld = useRef(world)
  const animationFrameRef = useRef<number | null>(null)

  // there are 2 - 3 frames where the robot is just not in the right place
  // update robot position immediately, maybe rerender if there are further changes
  // this approach is avoiding a flickering effect
  const [renderCounter, setRenderCounter] = useState(0)
  const animatedRobotData = useRef<
    Map<string, { x: number; y: number; z: number }>
  >(new Map())

  useEffect(() => {
    if (!twoWorldsEqual(prevWorld.current, world) || !animationDuration) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      animatedRobotData.current = new Map()
      prevWorld.current = world
      setRenderCounter((c) => c + 1)
      return
    }

    interface ActiveAnimation {
      id: string
      prevX: number
      prevY: number
      prevZ: number
      currentX: number
      currentY: number
      currentZ: number
    }
    const animations: ActiveAnimation[] = []

    for (const robot of world.robots) {
      const before = prevWorld.current.robots.find(
        (entry) => entry.id === robot.id,
      )
      if (!before) continue
      if (before.x === robot.x && before.y === robot.y) continue

      const currentX = robot.x
      const currentY = robot.y
      const currentZ =
        currentX >= 0 && currentY >= 0 ? world.bricks[currentY][currentX] : 0
      const prevX = before.x
      const prevY = before.y
      const prevZ =
        prevY >= 0 && prevX >= 0 ? prevWorld.current.bricks[prevY][prevX] : 0

      const forwardStep = moveRaw(prevX, prevY, before.dir, prevWorld.current)
      const backwardStep = moveRaw(
        prevX,
        prevY,
        reverse(before.dir),
        prevWorld.current,
      )
      const isForward =
        forwardStep?.x === currentX && forwardStep?.y === currentY
      const isBackward =
        backwardStep?.x === currentX && backwardStep?.y === currentY
      if (!isForward && !isBackward) continue

      animations.push({
        id: robot.id,
        prevX,
        prevY,
        prevZ,
        currentX,
        currentY,
        currentZ,
      })
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    if (animations.length === 0) {
      animatedRobotData.current = new Map()
      prevWorld.current = world
      setRenderCounter((c) => c + 1)
      return
    }

    // the robots are in new positions that are not yet updated, so start animation
    const startTime = Date.now()
    const duration = animationDuration

    const animate = () => {
      const now = Date.now()
      const rawProgress = Math.min((now - startTime) / duration, 1)
      const progress = easeInOutCubic(rawProgress)

      const next = new Map<string, { x: number; y: number; z: number }>()
      for (const animation of animations) {
        const dx = animation.currentX - animation.prevX
        const dy = animation.currentY - animation.prevY
        const newX = animation.prevX + dx * progress
        const newY = animation.prevY + dy * progress
        const newZ =
          animation.prevZ +
          (animation.currentZ - animation.prevZ) * progress +
          Math.sin(progress * Math.PI) *
            (animation.currentZ === animation.prevZ ? 0.25 : 0.5)

        next.set(animation.id, { x: newX, y: newY, z: newZ })
      }
      animatedRobotData.current = next
      setRenderCounter((c) => c + 1)

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate)
      } else {
        animatedRobotData.current = new Map()
        setRenderCounter((c) => c + 1)
        animationFrameRef.current = null
      }
    }

    animate()

    prevWorld.current = world
    // only care for world changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [world])

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  useEffect(() => {
    async function render() {
      if (canvasElement.current) {
        const ctx = canvasElement.current.getContext('2d')

        if (ctx) {
          const [
            ziegel,
            robot,
            marke,
            quader,
            marke_weg,
            ziegel_weg,
            markeKlein,
            ziegel_plus,
          ] = await Promise.all([
            loadImage(ziegelBild),
            loadImage(robotImageDataUrl ?? karolDefaultImage),
            loadImage(markeBild),
            loadImage(quaderBild),
            loadImage(markeWeg),
            loadImage(ziegelWeg),
            loadImage(markeVorschau),
            loadImage(ziegelPlus),
          ])

          // Pre-brightened variants (exact brightness multipliers)
          const ziegel_plus_bright = [1.13, 1.22, 1.31, 1.35, 1.41].map(
            (brightness) => createBrightenedImage(ziegel_plus, brightness),
          )

          setResources({
            ziegel,
            ctx,
            robot,
            marke,
            quader,
            marke_weg,
            ziegel_weg,
            markeKlein,
            ziegel_plus,
            ziegel_plus_bright,
          })
        }
      }
    }
    render()
  }, [robotImageDataUrl])

  useEffect(() => {
    if (resources && canvasElement.current) {
      const {
        ctx,
        ziegel,
        robot,
        marke,
        quader,
        marke_weg,
        ziegel_weg,
        markeKlein,
        ziegel_plus,
        ziegel_plus_bright,
      } = resources

      ctx.save()
      if (!lowQuality) {
        ctx.imageSmoothingEnabled = false
      }
      ctx.scale(renderScale, renderScale)
      ctx.clearRect(0, 0, width, height)

      ctx.strokeStyle = 'blue'

      if (!hideWorld) {
        for (let i = 0; i <= world.dimX; i++) {
          const start = to2d(i, 0, 0)
          const end = to2d(i, world.dimY, 0)
          ctx.beginPath()
          ctx.moveTo(start.x + 0.5, start.y + 0.5)
          ctx.lineTo(end.x + 0.5, end.y + 0.5)
          ctx.stroke()
        }

        for (let i = 0; i <= world.dimY; i++) {
          const start = to2d(0, i, 0)
          const end = to2d(world.dimX, i, 0)
          ctx.beginPath()
          ctx.moveTo(start.x + 0.5, start.y + 0.5)
          ctx.lineTo(end.x + 0.5, end.y + 0.5)
          ctx.stroke()
        }

        for (let i = 0; i <= world.dimX; i++) {
          const start = to2d(i, 0, 0)
          const end = to2d(i, 0, world.height)
          renderDashed(ctx, start, end)
        }

        for (let i = 1; i <= world.dimY; i++) {
          const start = to2d(0, i, 0)
          const end = to2d(0, i, world.height)
          renderDashed(ctx, start, end)
        }

        renderDashed(
          ctx,
          to2d(0, world.dimY, world.height),
          to2d(0, 0, world.height),
        )
        renderDashed(
          ctx,
          to2d(world.dimX, 0, world.height),
          to2d(0, 0, world.height),
        )
      }

      if (co) {
        ctx.save()
        ctx.transform(30, 0, -15, 15, originX, originY)
        ctx.beginPath()
        ctx.rect(0, 0, world.dimX, world.dimY)
        ctx.clip()
        drawCanvasObject(co, ctx)
        ctx.restore()
      }

      // FPS counter
      // ============== DEBUGGING ==============
      if (showFps) {
        const now = performance.now()
        lastFrameTimes.push(now)
        // Keep only the last 60 frames (1 second window)
        lastFrameTimes = lastFrameTimes.filter((t) => now - t < 1000)
        const fps = lastFrameTimes.length
        ctx.save()
        ctx.font = '16px monospace'
        ctx.fillStyle = 'black'
        ctx.fillText(`FPS: ${fps}`, 10, 20)
        ctx.restore()
      }
      // ============== DEBUGGING ==============

      const drawKarol = (
        x: number,
        y: number,
        z: number,
        dir: Heading,
        index: number,
        total: number,
      ) => {
        const point = to2d(x, y, z)
        const sx = {
          north: 40,
          east: 0,
          south: 120,
          west: 80,
        }[dir]

        const dx =
          point.x - 13 - (dir === 'south' ? 3 : dir === 'north' ? -2 : 0)
        const dy = point.y - 60

        ctx.drawImage(
          robot,
          sx,
          0,
          40,
          71,
          Math.round(dx),
          Math.round(dy),
          40,
          71,
        )
        if (total > 1) {
          ctx.font = '22px sans-serif'
          ctx.fillText(
            (index + 1).toString(),
            Math.round(dx),
            Math.round(dy) + 10,
          )
        }
      }

      for (let x = 0; x < world.dimX; x++) {
        for (let y = 0; y < world.dimY; y++) {
          // Start Brick/Mark-Section
          // Debug View: http://localhost:3000/#VZZT
          const bricks: ('solid' | 'preview' | 'excess')[] = []
          if (!preview) {
            for (let i = 0; i < world.bricks[y][x]; i++) {
              bricks.push('solid')
            }
          } else {
            if (preview.world.bricks[y][x] >= world.bricks[y][x]) {
              for (let i = 0; i < world.bricks[y][x]; i++) {
                bricks.push('solid')
              }
              for (
                let i = world.bricks[y][x];
                i < preview.world.bricks[y][x];
                i++
              ) {
                bricks.push('preview')
              }
            } else {
              for (let i = 0; i < preview.world.bricks[y][x]; i++) {
                bricks.push('solid')
              }
              for (
                let i = preview.world.bricks[y][x];
                i < world.bricks[y][x];
                i++
              ) {
                bricks.push('excess')
              }
            }
          }

          let mark: 'none' | 'solid' | 'excess' | 'preview' = 'none'
          let markHeight = 0

          if (world.marks[y][x] && (!preview || preview?.world.marks[y][x])) {
            mark = 'solid'
            markHeight = world.bricks[y][x]
          }
          if (!world.marks[y][x] && preview?.world.marks[y][x]) {
            mark = 'preview'
            markHeight = world.bricks[y][x]
            //  preview
            // ? Math.max(world.bricks[y][x], preview.world.bricks[y][x])
            // :
          }
          if (world.marks[y][x] && preview && !preview?.world.marks[y][x]) {
            mark = 'excess'
            markHeight = world.bricks[y][x]
          }

          const drawMark = () => {
            if (mark == 'none') return
            const p = to2d(x, y, markHeight)
            ctx.save()
            ctx.globalAlpha = mark == 'preview' ? 0.6 : 1
            ctx.drawImage(
              mark == 'preview'
                ? markeKlein
                : mark == 'solid'
                  ? marke
                  : marke_weg,
              p.x - 15,
              p.y - 16,
            )
            ctx.restore()
          }

          if (bricks.length == 0) {
            drawMark()
          } else {
            let previewBrickIndex = 0
            for (let i = 0; i < bricks.length; i++) {
              if (i == markHeight) {
                drawMark()
              }
              const p = to2d(x, y, i) // crossed out

              // Use pre-brightened images (exact brightness effect)
              let previewImage: HTMLImageElement | HTMLCanvasElement =
                ziegel_plus

              if (bricks[i] === 'preview') {
                if (previewBrickIndex > 0) {
                  previewImage =
                    ziegel_plus_bright[
                      Math.min(
                        ziegel_plus_bright.length - 1,
                        previewBrickIndex - 1,
                      )
                    ]
                }
                previewBrickIndex++
              }

              ctx.drawImage(
                bricks[i] == 'excess'
                  ? ziegel_weg
                  : bricks[i] == 'preview'
                    ? previewImage
                    : ziegel,
                p.x - 15,
                p.y - 16,
              )
            }
            if (markHeight == bricks.length) {
              drawMark()
            }
          }

          // End section

          if (world.blocks[y][x]) {
            const p = to2d(x, y, 0)
            ctx.drawImage(quader, p.x - 15, p.y - 30)
          }
          if (!hideKarol) {
            for (let index = 0; index < world.robots.length; index++) {
              const robotEntry = world.robots[index]
              if (!robotEntry.visible) continue
              const animated = animatedRobotData.current.get(robotEntry.id)
              const robotX = animated ? animated.x : robotEntry.x
              const robotY = animated ? animated.y : robotEntry.y
              const robotZ = animated
                ? animated.z
                : robotEntry.y >= 0 && robotEntry.x >= 0
                  ? world.bricks[robotEntry.y][robotEntry.x]
                  : 0
              if (Math.round(robotX) == x && Math.round(robotY) == y) {
                drawKarol(
                  robotX,
                  robotY,
                  robotZ,
                  robotEntry.dir,
                  index,
                  world.robots.length,
                )
              }
            }
          }
        }
      }

      //ctx.drawImage(ziegel, originX - 0.5, originY - 1.5)</div>

      ctx.restore()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    resources,
    world,
    wireframe,
    preview,
    hideKarol,
    renderCounter,
    canvas,
    co,
  ])

  return (
    <canvas
      ref={canvasElement}
      width={width * renderScale}
      height={height * renderScale}
      style={
        externallyScaled
          ? {}
          : {
              width: 'auto',
              height: height * scale,
              boxSizing: 'content-box',
            }
      }
      className={className}
      onClick={onClick}
    ></canvas>
  )
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function renderDashed(
  ctx: CanvasRenderingContext2D,
  start: { x: number; y: number },
  end: { x: number; y: number },
) {
  const dashArray = [10, 5, 5, 5]
  const dashCount = dashArray.length
  ctx.beginPath()
  ctx.moveTo(start.x + 0.5, start.y + 0.5)

  const dx = end.x - start.x
  const dy = end.y - start.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  let offset = 0
  let dashIndex = 0
  let draw = true
  while (offset + 0.1 < dist) {
    const dashLength = dashArray[dashIndex++ % dashCount]
    offset += dashLength
    if (offset > dist) offset = dist

    const percentage = offset / dist

    ctx[draw ? 'lineTo' : 'moveTo'](
      start.x + 0.5 + percentage * dx,
      start.y + 0.5 + percentage * dy,
    )
    draw = !draw
  }
  ctx.stroke()
}

async function loadImage(src: string) {
  const image = new Image()
  await new Promise((r) => {
    image.onload = r
    image.src = src
  })
  return image
}

function createBrightenedImage(
  img: HTMLImageElement,
  brightness: number,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth || img.width
  canvas.height = img.naturalHeight || img.height

  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return canvas

  // Draw original image
  ctx.drawImage(img, 0, 0)

  // Get pixel data
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  // Multiply RGB channels by brightness, clamp to 255
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, data[i] * brightness) // R
    data[i + 1] = Math.min(255, data[i + 1] * brightness) // G
    data[i + 2] = Math.min(255, data[i + 2] * brightness) // B
    // Alpha (data[i + 3]) remains unchanged
  }

  // Write back modified pixels
  ctx.putImageData(imageData, 0, 0)
  return canvas
}

export function drawCanvasObject(
  co: ICanvsObjects,
  ctx: CanvasRenderingContext2D,
) {
  for (const obj of co.objects) {
    if (obj.type == 'rectangle') {
      ctx.fillStyle = obj.fillColor

      // Draw a normal rectangle in transformed space
      ctx.fillRect(obj.x / 10, obj.y / 10, obj.width / 10, obj.height / 10)

      // Restore the original transformation
    }
  }
}
