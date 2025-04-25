# 🎮 Kapitel 3: Dein Code wird schlau! Mit Bedingungen entscheiden lernen

Willkommen in der Welt der intelligenten Programme! Heute lernen wir, wie Computer Entscheidungen treffen – genau wie du im echten Leben. 🧠

## 🚦 If-Statement: Die Grundlage aller Entscheidungen

Stell dir vor, du stehst an einer Ampel:

```python
ampelfarbe = "grün"

if ampelfarbe == "grün":
    print("Losfahren! 🚗")
```

👉 **So funktioniert's:**

- `if` = "falls"
- `==` prüft auf Gleichheit
- Der eingerückte Code wird **nur** ausgeführt, wenn die Bedingung wahr ist
- Achtung: Einrückungen (meist 4 Leerzeichen) sind in Python Pflicht!

## 🚧 Else: Der "Alles andere"-Fall

Was, wenn die Ampel **nicht** grün ist?

```python
alter = 15

if alter >= 18:
    print("Du darfst wählen! 🗳️")
else:
    print("Noch etwas Geduld... 🕒")  # Wird ausgeführt, weil 15 < 18
```

## 🔄 Elif: Für komplexe Entscheidungen

Mehrere Bedingungen hintereinander prüfen:

```python
note = 2.3

if note == 1.0:
    print("Traumnote! 🌟")
elif note <= 2.0:
    print("Super gemacht! 👍")
elif note <= 3.0:
    print("Gut, geht besser 😊")
else:
    print("Da müssen wir üben! 💪")
```

## 🔍 Vergleichsoperatoren – Unsere Werkzeuge

| Operator | Bedeutung      | Beispiel        |
| -------- | -------------- | --------------- |
| `==`     | gleich         | `5 == 5` → True |
| `!=`     | ungleich       | `3 != 5` → True |
| `>`      | größer als     | `10 > 5` → True |
| `<`      | kleiner als    | `3 < 2` → False |
| `>=`     | größer gleich  | `7 >= 7` → True |
| `<=`     | kleiner gleich | `4 <= 5` → True |

## 🧩 Logische Operatoren: Kombiniere Bedingungen

**AND** (beides muss stimmen):

```python
alter = 25
einkommen = 2500

if alter >= 18 and einkommen > 2000:
    print("Kredit möglich 💰")  # Beide Bedingungen wahr
```

**OR** (mindestens eins muss stimmen):

```python
wetter = "sonnig"
temperatur = 28

if wetter == "sonnig" or temperatur > 25:
    print("Eiszeit! 🍦")  # Wird ausgeführt, weil sonnig
```

**NOT** (Umkehrung):

```python
login_erfolgreich = False

if not login_erfolgreich:
    print("Bitte neu anmelden! 🔒")
```

## 🏆 Übungsaufgabe: Rabattrechner

Erstelle ein Programm, das:

1. Nach dem Einkaufswert fragt
2. 10% Rabatt gibt bei über 100€
3. 15% Rabatt bei über 200€
4. 5% Rabatt für Treuekunden (zusätzliche Frage)

**Tipp:** Kombiniere if-elif-else und logische Operatoren!

```python
# Hier deine Lösung versuchen!
```

Probiere es aus und lass deinen Code verschiedene Entscheidungen treffen! 🚀 Jedes Mal, wenn du `if` schreibst, gibst du deinem Programm ein Stück Intelligenz. Viel Spaß beim Coden! 😊
