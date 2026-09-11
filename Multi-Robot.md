# Multi-Robot: manuelle Steuerung in der Spielwiese

Diese Anleitung beschreibt, wie man in der Spielwiese mehrere Roboter erzeugen,
einen Roboter auswählen und diesen per Tastatur steuern kann. Sie enthält den
kompletten Code inklusive des Fixes gegen den Absturz beim Hinzufügen eines
Roboters.

Die hier beschriebenen Änderungen wurden bewusst wieder revertiert und liegen
nur als Anleitung vor.

---

## 1. Ziel

- Neben dem „Struktogramm"-Button in der Spielwiese einen Button **„Neuer
  Roboter"** und links daneben ein Dropdown zur Auswahl des **aktiven
  Roboters**.
- Die Tastatursteuerung (Pfeiltasten, H/A/M/Q) wirkt auf den ausgewählten
  Roboter.
- Mehrere Roboter werden mit Nummer gezeichnet.
- Beim Hinzufügen eines Roboters darf die App nicht abstürzen.

---

## 2. Voraussetzungen (bereits im Branch vorhanden)

Die folgenden Bausteine sind die Grundlage und existieren schon. Ohne sie
funktionieren die Schritte aus Abschnitt 3 nicht.

### 2.1 Datenmodell (`lib/state/types.ts`)

```ts
export interface Robot {
  id: string
  x: number
  y: number
  dir: Heading
  visible: boolean
}

export interface World {
  dimX: number
  dimY: number
  height: number
  robots: Robot[]
  bricks: number[][]
  marks: boolean[][]
  blocks: boolean[][]
}
```

Zusätzlich in `Ui`:

```ts
export interface Ui {
  // ...
  activeRobotId?: string
}
```

### 2.2 Helper (`lib/commands/robots.ts`)

```ts
import type { Core } from '../state/core'
import type { Heading, Robot, World } from '../state/types'

export function createSingleRobotWorld(dir: Heading): World {
  return {
    dimX: 1,
    dimY: 1,
    robots: [
      {
        x: 0,
        y: 0,
        dir,
        id: 'r0',
        visible: true,
      },
    ],
    blocks: [[false]],
    marks: [[false]],
    bricks: [[0]],
    height: 1,
  }
}

export function getRobot(world: World, id?: string): [Robot, number] {
  const matchingIndex = world.robots.findIndex((robot) => robot.id === id)
  const index = matchingIndex >= 0 ? matchingIndex : 0
  return [world.robots[index], index]
}

export function mutateRobot(
  core: Core,
  id: string,
  fn: (robot: Robot, world: World) => void,
): void {
  core.mutateWs(({ world }) => {
    const robot =
      world.robots.find((entry) => entry.id === id) ?? world.robots[0]
    if (robot) {
      fn(robot, world)
    }
  })
}
```

Wichtig: `getRobot` fällt auf Index `0` zurück, wenn die ID nicht gefunden
wird. Das ist der Grund, warum die Steuerung ohne aktive ID immer Roboter 1
bewegt.

### 2.3 Weltbefehle akzeptieren eine `robotId`

In `lib/commands/world.ts` nehmen die Befehle eine optionale Roboter-ID entgegen
und rechnen damit den Index aus:

```ts
export function forward(
  core: Core,
  robotId?: string,
  opts?: { reverse: boolean },
) {
  const { world } = core.ws
  const { bricks } = world
  const [karol, index] = getRobot(world, robotId)
  const dir = opts?.reverse ? reverse(karol.dir) : karol.dir
  const target = move(karol.x, karol.y, dir, world)

  // ... Crash-Prüfungen ...

  core.mutateWs(({ world }) => {
    world.robots[index].x = target.x
    world.robots[index].y = target.y
  })
  return true
}

export function left(core: Core, robotId?: string) {
  const [, index] = getRobot(core.ws.world, robotId)
  core.mutateWs(({ world }) => {
    world.robots[index].dir = turnLeft(world.robots[index].dir)
  })
}

export function right(core: Core, robotId?: string) {
  const [, index] = getRobot(core.ws.world, robotId)
  core.mutateWs(({ world }) => {
    world.robots[index].dir = turnRight(world.robots[index].dir)
  })
}
```

