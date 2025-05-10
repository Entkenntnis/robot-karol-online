import { useEffect, useRef, useState } from 'react'

import { Canvas, Preview, World } from '../../lib/state/types'
import {
  karolDefaultImage,
  markeBild,
  markeVorschau,
  markeWeg,
  quaderBild,
  ziegelBild,
  ziegelWeg,
} from '../../lib/data/images'
import { moveRaw, twoWorldsEqual } from '../../lib/commands/world'

interface ViewProps {
  world: World
  wireframe?: boolean
  preview?: Preview
  hideKarol?: boolean
  className?: string
  robotImageDataUrl?: string | null
  hideWorld?: boolean
  animationDuration?: number
  activeRobot?: number
  canvas?: Canvas
}

interface Resources {
  ziegel: HTMLImageElement
  ziegel_weg: HTMLImageElement
  robot: HTMLImageElement
  marke: HTMLImageElement
  marke_weg: HTMLImageElement
  quader: HTMLImageElement
  markeKlein: HTMLImageElement
  ctx: CanvasRenderingContext2D
}

export function View({
  world,
  wireframe,
  hideKarol,
  preview,
  className,
  robotImageDataUrl,
  hideWorld,
  animationDuration,
  activeRobot,
  canvas,
}: ViewProps) {
  const canvasElement = useRef<HTMLCanvasElement>(null)
  const [resources, setResources] = useState<Resources | null>(null)

  const width = 30 * world.dimX + 15 * world.dimY + 1
  const height = 15 * world.dimY + 15 * world.height + 1 + 61

  const originX = 15 * world.dimY
  const originY = 15 * world.height + 61

  function to2d(x: number, y: number, z: number) {
    return {
      x: originX + x * 30 - y * 15,
      y: originY + y * 15 - z * 15,
    }
  }

  const i = activeRobot ?? 0

  const prevWorld = useRef(world)
  const animationFrameRef = useRef<number | null>(null)

  // there are 2 - 3 frames where the robot is just not in the right place
  // update robot position immediately, maybe rerender if there are further changes
  // this approach is avoiding a flickering effect
  const [renderCounter, setRenderCounter] = useState(0)
  const animatedRobotData = useRef({
    x: world.karol[i].x,
    y: world.karol[i].y,
    z:
      world.karol[i].y >= 0 && world.karol[i].x >= 0
        ? world.bricks[world.karol[i].y][world.karol[i].x]
        : 0,
    i,
  })

  useEffect(() => {
    if (
      !twoWorldsEqual(prevWorld.current, world) ||
      prevWorld.current.karol.length !== world.karol.length ||
      prevWorld.current.karol[i].dir !== world.karol[i].dir ||
      !animationDuration
    ) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      prevWorld.current = world
      animatedRobotData.current = {
        x: -1,
        y: -1,
        z: -1,
        i: -1,
      }
      setRenderCounter((c) => c + 1)
      return
    }

    const currentX = world.karol[i].x
    const currentY = world.karol[i].y
    const currentZ =
      currentX >= 0 && currentY >= 0 ? world.bricks[currentY][currentX] : 0

    const prevX = prevWorld.current.karol[i].x
    const prevY = prevWorld.current.karol[i].y
    const prevZ =
      prevY >= 0 && prevX >= 0 ? prevWorld.current.bricks[prevY][prevX] : 0

    const step = moveRaw(
      prevX,
      prevY,
      prevWorld.current.karol[i].dir,
      prevWorld.current
    )

    if (step && step.x == currentX && step.y == currentY) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      // the robot is in an new position that is not yet updated, so start animation
      const startTime = Date.now()
      const duration = animationDuration

      const animate = () => {
        const now = Date.now()
        const rawProgress = Math.min((now - startTime) / duration, 1)
        const progress = easeInOutCubic(rawProgress)

        const dx = currentX - prevX
        const dy = currentY - prevY
        const newX = prevX + dx * progress
        const newY = prevY + dy * progress
        const newZ =
          prevZ +
          (currentZ - prevZ) * progress +
          Math.sin(progress * Math.PI) * (currentZ == prevZ ? 0.25 : 0.5)

        animatedRobotData.current = { x: newX, y: newY, z: newZ, i }
        setRenderCounter((c) => c + 1)

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate)
        } else {
          animatedRobotData.current = { x: -1, y: -1, z: -1, i: -1 }
          setRenderCounter((c) => c + 1)
          animationFrameRef.current = null
        }
      }

      animate()

      prevWorld.current = world
    } else {
      // and here, yeah, probably cancel as well
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      animatedRobotData.current = { x: -1, y: -1, z: -1, i: -1 }
      prevWorld.current = world
      setRenderCounter((c) => c + 1)
    }
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
          ] = await Promise.all([
            loadImage(ziegelBild),
            loadImage(robotImageDataUrl ?? karolDefaultImage),
            loadImage(markeBild),
            loadImage(quaderBild),
            loadImage(markeWeg),
            loadImage(ziegelWeg),
            loadImage(markeVorschau),
          ])

          setResources({
            ziegel,
            ctx,
            robot,
            marke,
            quader,
            marke_weg,
            ziegel_weg,
            markeKlein,
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
      } = resources

      ctx.save()
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
          to2d(0, 0, world.height)
        )
        renderDashed(
          ctx,
          to2d(world.dimX, 0, world.height),
          to2d(0, 0, world.height)
        )
      }

      if (canvas) {
        ctx.save()
        ctx.setTransform(30, 0, -15, 15, originX, originY)
        ctx.beginPath()
        ctx.rect(0, 0, world.dimX, world.dimY)
        ctx.clip()
        for (const obj of canvas.objects) {
          if (obj.type == 'rectangle') {
            ctx.fillStyle = obj.fillColor

            // Draw a normal rectangle in transformed space
            ctx.fillRect(obj.x, obj.y, obj.width, obj.height)

            // Restore the original transformation
          }
        }
        ctx.restore()
      }

      const drawKarol = (x: number, y: number, z: number, i: number) => {
        const point = to2d(x, y, z)
        const dir = world.karol[i].dir
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
          71
        )
        if (world.karol.length > 1) {
          ctx.font = '22px sans-serif'
          ctx.fillText((i + 1).toString(), Math.round(dx), Math.round(dy) + 10)
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
            markHeight = preview
              ? Math.max(world.bricks[y][x], preview.world.bricks[y][x])
              : world.bricks[y][x]
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
              p.y - 16
            )
            ctx.restore()
          }

          if (bricks.length == 0) {
            drawMark()
          } else {
            for (let i = 0; i < bricks.length; i++) {
              if (i == markHeight) {
                drawMark()
              }
              const p = to2d(x, y, i) // crossed out
              ctx.save()
              ctx.globalAlpha = bricks[i] == 'preview' ? 0.4 : 1
              ctx.drawImage(
                bricks[i] == 'excess' ? ziegel_weg : ziegel,
                p.x - 15,
                p.y - 16
              )
              ctx.restore()
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
            if (
              Math.round(animatedRobotData.current.x) == x &&
              Math.round(animatedRobotData.current.y) == y &&
              animatedRobotData.current.i == i
            ) {
              const { x: animX, y: animY, z: animZ } = animatedRobotData.current
              drawKarol(animX, animY, animZ, i)
            } else {
              for (let k = 0; k < world.karol.length; k++) {
                if (k == animatedRobotData.current.i) continue
                if (x == world.karol[k].x && y == world.karol[k].y) {
                  const { x, y } = world.karol[k]
                  const z = world.bricks[y][x]
                  drawKarol(x, y, z, k)
                }
              }
            }
          }
        }
      }

      //ctx.drawImage(ziegel, originX - 0.5, originY - 1.5)</div>

      ctx.restore()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resources, world, wireframe, preview, hideKarol, renderCounter, canvas])

  return (
    <canvas
      ref={canvasElement}
      width={width}
      height={height}
      className={className}
    ></canvas>
  )
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function renderDashed(
  ctx: CanvasRenderingContext2D,
  start: { x: number; y: number },
  end: { x: number; y: number }
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
      start.y + 0.5 + percentage * dy
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
