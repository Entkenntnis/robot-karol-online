import { useEffect, useRef, useState } from 'react'

import { Preview, World } from '../lib/state/types'

interface ViewProps {
  world: World
  wireframe?: boolean
  preview?: Preview
  hideKarol?: boolean
  className?: string
}

interface Resources {
  ziegel: HTMLImageElement
  ziegel_weg: HTMLImageElement
  robotN: HTMLImageElement
  robotE: HTMLImageElement
  robotS: HTMLImageElement
  robotW: HTMLImageElement
  marke: HTMLImageElement
  marke_weg: HTMLImageElement
  quader: HTMLImageElement
  ziegelWire: HTMLImageElement
  markeKlein: HTMLImageElement
  ctx: CanvasRenderingContext2D
}

export function View({
  world,
  wireframe,
  hideKarol,
  preview,
  className,
}: ViewProps) {
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
          const [
            ziegel,
            ziegelWire,
            robotN,
            robotE,
            robotS,
            robotW,
            marke,
            quader,
            marke_weg,
            ziegel_weg,
            markeKlein,
          ] = await Promise.all([
            loadImage('/Ziegel.png'),
            loadImage('/Ziegel_wire.png'),
            loadImage('/robotN.png'),
            loadImage('/robotE.png'),
            loadImage('/robotS.png'),
            loadImage('/robotW.png'),
            loadImage('/marke.png'),
            loadImage('/quader.png'),
            loadImage('/marke_weg.png'),
            loadImage('/Ziegel_weg.png'),
            loadImage('/marke_klein.png'),
          ])

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
            marke_weg,
            ziegel_weg,
            markeKlein,
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
        marke_weg,
        ziegel_weg,
        markeKlein,
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

      if (preview) {
        // drawing track
        let pos = null
        ctx.save()
        ctx.lineWidth = 5
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.globalAlpha = 0.2
        ctx.strokeStyle = '#341aff'
        ctx.beginPath()
        for (const t of preview.track) {
          if (pos == null) {
            pos = t
            const start = to2d(t.x, t.y, 0)
            ctx.moveTo(start.x + 9, start.y + 8)
            continue
          }
          if (pos.x == t.x && pos.y == t.y) {
            continue
          }
          pos = t
          const dest = to2d(pos.x, pos.y, 0)
          ctx.lineTo(dest.x + 9, dest.y + 8)
        }
        ctx.stroke()
        ctx.restore()
      }

      for (let x = 0; x < world.dimX; x++) {
        for (let y = 0; y < world.dimY; y++) {
          if (!preview) {
            for (let i = 0; i < world.bricks[y][x]; i++) {
              const p = to2d(x, y, i)
              ctx.drawImage(wireframe ? ziegelWire : ziegel, p.x - 15, p.y - 16)
            }
          } else {
            if (preview && preview.world.bricks[y][x] >= world.bricks[y][x]) {
              for (let i = 0; i < world.bricks[y][x]; i++) {
                const p = to2d(x, y, i)
                ctx.drawImage(
                  wireframe ? ziegelWire : ziegel,
                  p.x - 15,
                  p.y - 16
                )
              }
              for (
                let i = world.bricks[y][x];
                i < preview.world.bricks[y][x];
                i++
              ) {
                const p = to2d(x, y, i)
                ctx.save()
                ctx.globalAlpha = 0.4
                ctx.drawImage(
                  wireframe ? ziegelWire : ziegel,
                  p.x - 15,
                  p.y - 16
                )
                ctx.restore()
              }
            } else {
              for (let i = 0; i < preview.world.bricks[y][x]; i++) {
                const p = to2d(x, y, i)
                ctx.drawImage(
                  wireframe ? ziegelWire : ziegel,
                  p.x - 15,
                  p.y - 16
                )
              }
              for (
                let i = preview.world.bricks[y][x];
                i < world.bricks[y][x];
                i++
              ) {
                const p = to2d(x, y, i) // crossed out
                ctx.save()
                ctx.globalAlpha = 0.7
                ctx.drawImage(
                  wireframe ? ziegelWire : ziegel_weg,
                  p.x - 15,
                  p.y - 16
                )
                ctx.restore()
              }
            }
          }
          if (world.marks[y][x] && (!preview || preview?.world.marks[y][x])) {
            const p = to2d(
              x,
              y,
              preview ? preview.world.bricks[y][x] : world.bricks[y][x]
            )
            ctx.save()
            if (preview && preview.world.bricks[y][x] != world.bricks[y][x]) {
              ctx.globalAlpha = 0.6
            }
            ctx.drawImage(
              ctx.globalAlpha == 0.6 ? markeKlein : marke,
              p.x - 15,
              p.y - 16
            )
            ctx.restore()
          }
          if (!world.marks[y][x] && preview?.world.marks[y][x]) {
            const p = to2d(
              x,
              y,
              preview ? preview.world.bricks[y][x] : world.bricks[y][x]
            )
            ctx.save()
            ctx.globalAlpha = 0.6
            ctx.drawImage(markeKlein, p.x - 15, p.y - 16)
            ctx.restore()
          }
          if (world.marks[y][x] && preview && !preview?.world.marks[y][x]) {
            const p = to2d(x, y, preview.world.bricks[y][x])
            ctx.save()
            ctx.globalAlpha = 1
            ctx.drawImage(marke_weg, p.x - 15, p.y - 16)
            ctx.restore()
          }
          if (world.blocks[y][x]) {
            const p = to2d(x, y, 0)
            ctx.drawImage(quader, p.x - 15, p.y - 30)
          }
          if (world.karol.x == x && world.karol.y == y && !hideKarol) {
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

      if (
        preview &&
        preview.karol &&
        !(
          preview.karol.x == world.karol.x &&
          preview.karol.y == world.karol.y &&
          preview.karol.dir == world.karol.dir &&
          world.bricks[world.karol.y][world.karol.x] ==
            preview.world.bricks[world.karol.y][world.karol.x]
        )
      ) {
        const karol = {
          north: robotN,
          east: robotE,
          south: robotS,
          west: robotW,
        }[preview.karol.dir]

        const point = to2d(
          preview.karol.x,
          preview.karol.y,
          preview.world.bricks[preview.karol.y][preview.karol.x]
        )
        ctx.save()
        ctx.globalAlpha = 0.3
        ctx.drawImage(
          karol,
          point.x -
            13 -
            (preview.karol.dir == 'south'
              ? 3
              : preview.karol.dir == 'north'
              ? -2
              : 0),
          point.y - 60
        )
        ctx.restore()
      }

      //ctx.drawImage(ziegel, originX - 0.5, originY - 1.5)</div>

      ctx.restore()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resources, world, wireframe, preview, hideKarol])

  return (
    <canvas
      ref={canvas}
      width={width}
      height={height}
      className={className}
    ></canvas>
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

async function loadImage(src: string) {
  const image = new Image()
  await new Promise((r) => {
    image.onload = r
    image.src = src
  })
  return image
}