Analog: `brick`, `unbrick`, `toggleMark`, `setMark`, `resetMark`, `toggleBlock`.

### 2.4 View zeichnet mehrere Roboter mit Nummer

In `components/helper/View.tsx` zeichnet `drawKarol` die Nummer, wenn es mehr als
einen Roboter gibt:

```tsx
const drawKarol = (
  x: number,
  y: number,
  z: number,
  dir: Heading,
  i: number,
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

  ctx.drawImage(robot, sx, 0, 40, 71, Math.round(dx), Math.round(dy), 40, 71)
  if (total > 1) {
    ctx.font = '22px sans-serif'
    ctx.fillText((i + 1).toString(), Math.round(dx), Math.round(dy) + 10)
  }
}
```

Und die Render-Schleife zeichnet alle Roboter; nur der aktive nutzt die
animierte Position:

```tsx
if (!hideKarol) {
  for (let i = 0; i < world.robots.length; i++) {
    const robotEntry = world.robots[i]
    const animated =
      i === index && animatedRobotData.current.x >= 0
        ? animatedRobotData.current
        : null
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
        i,
        world.robots.length,
      )
    }
  }
}
```

### 2.5 `createWorld` legt Roboter an (`lib/state/create.ts`)

Für Tests startet die Welt mit zwei Robotern:

```ts
export function createWorld(dimX: number, dimY: number, height: number): World {
  const world: World = {
    dimX,
    dimY,
    height,
    robots: [
      {
        id: 'r0',
        x: 0,
        y: 0,
        dir: 'south',
        visible: true,
      },
      { id: 'r1', x: 4, y: 4, dir: 'south', visible: true },
    ],
    bricks: Array(dimY)
      .fill(0)
      .map(() => Array(dimX).fill(0)),
    marks: Array(dimY)
      .fill(0)
      .map(() => Array(dimX).fill(false)),
    blocks: Array(dimY)
      .fill(0)
      .map(() => Array(dimX).fill(false)),
  }
  return world
}
```

---

## 3. Umsetzung

### 3.1 `addRobot` in `lib/commands/robots.ts`

Hängt einen neuen Roboter an, vergibt eine freie ID (`rN`) und macht ihn direkt
aktiv.

```ts
export function addRobot(core: Core): void {
  core.mutateWs(({ world, ui }) => {
    let n = world.robots.length
    while (world.robots.some((robot) => robot.id === `r${n}`)) {
      n++
    }
    const id = `r${n}`
    world.robots.push({ id, x: 0, y: 0, dir: 'south', visible: true })
    ui.activeRobotId = id
  })
}
```

### 3.2 Tastatursteuerung auf den aktiven Roboter (`components/ide/Output.tsx`)

Import ergänzen:

```ts
import { addRobot } from '../../lib/commands/robots'
```

Die Aktionen übergeben `core.ws.ui.activeRobotId` an die Weltbefehle:

```ts
const actions: { [key: string]: () => boolean } = {
  ArrowLeft: () => {
    left(core, core.ws.ui.activeRobotId)
    return true
  },
  ArrowRight: () => {
    right(core, core.ws.ui.activeRobotId)
    return true
  },
  ArrowUp: () => {
    return forward(core, core.ws.ui.activeRobotId)
  },
  ArrowDown: () => {
    return forward(core, core.ws.ui.activeRobotId, { reverse: true })
  },
  KeyH: () => {
    return brick(core, core.ws.ui.activeRobotId)
  },
  KeyA: () => {
    return unbrick(core, core.ws.ui.activeRobotId)
  },
  KeyM: () => {
    return toggleMark(core, core.ws.ui.activeRobotId)
  },
  KeyQ: () => {
    return toggleBlock(core, core.ws.ui.activeRobotId)
  },
}
```

