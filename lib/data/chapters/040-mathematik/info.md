# 🧮 Kapitel 4: Mathe-Genie – Rechnen wie ein Profi!

Willkommen in der Welt der Python-Mathematik! Hier lernst du, wie du Zahlen gekonnt jonglierst und coole Berechnungen anstellst. Let's go! 🚀

## 1. Arithmetische Grundoperationen

Python versteht alle Grundrechenarten – probier's aus:

```python
print(5 + 3)   # Addition: 8
print(10 - 4)  # Subtraktion: 6
print(2 * 6)   # Multiplikation: 12
print(8 / 2)   # Division: 4.0 (Achtung, Ergebnis ist float!)
```

## 2. Punkt-vor-Strich & Klammern

Python rechnet wie in der Schule – erst Punkt- dann Strichrechnung:

```python
print(3 + 4 * 2)   # 11 (nicht 14!)
print((3 + 4) * 2) # 14 – Klammern ändern alles!
```

## 3. Turbo-Zuweisungen 🚀

Kurze Schreibweise für Variablen-Updates:

```python
punkte = 10
punkte += 5  # Äquivalent zu: punkte = punkte + 5
print(punkte) # 15

# Funktioniert auch mit -=, *=, /=
```

## 4. Power mit \*\*

Potenzieren leicht gemacht:

```python
print(2 ** 3)  # 8 (2³)
print(5 ** 0.5) # Wurzel aus 5 ≈ 2.236
```

## 5. Mathe-Modul für Profis

Für komplexere Rechnungen brauchen wir `math`:

```python
import math

# Wurzel ziehen
print(math.sqrt(25))  # 5.0

# Mit Pi rechnen
radius = 3
umfang = 2 * math.pi * radius
print(f"Umfang: {umfang:.2f} cm")  # Formatierung auf 2 Nachkommastellen
```

## 6. Variablen im Einsatz

Variablen machen Berechnungen dynamisch:

```python
länge = 8
breite = 5
fläche = länge * breite
print(f"Die Fläche beträgt {fläche} m²")  # 40 m²
```

## 🏆 Übungszeit!

1. Berechne das Volumen eines Würfels mit Kantenlänge 7 cm
2. Wandele 100° Fahrenheit in Celsius um: (°F − 32) × 5/9
3. Berechne die Hypotenuse eines rechtwinkligen Dreiecks mit Katheten 3 und 4 cm

```python
# Lösung 3:
import math
a = 3
b = 4
c = math.sqrt(a**2 + b**2)
print(c)  # 5.0 – der berühmte Pythagoras!
```

Mathe macht mit Python richtig Spaß, oder? 😎 Probiere verschiedene Kombinationen aus und werde zum Rechenkünstler!
