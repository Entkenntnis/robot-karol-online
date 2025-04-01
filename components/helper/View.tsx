import { useEffect, useRef, useState } from 'react'

import { Preview, World } from '../../lib/state/types'

const karolDefaultImage =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKAAAABHCAYAAACAjkwXAAAACXBIWXMAAC4jAAAuIwF4pT92AAAFYklEQVR42u1d0W3cMAw9GbdDtgiQZTpCf4oisxSH/GSELhMgW3QKtk6tROeTJUoiKUrHBxgo0rv4iXykSEl2TieDoSNc4/eB+PdRAATHr2UsblROruXmT09PV//59vbW07EQ45RCZ77Z8WDHso3DjcjJMd5c0rFQIryOfAFpe6gIJKcpuLG8HKeDhSKzSXyCfK94BqK/gTJbUwS3axEgKwGFAuTgS8axg62buad4LdxG2ciDdvHVZp7JwR44i4bINdwvFombBFkwdqme1kYC82zDgrOwcWL1AZz0r8cZRs6As0VtBVyq61XehMwtQE1gduCHCCWEaAIcMAsKZQ83kBBFauwFE7WGuxOiWIN31jDa3rVLx/u7oBFDNW0z1X8lhFkigmDnYZQ9YNRY4P37l2MeX1FiZBqD2PYmWoCdA4DcWKthVodvjlYnwCsjRcTohcc4BqotuCQ39BR8ZJy9ofafE3CwC6ewnNFCx/UUW0kQxjKjAP9Pu1aWA2FwyNSAwk6F2L1zA+4svKtMl+OqgP8aHFDaKJVwZGtCYtlQol5SIDA07y1D+J0gt/67lL/EDJMqD1q5LYW/LPsZfykXgqoaL8jmriYrnoTXUI841nB3RAbEEHIczmzJfoz8iu0XZAvAjMVz//Pj5+nh5cLNHw5q++TUi7HvudRhWCevn12Ns2IzEOmhg9ABXz+7VPHbOB7xkzwsAZ7TOpYUQu4SNfbe95gA2fm/qQYEP2hvmNySQWiggAhQZZuYAzy/EuOE342IEHZ1GitiNuvVocfujw3wmH2PAtnVEEopGmO4zJSREilg7pHil/t+wA0S3XX1wnnMgbGgLQHhFAwY26bGcDSOI46OglSD0Q7riEgHBRJZIeSVMLRrzTCxTrOzANH3j/muNvG4HuLDRFTE2SA9LcW4MS579BSgmG33XFUcRtBkoFhNWdNhU84OzGOHjvXmMALshrArlRDhKr69IGI/m0F8K7oeSE1NvwOj+oGrI6EFa31TzCqhbRYqIWE+468KOAYHVEzH2ZX+jy7XX6UiTAmCSYS9A5VGgDnjBIWnC8UYWd5IFftOiQNyy0f7LhqoslHv6ZK6rOk1BbvddSPCRKbpJsLc2mWQ9XLT8s01i7C6NiE+C1YY04uw6IycIvGlU9t2Jq5VZESNCGjLpqRdcIMI1YlOWwBQiO/6CNtFxdR+pjZIowi1ZDs1wcEhvqA+/RRjL3+x1IAHTQnle2HE69SBxTdfDYjJcqEIE1tt078XpuaQprcbkfhA81prdQ2InWpTg5c86sSts10Ttc+mUCK+HlmPWPToAwtNTcjo9R5lt5v7Hnb5iMGW2GdNigIlN9b4SaJbrTR3wbOJkLGmTE4U3PbDHKGnyMCp7dX/M96FfiF6wm2i0bv2XFPln8Lb7zixl0KrCMOZhqwLNhH2Ed/jt18U3X43kC7DeBFihajotRj3KL6xu+BWEVY+/2oQEF/rMz8lT0+eOYivxnn//Xy1PBF5uMcyX4N9OZH6/Q8vz1VNz9GzPmeBqPxo7ymFN2Gt6YJHVquEIYVaDu7xuS4DEjnbaTBCDlvWHs65IyCcFYsEiDVKb+cZxoS9Jd9gAjSYAA0GE6Dh/mptE6BhPgHG2m2DQUSAWsRny0Jj2HihIjLzIqrBakCDCdBgMAEaTIAGhY2AMwFu2JoR7Q+eD4vgVIllwIwIDZb9ZAQ4W1QK4vM1JaVByyQ+KDl+R5FoyDLgDCIMygcR8a3381cFpthpWqgdaJnQYF3wOFnwLus+dgHaYQQTHxZnM1A3uH/2gntfOUD9rTiMcYTFBwrs0mNMTpFta96mVf/XMu+lKzPI4i/AAVnyaXDI9gAAAABJRU5ErkJggg=='

