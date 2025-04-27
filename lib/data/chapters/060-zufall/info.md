# 🎲 Kapitel 6: Glücksspiel kann süchtig machen

Willkommen in der Welt des Zufalls! Hier lernst du, wie du deine Programme unvorhersehbar und spannend gestalten kannst – perfekt für Spiele, Simulationen und Überraschungseffekte. 🎮✨

## 🎯 Zufallszahlen mit `random.randint()`

Zuerst müssen wir das `random`-Modul importieren:

```python
import random
```

**Würfel-Simulator**:  
Erzeuge eine zufällige Ganzzahl zwischen 1 und 6:

```python
würfel = random.randint(1, 6)
print(f"Du hast eine {würfel} gewürfelt! 🎲")
```

**Ratespiel**:  
Der Computer denkt sich eine Zahl aus, die du erraten musst:

```python
geheimzahl = random.randint(1, 100)
versuch = int(input("Rate eine Zahl zwischen 1-100: "))

if versuch == geheimzahl:
    print("Treffer! 🎯")
else:
    print(f"Leider daneben. Die Zahl war {geheimzahl}. 😅")
```

## 🎁 Zufällige Auswahl mit `random.choice()`

**Münzwurf**:  
Kopf oder Zahl? Entscheide dich!

```python
möglichkeiten = ["Kopf", "Zahl"]
ergebnis = random.choice(möglichkeiten)
print(f"Die Münze zeigt: {ergebnis}! 💰")
```

**Glückskeks-Simulator**:  
Lass dich von weisen Sprüchen überraschen:

```python
sprüche = [
    "Heute ist dein Glückstag! 🌟",
    "Vorsicht vor fallenden Kokosnüssen. 🥥",
    "Code, den du heute schreibst, wird dich morgen retten. 💻"
]
print(random.choice(sprüche))
```

## 🚀 Tipps & Tricks

- `randint(a, b)` inkludiert **beide** Grenzen (1 **und** 6 beim Würfel).
- Mit `random.choice()` kannst du auch Listen von Zahlen, Farben oder Spielkarten mischen.
- Probiere ein **Mini-Lotteriespiel**: Ziehe 6 Zahlen zwischen 1-49:
  ```python
  lottozahlen = random.sample(range(1,50), 6)
  print(f"Gewinnzahlen: {lottozahlen} 🍀")
  ```

## 💡 Challenge: Stein-Schere-Papier

Programmiere ein Spiel gegen den Computer! Der Benutzer gibt seine Wahl ein (z.B. "Stein"), der Computer wählt zufällig aus ["Stein", "Schere", "Papier"] und entscheidet, wer gewinnt. 🪨✂️📄

**Beispiel-Lösung**:

```python
optionen = ["Stein", "Schere", "Papier"]
computer_wahl = random.choice(optionen)
spieler_wahl = input("Stein, Schere oder Papier? ")

print(f"Computer wählt: {computer_wahl}")
# Vergleichslogik hier einfügen (if/elif/else)
```

Viel Spaß beim Experimentieren – aber pass auf, dass du nicht süchtig nach deinen eigenen Spielen wirst! 😉🔥
