# 🎯 Kapitel 5: Die Kunst der Wiederholung mit for & while

Heute lernst du, wie man Code wiederholt – wie ein DJ, der den perfekten Beat loopt! 🎧

## 🧩 Listen – Deine Daten-Sammelbox

Stell dir eine Einkaufsliste vor, aber für Computer:

```python
# So erstellst du eine Liste
spielkarten = ["Herz Ass", "Karo König", "Pik Dame", "Kreuz Bube"]
primzahlen = [2, 3, 5, 7, 11]
mixed_list = [42, "Antwort", True] # Alles mögliche drin!
```

## 🔄 Die for-Schleife – Dein Wiederholungs-Profi

**"Für jedes Element in der Liste: Mach was damit!"**

```python
# Einkaufsliste abarbeiten
einkaufsliste = ["Äpfel", "Banane", "Milch"]

for produkt in einkaufsliste:
    print(f"✏️ Brauche noch: {produkt}")
    print("...auf zum nächsten Produkt!\n")
```

_Ausgabe:_

```
✏️ Brauche noch: Äpfel
...auf zum nächsten Produkt!

✏️ Brauche noch: Banane
...auf zum nächsten Produkt!

✏️ Brauche noch: Milch
...auf zum nächsten Produkt!
```

**Mit Zahlen arbeiten? Klar mit range():**

```python
# Countdown mit Style 🚀
for sekunde in range(5, 0, -1):
    print(f"{sekunde... Abflug!")
print("🔥 Liftoff!")
```

## ⏳ Die while-Schleife – Der Hartnäckige

**"Mach weiter, solange die Bedingung stimmt!"**

```python
# Pizza-Back-Simulator 🍕
temperatur = 20
ziel_temp = 220

while temperatur < ziel_temp:
    temperatur += 20
    print(f"°C: {temperatur}°C | Heizt auf...")

print("🔔 Pizza ist fertig! Buon appetito!")
```

_Vorsicht:_ Vergiss nicht die Temperatur zu erhöhen, sonst brennt der Ofen durch! 🔥

## 🥊 for vs. while – Wer wann?

- **FOR:** Wenn du weißt, wie oft's laufen soll (z.B. Liste durchgehen)
- **WHILE:** Wenn es auf eine Bedingung ankommt (z.B. Spiel läuft, bis Game Over)

## 🎯 Challenge:

Errate die geheime Zahl mit nur 3 Versuchen!

```python
geheimzahl = 7
versuche = 3

while versuche > 0:
    raten = int(input("🎯 Dein Tipp (1-10): "))
    if raten == geheimzahl:
        print("🎉 Treffer! Gewonnen!")
        break
    versuche -= 1
    print(f"❌ Daneben! Noch {versuche} Versuche")
else:
    print("😢 Game Over! Keine Versuche mehr")
```

## 💡 Pro-Tipps:

- `range()` kann auch so: `range(start, ende, schritt)`
- Benenne Schleifen-Variablen sinnvoll:
  - `for schüler in klasse:` statt `for x in y:`
- Breakpoint setzen? Einfach `break` schreiben!

Jetzt du: Erfinde deine eigenen Schleifen-Experimente! 🔄 Wie wär's mit einem Roboter-Tanz per Code? 🤖💃🕺