interface ViewProps {
  world: World
  wireframe?: boolean
  preview?: Preview
  hideKarol?: boolean
  className?: string
  robotImageDataUrl?: string | null
  hideWorld?: boolean
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
            robot,
            marke,
            quader,
            marke_weg,
            ziegel_weg,
            markeKlein,
          ] = await Promise.all([
            loadImage(
              // Ziegel
              'data:image/png;base64,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'
            ),
            loadImage(robotImageDataUrl ?? karolDefaultImage),
            loadImage(
              // Marke
              'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC4AAAAfCAYAAACYn/8/AAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAjUlEQVRYhe3WOwrDUAxE0Tsm+9+y3LgwJomfZdAHdHvBKVSMzIyObdkAbwOPbuDRDTy6gUc38OgGHl1b+OfNsaS0TeyGS0qZ8hKYmVyvko0Gx49XQMNDeBU0PIBXQsMivBoaFuAV0XADr4qGP/DKaPgBr46GL/AOaLjAu6DhBO+EhgPeDQ0gIG2aetEAO3ZYXD0u46/jAAAAAElFTkSuQmCC'
            ),
            loadImage(
              // Quader
              'data:image/png;base64,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'
            ),
            loadImage(
              // Marke weg
              'data:image/png;base64,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'
            ),
            loadImage(
              // Ziegel weg
              'data:image/png;base64,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'
            ),
            loadImage(
              // Marke klein (Vorschau)
              'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC4AAAAfCAYAAACYn/8/AAABbmlDQ1BpY2MAACiRdZHPKwRhGMc/dokWKSTJYQ/IwZYoOWqVvSyHtcqvy87Y2VUzY5qZTXJVLg7KQVz8OvgPuCpXSilSkpu7XxdpPO+u2k3rnd55Pn3f9/v0zHcglDR1y6sdA8v23VQiHp2dm4/WvxChlQ6aaczonjM5PZHm3/V5R42qtzHV6/97VVfjUtbToaZBeER3XF9YpiG56juKt4Tb9XxmSfhQeMCVAYWvlK6V+FlxrsTvit10ahxCqmc0V8FaBet51xLuF+6xzIL+O4/6kqasPTMttUt2Nx4pEsSJolFgGROfmFRbMqvuGyz6plgRjy5vhzVcceTIi3dA1IJ0zUo1RM/KY7Kmcv+bp2cMD5W6N8Wh7ikI3nqhfge+t4Pg6ygIvo8h/AgXdtm/IjmNfoi+XdZ6DqBlA84uy5q2C+eb0PngZNxMUQrLDhkGvJ5C8xy03UBkoZTV7zkn95Bel190DXv70Cf3WxZ/APAHaAILjk+QAAAACXBIWXMAAA7EAAAOxAGVKw4bAAABEklEQVRYw+3W0Q6DIAwFULr4/7/cDYWIWOhtcQ8m5WWLTDx0pZaYOb1xfNJLR8ADHvCABzzgAQ94wP8wtpWbiajvielhn9Rz0xI8o/tWnijla8v4vM6uZnnuN4SnO9HNwsmDr9gR+FybfRGnfcvlQ3hAvmaJ/Cy6FSuloiniBd2nhjnyaHTLPJVIX+dReI9G8eKJA35fwcf3+w0QfIRG8GC63LDnBthXDhH0CrYFl/RqD6Kvjs/SQ/vbLdFtwQh6CpfQWgUwFidx4wh6mOMt2lIBLIdQqjgoWoRXtKW+zsoeiregb/C290DqK/qC0fBW9AWuvca16K7h2b4mH1vmQfVwYxG8F923oazMP96metF5fAGFmM0ngCDciQAAAABJRU5ErkJggg=='
            ),
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
    if (resources && canvas.current) {
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

      for (let x = 0; x < world.dimX; x++) {
        for (let y = 0; y < world.dimY; y++) {
          if (!preview) {
            for (let i = 0; i < world.bricks[y][x]; i++) {
              const p = to2d(x, y, i)
              ctx.drawImage(ziegel, p.x - 15, p.y - 16)
            }
          } else {
            if (preview && preview.world.bricks[y][x] >= world.bricks[y][x]) {
              for (let i = 0; i < world.bricks[y][x]; i++) {
                const p = to2d(x, y, i)
                ctx.drawImage(ziegel, p.x - 15, p.y - 16)
              }
              for (
                let i = world.bricks[y][x];
                i < preview.world.bricks[y][x];
                i++
              ) {
                const p = to2d(x, y, i)
                ctx.save()
                ctx.globalAlpha = 0.4
                ctx.drawImage(ziegel, p.x - 15, p.y - 16)
                ctx.restore()
              }
            } else {
              for (let i = 0; i < preview.world.bricks[y][x]; i++) {
                const p = to2d(x, y, i)
                ctx.drawImage(ziegel, p.x - 15, p.y - 16)
              }
              for (
                let i = preview.world.bricks[y][x];
                i < world.bricks[y][x];
                i++
              ) {
                const p = to2d(x, y, i) // crossed out
                ctx.save()
                ctx.globalAlpha = 1
                ctx.drawImage(ziegel_weg, p.x - 15, p.y - 16)
                ctx.restore()
              }
            }
          }
          if (world.marks[y][x] && (!preview || preview?.world.marks[y][x])) {
            const p = to2d(
              x,
              y,
              /*preview ? preview.world.bricks[y][x] :*/ world.bricks[y][x]
            )
            ctx.save()
            if (preview && preview.world.bricks[y][x] != world.bricks[y][x]) {
              //ctx.globalAlpha = 0.6
            }
            ctx.drawImage(
              /*ctx.globalAlpha == 0.6 ? markeKlein : */ marke,
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
            const p = to2d(x, y, world.bricks[y][x])
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
            const sx = {
              north: 40,
              east: 0,
              south: 120,
              west: 80,
            }[world.karol.dir]

            const point = to2d(x, y, world.bricks[y][x])

            const dx =
              point.x -
              13 -
              (world.karol.dir == 'south'
                ? 3
                : world.karol.dir == 'north'
                ? -2
                : 0)

            const dy = point.y - 60

            ctx.drawImage(robot, sx, 0, 40, 71, dx, dy, 40, 71)
            //ctx.drawImage(robot_legs, sx, 0, 40, 71, dx, dy, 40, 71)
            //ctx.drawImage(robot_shirt, sx, 0, 40, 71, dx, dy, 40, 71)
            //ctx.drawImage(robot_cap, sx, 0, 40, 71, dx, dy, 40, 71)
          }
        }
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
