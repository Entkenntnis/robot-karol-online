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

### Eigenschaften

| Name   | Typ    | Beschreibung                             |
| ------ | ------ | ---------------------------------------- |
| x      | Zahl   | Die X-Koordinate (lesbar und schreibbar) |
| y      | Zahl   | Die Y-Koordinate (lesbar und schreibbar) |
| width  | Zahl   | Die Breite (lesbar und schreibbar)       |
| height | Zahl   | Die Höhe (lesbar und schreibbar)         |
| fill   | String | Die Füllfarbe (lesbar und schreibbar)    |

### Methoden

#### `move(dx, dy)`

Bewegt das Rechteck um die angegebenen Abstände.

| Parameter | Typ  | Beschreibung                 |
| --------- | ---- | ---------------------------- |
| dx        | Zahl | Die horizontale Verschiebung |
| dy        | Zahl | Die vertikale Verschiebung   |

#### `destroy()`

Entfernt das Rechteck von der Zeichenfläche.

### Beispiel

```python
import rko

# Erstelle ein rotes Rechteck
rechteck = rko.Rectangle(10, 10, 50, 30, "red")

# Bewege das Rechteck nach rechts
rechteck.move(20, 0)
```

## Roboter-Steuerung

### `rko.enableManualControl()`

Aktiviert die manuelle Steuerung des Roboters.

### `rko.getKarolPosition()`

Gibt die aktuelle Position des Roboters zurück.

Rückgabewert: Ein Array mit [x, y] Koordinaten.

### `rko.getKarolHeading()`

Gibt die aktuelle Blickrichtung des Roboters zurück.

Rückgabewert: Ein String ('north', 'east', 'south', oder 'west').

### `rko.setKarolPosition(x, y)`

Setzt die Position des Roboters.

| Parameter | Typ  | Beschreibung     |
| --------- | ---- | ---------------- |
| x         | Zahl | Die X-Koordinate |
| y         | Zahl | Die Y-Koordinate |

### `rko.setKarolHeading(heading)`

Setzt die Blickrichtung des Roboters.

| Parameter | Typ    | Beschreibung                                    |
| --------- | ------ | ----------------------------------------------- |
| heading   | String | Die Richtung ('north', 'east', 'south', 'west') |

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

### `rko.exit()`

Beendet das Programm.

### `rko.clearOutput()`

Löscht die Ausgabe.

### `rko.sleep(seconds)`

Pausiert die Ausführung für die angegebene Zeit.

| Parameter | Typ  | Beschreibung                |
| --------- | ---- | --------------------------- |
| seconds   | Zahl | Die Pausendauer in Sekunden |

### `rko.enableArrowKeys()`

Aktiviert die Verwendung der Pfeiltasten für die Eingabe. Diese Funktion muss vor der Verwendung von `isPressed()` aufgerufen werden.

### `rko.isPressed(key)`

Überprüft, ob eine bestimmte Pfeiltaste gedrückt ist.

| Parameter | Typ    | Beschreibung                                                   |
| --------- | ------ | -------------------------------------------------------------- |
| key       | String | Die zu überprüfende Taste ('up', 'down', 'left', oder 'right') |

Rückgabewert: `True` wenn die Taste gedrückt ist, `False` wenn nicht.

**Hinweis:** `enableArrowKeys()` muss vor der ersten Verwendung von `isPressed()` aufgerufen werden.

## Audio und Musik

### `rko.Synth`

Die `Synth` Klasse ermöglicht das Abspielen von Tönen und Melodien.

#### Konstruktor

```python
rko.Synth()
```

Erstellt einen neuen Synthesizer.

#### Methoden

##### `play(frequency, duration, immediate=False)`

Spielt einen Ton mit der angegebenen Frequenz und Dauer.

| Parameter | Typ     | Beschreibung                       |
| --------- | ------- | ---------------------------------- |
| frequency | Zahl    | Die Frequenz des Tons in Hertz     |
| duration  | Zahl    | Die Dauer des Tons in Sekunden     |
| immediate | Boolean | Sofort abspielen (Standard: False) |

##### `pause(duration, immediate=False)`

Fügt eine Pause ein.

| Parameter | Typ     | Beschreibung                       |
| --------- | ------- | ---------------------------------- |
| duration  | Zahl    | Die Dauer der Pause in Sekunden    |
| immediate | Boolean | Sofort pausieren (Standard: False) |

### `rko.convertTimeToSeconds(time)`

Konvertiert eine Zeitangabe in Sekunden.

| Parameter | Typ    | Beschreibung                                                     |
| --------- | ------ | ---------------------------------------------------------------- |
| time      | String | Die Zeitangabe (z.B. '4m' für 4 Takte, '8n' für eine Achtelnote) |

Rückgabewert: Die Zeit in Sekunden.

### `rko.setBpm(bpm)`

Setzt das Tempo für die Musikwiedergabe.

| Parameter | Typ  | Beschreibung                                                     |
| --------- | ---- | ---------------------------------------------------------------- |
| bpm       | Zahl | Das Tempo in Beats pro Minute (muss eine positive Ganzzahl sein) |

### `rko.setVolume(volume)`

Setzt die Ausgabelautstärke für die Musikwiedergabe. 0 = keine Änderung, 12 = doppelt so laut, -12 = halb so laut.

| Parameter | Typ  | Beschreibung                                                                  |
| --------- | ---- | ----------------------------------------------------------------------------- |
| volume    | Zahl | Lautstärkenänderung in Dezibel (muss eine Ganzzahl zwischen -100 und 12 sein) |
