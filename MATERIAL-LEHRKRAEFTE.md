# Material für Lehrkräfte

## Musterlösung zu den Aufgaben

Bitte schreibe mir unter karol@arrrg.de um die Musterlösung zu Aufgaben im Selbst-Lern-Pfad zu erhalten.

## Dokumentation

Eine Übersicht über den Funktionsumfang und die Befehle findest du in der [Dokumentation](https://github.com/Entkenntnis/robot-karol-online#readme).

## Inspiration

Besuche die [Galerie freigegebener Aufgaben](https://karol.arrrg.de/#INSPIRATION).

<br /><br /><br /><br /><br />

## Karol x Python

![grafik](https://github.com/user-attachments/assets/13b38eef-d9e4-497c-8b97-94b458f94f61)

Es gibt für den Einstieg einen <a href="https://raw.githubusercontent.com/Entkenntnis/robot-karol-online/main/material/Pythonkurs_mit_Robot_Karol_Online.pdf">Pythonkurs mit Robot Karol Online</a> mit dem gleichen Funktionsumfang wie die Blöcke.

Darüber hinaus stehen im [Python Pro Modus](https://karol.arrrg.de/#SPIELWIESE-PYTHON-PRO) viele weitere Standard-Python-Funktionen zur Verfügung. Hier findest du eine Sammlung an Beispielen. Viel Spaß beim Ausprobieren!

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

### Burg in Wunschgröße

Wer schon immer einmal mit Karol reden wollte: hier ist die Gelegenheit, mit Karol zusammen eine Burg zu bauen.

![grafik](https://github.com/user-attachments/assets/db8cd5eb-2cb6-4146-9db2-bff47b3cc914)

https://karol.arrrg.de/#9U7T

```py
karol = Robot()

seitenlänge = int(input("Wie groß darf die Burg sein? (3 - 13)"))

if seitenlänge < 3 or seitenlänge > 13:
    print("Größe nicht unterstützt :(")
else:
    print("Baue eine Burg der Größe " + str(seitenlänge))
    # Schritt 1: Burg zentrieren
    offset = (15 - seitenlänge) / 2
    karol.schritt(offset)
    karol.linksDrehen()
    karol.schritt(offset - 1)
    # Karol steht jetzt vor dem ersten Feld
    for i in range(4):
        for j in range(seitenlänge):
            karol.hinlegen(2)
            karol.rechtsDrehen()
            karol.schritt()
            karol.linksDrehen()
        karol.schritt()
        if i != 3:
            karol.linksDrehen()
```