**Wichtig – Fokus:** Der globale Keydown-Handler prüft `e.target ==
document.body`. Nach einem Klick auf Dropdown/Button liegt der Fokus auf dem
Control, die Pfeiltasten kommen nicht an. Deshalb die Controls nach der Aktion
`blur()`en.

### 3.3 Dropdown + „Neuer Roboter" in der Spielwiese

Der Block `{core.ws.page == 'spielwiese' && (...)}` sieht danach so aus:

```tsx
{core.ws.page == 'spielwiese' && (
  <div className="absolute top-2 right-2">
    <select
      className="py-0.5 bg-gray-100 hover:bg-gray-200 px-2 rounded"
      value={core.ws.ui.activeRobotId ?? core.ws.world.robots[0]?.id ?? ''}
      onChange={(e) => {
        const id = e.target.value
        core.mutateWs(({ ui }) => {
          ui.activeRobotId = id
        })
        e.currentTarget.blur()
      }}
    >
      {core.ws.world.robots.map((robot, i) => (
        <option key={robot.id} value={robot.id}>
          {core.ttung('Roboter')} {i + 1}
        </option>
      ))}
    </select>
    <button
      className="py-0.5 bg-gray-100 hover:bg-gray-200 px-2 rounded ml-3"
      onClick={(e) => {
        addRobot(core)
        e.currentTarget.blur()
      }}
    >
      {core.ttung('Neuer Roboter')}
    </button>
    <button
      className="py-0.5 bg-gray-100 hover:bg-gray-200 px-2 rounded ml-3"
      onClick={() => {
        core.mutateWs(({ ui }) => {
          ui.showStructogram = true
          ui.showOutput = false
        })
      }}
    >
      {core.ttung('Struktogramm')}
    </button>
    <button
      onClick={(e) => {
        resetOutput(core)
        e.currentTarget.blur()
      }}
      className="px-2 py-0.5 rounded bg-gray-100 ml-3 hover:bg-gray-200"
    >
      <FaIcon icon={faTrashCan} className="mr-2 text-sm text-gray-700" />
      {core.ttung('Welt leeren')}
    </button>
  </div>
)}
```

`core.ttung('Roboter')` / `core.ttung('Neuer Roboter')` fallen automatisch auf
den deutschen Text zurück, solange keine Übersetzung in `lib/strings/de2en.ts`
existiert.

### 3.4 Crash-Fix in `components/helper/View.tsx`

**Symptom:** Sobald man einen neuen Roboter erzeugt, stürzt die App ab
(`Cannot read properties of undefined (reading 'dir')`).

**Ursache:** Die Animation greift über den Index auf den vorherigen Weltstand
zu:

```ts
prevWorld.current.robots[index].dir !== world.robots[index].dir
```

Wird der neue Roboter aktiv, ist `index` im alten `prevWorld` noch nicht
vorhanden → `undefined.dir`.

**Fix:** Statt über den Index über die ID suchen und sauber abbrechen, wenn der
Roboter im vorherigen Stand (noch) nicht existiert. Der komplette Effekt:

