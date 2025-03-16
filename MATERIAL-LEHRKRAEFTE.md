# Material für Lehrkräfte

## Musterlösung zu den Aufgaben

Bitte schreibe mir unter karol@arrrg.de um die Musterlösung zu Aufgaben im Selbst-Lern-Pfad zu erhalten.

## Dokumentation

Eine Übersicht über den Funktionsumfang und die Befehle findest du in der [Dokumentation](https://github.com/Entkenntnis/robot-karol-online#readme).

## Inspiration

Besuche die [Galerie freigegebener Aufgaben](https://karol.arrrg.de/#INSPIRATION).

## Python-Kurs

<a href="https://raw.githubusercontent.com/Entkenntnis/robot-karol-online/main/material/Pythonkurs_mit_Robot_Karol_Online.pdf">Pythonkurs mit Robot Karol Online</a>

## Beispiele für den Python Pro Modus

Hier sind ein paar nette Programme an der Schnittstelle zwischen Robot Karol und Python. Vielleicht habe ich einfach zu viel Zeit. Viel Spaß mit den Beispielen.

### Würfel

Gerade kein Würfel zur Hand? Dann lasse dir doch von Karol helfen.

![grafik](https://github.com/user-attachments/assets/300142e7-d3e2-48a4-96ea-59df5a71fc24)

https://karol.arrrg.de/#N5H7

```py
import random

karol = Robot()

num = random.randint(1, 6)

def kehreZurück():
    < ... >

if num == 1:
    karol.schritt(3)
    karol.linksDrehen()
    karol.schritt(3)
    karol.markeSetzen()
    kehreZurück()
elif num == 2:
   < ... >
elif num == 3:
  < ... >
```
