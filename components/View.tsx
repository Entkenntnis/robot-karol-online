import { useEffect, useRef, useState } from 'react'
import { World } from '../lib/core'

interface ViewProps {
  world: World
  wireframe: boolean
}

interface Resources {
  ziegel: HTMLImageElement
  robotN: HTMLImageElement
  robotE: HTMLImageElement
  robotS: HTMLImageElement
  robotW: HTMLImageElement
  marke: HTMLImageElement
  quader: HTMLImageElement
  ziegelWire: HTMLImageElement
  ctx: CanvasRenderingContext2D
}

export function View({ world, wireframe }: ViewProps) {
  const canvas = useRef<HTMLCanvasElement>(null)
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

  useEffect(() => {
    async function render() {
      if (canvas.current) {
        const ctx = canvas.current.getContext('2d')

        if (ctx) {
          const ziegel = new Image()
          await new Promise((r) => {
            ziegel.onload = r
            ziegel.src = '/Ziegel.png'
          })
          const ziegelWire = new Image()
          await new Promise((r) => {
            ziegelWire.onload = r
            ziegelWire.src = '/Ziegel_wire.png'
          })
          const robotN = new Image()
          await new Promise((r) => {
            robotN.onload = r
            robotN.src = '/robotN.png'
          })
          const robotE = new Image()
          await new Promise((r) => {
            robotE.onload = r
            robotE.src = '/robotE.png'
          })
          const robotS = new Image()
          await new Promise((r) => {
            robotS.onload = r
            robotS.src = '/robotS.png'
          })
          const robotW = new Image()
          await new Promise((r) => {
            robotW.onload = r
            robotW.src = '/robotW.png'
          })
          const marke = new Image()
          await new Promise((r) => {
            marke.onload = r
            marke.src = '/marke.png'
          })
          const quader = new Image()
          await new Promise((r) => {
            quader.onload = r
            quader.src = '/quader.png'
          })
          setResources({
            ziegel,
            ctx,
            robotN,
            robotE,
            robotS,
            robotW,
            marke,
            quader,
            ziegelWire,
          })
        }
      }
    }
    render()
  }, [])

  useEffect(() => {
    if (resources && canvas.current) {
      const {
        ctx,
        ziegel,
        robotN,
        robotE,
        robotS,
        robotW,
        marke,
        quader,
        ziegelWire,
      } = resources

      ctx.save()
      ctx.clearRect(0, 0, width, height)

      ctx.strokeStyle = 'blue'

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

      for (let x = 0; x < world.dimX; x++) {
        for (let y = 0; y < world.dimY; y++) {
          for (let i = 0; i < world.bricks[y][x]; i++) {
            const p = to2d(x, y, i)
            ctx.drawImage(wireframe ? ziegelWire : ziegel, p.x - 15, p.y - 16)
          }
          if (world.marks[y][x]) {
            const p = to2d(x, y, world.bricks[y][x])
            ctx.drawImage(marke, p.x - 15, p.y - 16)
          }
          if (world.blocks[y][x]) {
            const p = to2d(x, y, 0)
            ctx.drawImage(quader, p.x - 15, p.y - 30)
          }
          if (world.karol.x == x && world.karol.y == y) {
            const karol = {
              north: robotN,
              east: robotE,
              south: robotS,
              west: robotW,
            }[world.karol.dir]

            const point = to2d(x, y, world.bricks[y][x])

            ctx.drawImage(
              karol,
              point.x -
                13 -
                (world.karol.dir == 'south'
                  ? 3
                  : world.karol.dir == 'north'
                  ? -2
                  : 0),
              point.y - 60
            )
          }
        }
      }

      //ctx.drawImage(ziegel, originX - 0.5, originY - 1.5)</div>

      ctx.restore()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resources, world, wireframe])

  return (
    <canvas ref={canvas} width={width} height={height} className="m-4"></canvas>
  )
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
