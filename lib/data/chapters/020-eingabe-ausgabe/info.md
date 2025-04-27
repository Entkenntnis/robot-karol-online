# 🖨️ Kapitel 2: Eingabe/Ausgabe – Deine erste Kommunikation mit Python!

Willkommen zum interaktiven Teil! Hier lernst du, wie dein Programm mit der Außenwelt kommuniziert – es wird Texte anzeigen und auf Eingaben reagieren können. Let's go! 🚀

## 1. Die `print()`-Funktion – Sprich mit der Welt!

Mit `print()` kannst du alles ausgeben – Texte, Zahlen oder Variablen.

```python
# Einfache Ausgabe
print("Hallo Welt! 🌍")

# Mehrere Elemente ausgeben
alter = 12
print("Ich bin", alter, "Jahre alt!")  # Kommas fügen automatisch Leerzeichen ein
```

## 2. Die `input()`-Funktion – Frag deine Nutzer!

So holst du dir Eingaben vom Benutzer ab:

```python
# Einfache Eingabe
name = input("Wie heißt du? ")
print("Hallo", name + "! 😊")  # Pluszeichen fügt KEINE Leerzeichen ein

# Achtung Falle: Alles ist erstmal Text!
geburtsjahr = input("In welchem Jahr bist du geboren? ")
print(type(geburtsjahr))  # Gibt <class 'str'> aus – obwohl wir eine Zahl erwarten!
```

## 3. Typumwandlung – Mach aus Texten Zahlen

Damit du mit Eingaben rechnen kannst:

```python
# String zu Integer
geburtsjahr = int(input("Geburtsjahr: "))
aktuelles_jahr = 2023
alter = aktuelles_jahr - geburtsjahr
print("Du bist etwa", alter, "Jahre jung! 🎂")

# String zu Float
groesse = float(input("Wie groß bist du (in Metern)? "))
print("Wow,", groesse, "m – du wächst bestimmt noch! 🌱")
```

## 4. String-Konkatenation – Texte zusammenkleben

Aber Vorsicht: Nur gleiche Typen vertragen sich!

```python
# Funktioniert NICHT:
# print("Ich bin " + 12 + " Jahre alt")  # Crash! TypeError

# Richtig mit Umwandlung:
print("Ich bin " + str(12) + " Jahre alt")  # str() macht Zahlen zu Text

# Oder besser mit Kommas:
print("Ich bin", 12, "Jahre alt")  # Python fügt automatisch Leerzeichen ein
```

## 5. f-Strings – Die Zauberformel für schöne Ausgaben 💫

Moderne und lesbare Methode ab Python 3.6:

```python
name = "Anna"
alter = 12
groesse = 1.56

# Einfache Nutzung
print(f"{name} ist {alter} Jahre alt und {groesse}m groß.")

# Rechnungen direkt im f-String
print(f"In 5 Jahren bist du {alter + 5}!")

# Formatierung von Zahlen
preis = 3.1415
print(f"Preis: {preis:.2f}€")  # Zwei Nachkommastellen
```

## 🧩 Challenge Time!

Erstelle ein Programm, das:

1. Nach dem Lieblingsessen fragt
2. Nach der gewünschten Portionsanzahl fragt
3. Ausgibt: "Du möchtest 3 Portionen Pizza bestellen. Guten Appetit! 🍕"

```python
# Hier deine Lösung:
essen = input("Was ist dein Lieblingsessen? ")
portionen = int(input("Wie viele Portionen möchtest du? "))
print(f"Du möchtest {portionen} Portionen {essen} bestellen. Guten Appetit! 🍽️")
```

## 💡 Wichtigste Erkenntnisse

- `print()` gibt aus, `input()` liest ein (immer als String!)
- Mit `int()` und `float()` machst du aus Texten Zahlen
- `+` bei Strings: nur für Text+Text, bei Zahlen für Addition
- f-Strings sind deine besten Freunde für formatierte Ausgaben

Jetzt kannst du schon richtige Dialoge mit deinem Programm führen! Probiere verschiedene Kombinationen aus und sieh, was passiert. 🎮💬
