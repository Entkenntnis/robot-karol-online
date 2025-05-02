# 💬 Kapitel 2: Interaktionen

"Wir kommen voran!", feiert Karol. "Mal sehen, was uns als Nächstes erwartet." Sie verschwindet für ein paar Minuten in der Leinwand. Du nutzt die Zeit, dich ein wenig in ihrem Wohnzimmer umzusehen. Du bist überrascht, dass einige der Gemälde von Karol sehr kindlich aussehen.

"Was für Kunst machst du eigentlich?", fragst du, als Karol wieder erscheint. Die alte Dame antwortet mit einem Grinsen: "Haha, das ist eine komplizierte Sache. Aber aktuell male ich Bilder, die ich an Schulen schenke, um die Kinder dort ein wenig zu inspirieren..."

Karol schaut für einen kurzen Moment verträumt in die Ferne, dann findet sie sich wieder: "Ich hab mir das Kapitel angeschaut, es wird interaktiv, denn du lernst, wie du Texte anzeigen und auf Eingaben reagieren kannst.

## 1. Die `print()`-Funktion – sprich mit der Welt!

Mit `print()` kannst du alles ausgeben – Texte, Zahlen oder Variablen.

```python
print("Hallo Welt! 🌍")

print(42)

alter = 17
print(alter)
```

## 2. Mit `f-Strings` Texte bauen

Häufig wollen wir Informationen in einen netten Text verpacken. Dazu sind _f-Strings_ sehr hilfreich, denn damit kannst du Text mit Variablen und anderen Daten mischen. Nutze geschweifte Klammern `{}` als Platzhalter und schreibe dazwischen eine Variable. Dann wird der Wert an diese Stelle in den Text eingefügt:

```py
anzahl = "4"
farbe = "rot"

print(f"Da sind {anzahl} Autos mit der Farbe {farbe}.")

# -> Da sind 4 Autos mit der Farbe rot.
```

## 3. Die `input()`-Funktion – stelle Fragen!

So holst du dir Eingaben vom Benutzer ab:

```python
# Einfache Eingabe
name = input("Wie heißt du? ")

print(f"Hallo, {name}! 😊")
```

## 4. Typumwandlung – mach aus Text eine Zahl

Um eine Zahl abzufragen, verpacke die Eingabe in die Funktion `int()`. Diese wandelt einen Text in eine Zahl um:

```python
# String zu Integer
geburtsjahr = int(input("Geburtsjahr: "))

aktuelles_jahr = 2025
alter = aktuelles_jahr - geburtsjahr
print(f"Du bist etwa {alter} Jahre jung! 🎂")
```

## 💡 Wichtigste Erkenntnisse

- `print()` gibt aus, `input()` liest ein (immer als String!)
- `f-Strings` sind besonders nützlich für zusammengesetzte Texte
- Mit `int()` machst aus Texten Ganzzahlen

Jetzt kannst du schon richtige Dialoge mit deinem Programm führen! Probiere dich gleich an den Aufgaben aus! 🎮💬"
