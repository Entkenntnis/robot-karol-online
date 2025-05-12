# `rko` Modul

Im Python-Modus kannst du über das Modul `rko` dein Erlebnis auf ganz neue Arten gestalten. Starte dein Script mit dieser Zeile:

```py
import rko
```

Die verfügbaren Methoden werden in diesem Dokument vorgestellt.

## `rko.Rectangle`

Die `Rectangle` Klasse ermöglicht es dir, Rechtecke auf dem Bildschirm zu zeichnen.

### Konstruktor

```python
Rectangle(x, y, width, height, fill="rebeccapurple")
```

Erstellt ein neues Rechteck an der angegebenen Position.

| Parameter | Typ    | Beschreibung                                            |
| --------- | ------ | ------------------------------------------------------- |
| x         | Zahl   | Die X-Koordinate der linken oberen Ecke des Rechtecks   |
| y         | Zahl   | Die Y-Koordinate der linken oberen Ecke des Rechtecks   |
| width     | Zahl   | Die Breite des Rechtecks                                |
| height    | Zahl   | Die Höhe des Rechtecks                                  |
| fill      | String | Die Füllfarbe des Rechtecks (Standard: "rebeccapurple") |

### Methoden

#### `move(dx, dy)`

Bewegt das Rechteck um die angegebenen Abstände.

| Parameter | Typ  | Beschreibung                 |
| --------- | ---- | ---------------------------- |
| dx        | Zahl | Die horizontale Verschiebung |
| dy        | Zahl | Die vertikale Verschiebung   |

### Beispiel

```python
import rko

# Erstelle ein rotes Rechteck
rechteck = rko.Rectangle(10, 10, 50, 30, "red")

# Bewege das Rechteck nach rechts
rechteck.move(20, 0)
```

## Weitere Funktionen

### `rko.resetCanvas()`

Entfernt alle Objekte vom Canvas und setzt die Zeichenfläche zurück.

### `rko.tick(fps=20)`

Wartet auf den nächsten Frame basierend auf der angegebenen Bildrate (FPS).
Nützlich für Animationen und Spiele, um eine konstante Framerate zu gewährleisten.

| Parameter | Typ  | Beschreibung                                                 |
| --------- | ---- | ------------------------------------------------------------ |
| fps       | Zahl | Die gewünschte Bildrate in Frames pro Sekunde (Standard: 20) |

Rückgabewert: Die vergangene Zeit seit dem letzten Aufruf von `tick()` in Sekunden.

### Beispiel für Animation

```python
import rko
import time

rechteck = rko.Rectangle(10, 10, 50, 30, "blue")

# Animation für 3 Sekunden
start_time = time.time()
while time.time() - start_time < 3:
    rko.tick(60)  # 60 FPS
    rechteck.move(1, 0)  # Bewege das Rechteck nach rechts
```

Glitch-Art Demo: https://karol.arrrg.de/#G9JX