```tsx
useEffect(() => {
  const activeId = world.robots[index]?.id
  const prevRobot = prevWorld.current.robots.find(
    (robot) => robot.id === activeId,
  )
  const currentRobot = world.robots.find((robot) => robot.id === activeId)

  if (
    !twoWorldsEqual(prevWorld.current, world) ||
    !prevRobot ||
    !currentRobot ||
    prevRobot.dir !== currentRobot.dir ||
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
    }
    setRenderCounter((c) => c + 1)
    return
  }

  const currentX = currentRobot.x
  const currentY = currentRobot.y
  const currentZ =
    currentX >= 0 && currentY >= 0 ? world.bricks[currentY][currentX] : 0

  const prevX = prevRobot.x
  const prevY = prevRobot.y
  const prevZ =
    prevY >= 0 && prevX >= 0 ? prevWorld.current.bricks[prevY][prevX] : 0

  const dir = prevRobot.dir
  const oppositeDir = reverse(dir)

  const forwardStep = moveRaw(prevX, prevY, dir, prevWorld.current)
  const backwardStep = moveRaw(prevX, prevY, oppositeDir, prevWorld.current)

  const isForward = forwardStep?.x === currentX && forwardStep?.y === currentY

  const isBackward =
    backwardStep?.x === currentX && backwardStep?.y === currentY

  if (isForward || isBackward) {
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

      animatedRobotData.current = { x: newX, y: newY, z: newZ }
      setRenderCounter((c) => c + 1)

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate)
      } else {
        animatedRobotData.current = { x: -1, y: -1, z: -1 }
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
    animatedRobotData.current = { x: -1, y: -1, z: -1 }
    prevWorld.current = world
    setRenderCounter((c) => c + 1)
  }
  // only care for world changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [world])
```

---

## 4. Testen

1. Dev-Server starten: `npm run dev` (Port 3000).
2. Spielwiese öffnen.
3. Prüfen: Zwei Roboter sind sichtbar und mit `1` / `2` nummeriert.
4. „Neuer Roboter" klicken → Roboter `3` erscheint, Dropdown springt auf
   „Roboter 3", **kein Crash**.
5. Pfeiltasten drücken → Roboter 3 bewegt sich (Richtung entspricht seiner
   Blickrichtung, Standard `south`).
6. Im Dropdown auf „Roboter 1" wechseln, Pfeiltasten → Roboter 1 bewegt sich.
7. Optional E2E-Test anlegen (CodeceptJS/Playwright unter `src-e2e/tests`):
   Spielwiese öffnen, „Neuer Roboter" klicken, `ArrowUp` drücken, auf
   Page-Errors prüfen.

Schneller Smoke-Test mit Playwright (headless) aus `src-e2e`:

```js
import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(e.message))

await page.goto('http://localhost:3000')
await page.waitForTimeout(800)
await page.getByText('Spielwiese', { exact: true }).first().click()
await page.waitForTimeout(1200)

await page.getByText('Neuer Roboter', { exact: true }).click()
await page.waitForTimeout(400)
for (let i = 0; i < 4; i++) {
  await page.keyboard.press('ArrowUp')
  await page.waitForTimeout(200)
}

console.log('ERRORS:', errors)
await browser.close()
```

---

## 5. Bekannte Einschränkungen / Notizen

- Der aktive Roboter wird über `ui.activeRobotId` gehalten. Ist die ID
  ungültig, fällt `getRobot` auf Index `0` zurück.
- Neue Roboter starten bei `(0, 0)` mit Blickrichtung `south` und überlagern
  ggf. Roboter 1.
- Das Dropdown listet alle Roboter; es gibt (in diesem Stand) kein Ausblenden
  oder Löschen einzelner Roboter.
- `blur()` ist nötig, weil der Keydown-Handler nur bei `e.target ==
  document.body` reagiert.
- Die Animation wird nur für den aktiven Roboter berechnet; die übrigen Roboter
  werden statisch gezeichnet.

---

## 6. Zusammenfassung der Änderungen

| Datei | Änderung |
| --- | --- |
| `lib/commands/robots.ts` | `addRobot(core)` ergänzt |
| `components/ide/Output.tsx` | Import `addRobot`; Aktionen übergeben `ui.activeRobotId`; Dropdown + „Neuer Roboter"-Button inkl. `blur()` |
| `components/helper/View.tsx` | Animation sucht aktiven Roboter per ID in `prevWorld` und guardet fehlende Roboter (Crash-Fix) |
