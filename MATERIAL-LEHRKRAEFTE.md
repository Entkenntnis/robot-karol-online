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

<br /><br /><br />

### Würfel

Gerade kein Würfel zur Hand? Dann lasse dir doch von Karol helfen.

![grafik](https://github.com/user-attachments/assets/300142e7-d3e2-48a4-96ea-59df5a71fc24)

https://karol.arrrg.de/#QDWY

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

<br /><br /><br />

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

<br /><br /><br />

### Begrüßung

Jetzt möchte Karol mit dir reden. Sag ihr deinen Namen und dann begrüßt sie dich.

![grafik](https://github.com/user-attachments/assets/c3eaa667-40b2-4dab-beeb-d20a03c2d066)

https://karol.arrrg.de/#6YYK

```py
karol = Robot()

karol.linksDrehen(5)

name = input("Wie heißt du?")

karol.schritt(4)
karol.rechtsDrehen()
karol.schritt(4)
karol.markeSetzen()

print("Hallo " + name + " :)")
```

<br /><br /><br />

### Minimum und Maximum

Dieses Beispiel geht mehr in Richtung der "großen" Informatik. Karol sucht in einer Liste mithilfe einer einfachen Iteration das größte und kleinste Element. Die Welt dient als Fortschrittsbalken und zu Veranschaulichung der Iteration.

![grafik](https://github.com/user-attachments/assets/3c40860e-e4bb-44f4-b975-41345ce9ffcf)

https://karol.arrrg.de/#HPHP

```py
karol = Robot()

print("Suche Minimum und Maximum:")

liste = [12, -2, 34, 46, 36, 97, 128, 455, 349, 342]

min = liste[0]
max = liste[0]

for el in liste:
    if el < min:
        min = el
    if el > max:
        max = el
    karol.schritt()

print("Das Minimum ist " + str(min))
print("Das Maximum ist " + str(max))
```

<br /><br /><br />

### Uhr

Jede Minute aktualisiert die Marken auf dem Feld, so dass immer die aktuelle Zeit zu sehen ist.

![grafik](https://github.com/user-attachments/assets/17623d80-8a58-494e-bca1-6c18d36a0e9b)

https://karol.arrrg.de/#SKM3

```py
< ... >

from datetime import datetime

# Store previous digits to update only when necessary
prev_digits = [None, None, None, None]

while True:
    now = datetime.now()
    hour = now.hour
    minute = now.minute

    # Split current time into individual digits: [H tens, H ones, M tens, M ones]
    current_digits = [hour // 10, hour % 10, minute // 10, minute % 10]

    # Only update the digit if it has changed since last drawn
    for pos in range(4):
        if current_digits[pos] != prev_digits[pos]:
            drawDigit(pos, current_digits[pos])
            prev_digits[pos] = current_digits[pos]
    
    # Wait before checking the time again
    karol.markeLöschen()
```

<br /><br /><br />

### Wetterfee

Über das Internet kann Karol auf viele Informationen zugreifen - wie z.B. das Wetter!

![grafik](https://github.com/user-attachments/assets/74e1c215-bd1c-4804-b18b-bcfce4315242)

https://karol.arrrg.de/#R4TA

```py
import asyncio
from pyodide.http import pyfetch

async def get_weather(location):
    url = f"https://api.openweathermap.org/data/2.5/weather?q={location}&appid=< ... >&units=metric"
    response = await pyfetch(url)
    return await response.json()

< ... >
```

<br /><br /><br />

### Mathe-Quiz

Teste deine Mathe-Skills mit diesem kleinen Quiz.

![grafik](https://github.com/user-attachments/assets/c44cf544-50c7-41d7-b547-7090d721f356)

https://karol.arrrg.de/#TFXV

```py
import random

karol = Robot()

print("Willkommen beim Mathe-Quiz.")

karol.schritt(2)
karol.linksDrehen()

correct = 0

for i in range(7):
    a = random.randint(3, 99)
    b = random.randint(3, 99)
    antwort = int(input("Was ergibt " + str(a) + " + " + str(b) + "?"))
    if a + b == antwort:
        correct += 1
        karol.schritt()
        karol.markeSetzen()
    else:
        karol.hinlegen()
        karol.schritt()
    karol.schritt()

karol.rechtsDrehen(5)

print("Du hast " + str(correct) + " von 7 Aufgaben richtig beantwortet.")
```

<br /><br /><br />

### Fernsteuerung

Über das integrierte Modul `RobotKarolOnline` können Tasten registriert und abgefragt werden - die Grundlage für interaktive Programme!

`tasteRegistrieren(taste, beschreibung)` muss vor der Verwendung aufgerufen werden und bereitet in der UI alles vor. Die Taste ist ein [key](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key)-Wert. Die Beschreibung wird beim Rüberfahren der Maus angezeigt. Danach kann mit `tasteGedrückt(taste)` abgefragt werden, ob die vorher registrierte Taste gerade gedrückt ist.

![grafik](https://github.com/user-attachments/assets/24565aef-5d71-4e05-84f9-1546090975c1)

https://karol.arrrg.de/#EEZZ

```py
from RobotKarolOnline import tasteRegistrieren, tasteGedrückt

karol = Robot()

tasteRegistrieren("w", "Schritt")
tasteRegistrieren("a", "LinksDrehen")
tasteRegistrieren("d", "RechtsDrehen")
tasteRegistrieren("e", "Hinlegen")
tasteRegistrieren("q", "Aufheben")

while True:
    if tasteGedrückt("w") and not karol.istWand():
        karol.schritt()
    if tasteGedrückt("a"):
        karol.linksDrehen()
    if tasteGedrückt("d"):
        karol.rechtsDrehen()
    if tasteGedrückt("e") and not karol.istWand():
        karol.hinlegen()
    if tasteGedrückt("q") and karol.istZiegel():
        karol.aufheben()
```

<br /><br /><br />
