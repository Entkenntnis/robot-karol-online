# Arcade

_Auszug aus dem Buch "Python für Einsteiger"_

Du brennst darauf, dein erstes eigenes Spiel zu programmieren? Super! Lass uns direkt mit dem Herzstück eines jeden Spiels weitermachen: der **Spiel-Schleife**. Sie sorgt dafür, dass dein Spiel läuft und auf Eingaben reagiert.

Dafür nutzen wir in Python die `while`-Schleife. Sie ist ähnlich aufgebaut wie eine `if`-Abfrage mit einem kleinen Twist: Du gibst ihr eine Bedingung und _solange diese erfüllt ist_, wiederholt sie den Code darin. Zeit für ein kleines Ratespiel!

```py
print("In welchem Monat habe ich Geburtstag?")
monat = ""
while monat != "Dezember":
    monat = input("Dein Tipp: ")

print("Wow, richtig geraten!")
```

Wenn du das Programm ausführst, könnte es so aussehen:

```
In welchem Monat habe ich Geburtstag?
Dein Tipp: Januar
Dein Tipp: März
Dein Tipp: September
Dein Tipp: Dezember
Wow, richtig geraten!
```

Die Zeile `monat != "Dezember"` ist der Schlüssel. Das `!=` bedeutet "ungleich". Die Schleife läuft also, solange die Antwort _falsch_ ist. Ein simpler, aber cleverer Trick! Anders als bei einer `for`-Schleife wissen wir hier nicht, wie viele Runden das Spiel dauern wird.

Für komplexere Spiele gibt es eine noch flexiblere Methode: die Endlos-Schleife mit `break`.

Keine Sorge, "endlos" klingt, dramatischer, als es ist. Wir bauen einfach einen Notausgang ein. Mit `while True:` erstellen wir eine Schleife, die von sich aus nie endet. Das Kommando `break` dient uns als Schlüssel, um sie an der richtigen Stelle gezielt zu verlassen.

So sieht unser Spiel damit aus:

```py
print("In welchem Monat habe ich Geburtstag?")
while True:
    monat = input("Dein Tipp: ")
    if monat == "Dezember":
        print("Wow, richtig geraten!")
        break
```

Bisschen einfacher zu lesen, nicht wahr? Und dazu können wir den Code auch leichter erweitern, zum Beispiel mit einem `else`-Block für direktes Feedback:

```py
print("In welchem Monat habe ich Geburtstag?")
while True:
    monat = input("Dein Tipp: ")
    if monat == "Dezember":
        print("Wow, richtig geraten!")
        break
    else:
        print("Leider falsch, versuch es noch einmal!")
```

Und schon sieht die Ausgabe viel interaktiver aus:

```
In welchem Monat habe ich Geburtstag?
Dein Tipp: April
Leider falsch, versuch es noch einmal!
Dein Tipp: Mai
Leider falsch, versuch es noch einmal!
Dein Tipp: Dezember
Wow, richtig geraten!
```

Glückwunsch! Mit diesen wenigen Zeilen hast du bereits eine voll funktionsfähige Spiel-Logik erstellt. Willkommen in der Welt der Spieleentwicklung 🎮 es gibt noch viel zu entdecken!
