# 🎉 Kapitel 7: Weniger Chaos, mehr Funktionen 🎉

Willkommen in der Welt der Funktionen! Hier lernst du, wie du deinen Code organisierst und Wiederholungen vermeidest. Funktionen sind wie kleine Helfer, die Aufgaben für dich übernehmen – praktisch, oder? 😊

## 1. Funktionen erstellen mit `def`

So baust du deine eigene Funktion:

```python
def begruessung():
    print("Hallo Coding-Champion!")
    print("Heute wird ein super Tag zum Lernen! 🌟")
```

**Aufrufen nicht vergessen:**

```python
begruessung()  # Die Funktion wird ausgeführt
```

## 2. Parameter – Deine persönlichen Boten

Funktionen können Eingaben entgegennehmen:

```python
def persönliche_begrüßung(name):
    print(f"Hallo {name}!")
    print("Wie geht's?")
```

**So verwendest du sie:**

```python
persönliche_begrüßung("Anna")   # Hallo Anna!
persönliche_begrüßung("Max")    # Hallo Max!
```

## 3. Docstrings – Deine Funktions-Bedienungsanleitung

```python
def quadrat(zahl):
    """
    Berechnet das Quadrat einer Zahl
    Parameter: zahl (int/float)
    Rückgabewert: Quadrat der Zahl
    """
    return zahl ** 2
```

**Tipp:** Mit `help(quadrat)` siehst du die Erklärung!

## 4. Return – Der magische Bringdienst

```python
def rechteck_fläche(länge, breite):
    return länge * breite

ergebnis = rechteck_fläche(5, 3)
print(ergebnis)  # 15
```

**Wichtig:** `return` beendet die Funktion sofort!

## 5. Lokale vs. Globale Variablen

```python
globale_variable = 10

def test_funktion():
    lokale_variable = 5
    print("In der Funktion:", globale_variable + lokale_variable)  # 15

test_funktion()
print("Draußen:", globale_variable)  # 10
# print(lokale_variable) würde einen Fehler geben!
```

## 🏆 Zusammenfassung

- `def name():` erstellt Funktionen
- Parameter machen Funktionen flexibel
- `return` gibt Werte zurück
- Docstrings erklären deinen Code
- Lokale Variablen leben nur in der Funktion

## 🚀 Challenge-Time!

**Aufgabe:** Erstelle eine Funktion `würfel_volumen`, die die Kantenlänge als Parameter nimmt und das Volumen zurückgibt. Vergiss den Docstring nicht!

```python
# Hier kommt deine Lösung hin!

def würfel_volumen(kante):
    """
    Berechnet das Volumen eines Würfels
    Parameter: kante (Zahl)
    Rückgabewert: Volumen (Zahl)
    """
    return kante ** 3

# Teste deine Funktion
print(würfel_volumen(3))  # Sollte 27 ausgeben
```

Probiere es aus und lass deine Funktionen tanzen! 💃🕺 Bei Fragen: Einfach ausprobieren – Fehler sind die besten Lehrer! 😉
