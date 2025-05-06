# 🧠 Kapitel 3: Dein Code wird schlau! Mit Bedingungen entscheiden lernen

Plötzlich klingelt es an der Tür. "Ah, das müssen unsere anderen Gäste sein", sagt Karol und huscht zur Tür. Kurz darauf kommt sie mit zwei Jungs zurück, die etwa in deinem Alter sind. "Das sind Max und Tim, sie sind extra angereist", stellt sie die beiden vor. "Ihre Mutter ist Informatikerin und hat ihnen schon ein bisschen das Programmieren beigebracht."

Max, der Größere der beiden mit einem grünen T-Shirt und zerzausten blonden Haaren, nickt dir freundlich zu. Tim, sein kleinerer Bruder mit einer auffälligen roten Brille, strahlt und fragt sofort: "Habt ihr schon mit Schleifen angefangen? Oder Funktionen?"

Emi verdreht leicht die Augen. "Wir sind gerade bei Bedingten Anweisungen. Die beiden haben schon Variablen und Ein-/Ausgabe geschafft."

"Cool, dann sind wir ja genau richtig", sagt Max und setzt sich neben dich. "Bedingte Anweisungen sind super wichtig. Damit wird der Code erst richtig interessant!"

Emi fährt fort: "In der Programmierung ist das ein entscheidender Schritt: eurem Code beizubringen, verschiedene Situationen zu erkennen und entsprechend zu handeln. Genau wie eine Wetterstation erkennen muss, wann ein Sturm aufzieht."

## 🚦 If-Statement: Die Grundlage aller Entscheidungen

Emi zeigt ein einfaches Beispiel am Computer:

```python
ampelfarbe = "grün"

if ampelfarbe == "grün":
    print("Losfahren! 🚗")
```

"Das ist wie eine Verzweigung auf deinem Weg", erklärt sie. "Der Code fragt: 'Ist die Ampel grün?' Wenn ja, dann fahre los. Wenn nicht, dann mache... nichts in diesem Beispiel."

👉 **So funktioniert's:**

- `if` = "falls" oder "wenn"
- `==` prüft auf Gleichheit (Achtung: nicht verwechseln mit `=`, das ist für Zuweisungen!)
- Der eingerückte Code wird **nur** ausgeführt, wenn die Bedingung wahr ist
- Die Einrückungen (4 Leerzeichen) sind in Python Pflicht – sie zeigen, welcher Code zur Bedingung gehört

## 🚧 Else: Der "Alles andere"-Fall

"Aber was, wenn die Ampel **nicht** grün ist?", fragt Emi. Sie passt den Code an:

```python
alter = 15

if alter >= 18:
    print("Du darfst wählen! 🗳️")
else:
    # Wird ausgeführt, weil 15 < 18
    print("Noch etwas Geduld... 🕒")
```

"Mit `else` hast du einen Plan B! Wenn die Bedingung nicht zutrifft, wird stattdessen der Code im `else`-Block ausgeführt. So hat dein Programm für jede Situation eine Antwort."

## 🔄 Elif: Für komplexe Entscheidungen

"Manchmal gibt es mehr als nur zwei Möglichkeiten", sagt Emi und zaubert ein neues Beispiel hervor:

```python
note = 2.3

if note == 1.0:
    print("Traumnote! 🌟")
elif note <= 2.0:
    print("Super gemacht! 👍")
elif note <= 3.0:
    # Wird ausgeführt, weil 2.3 <= 3.0
    print("Gut, geht besser 😊")
else:
    print("Da müssen wir üben! 💪")
```

"Mit `elif` (kurz für 'else if') kannst du mehrere Bedingungen nacheinander prüfen. Sobald eine davon zutrifft, wird der zugehörige Code ausgeführt und die restlichen Bedingungen werden übersprungen."

## 🔍 Vergleichsoperatoren – Unsere Werkzeuge

"Um Entscheidungen zu treffen, brauchst du die richtigen Werkzeuge", erklärt Emi und lässt eine Tabelle erscheinen:

| Operator | Bedeutung      | Beispiel        |
| -------- | -------------- | --------------- |
| `==`     | gleich         | `5 == 5` → True |
| `!=`     | ungleich       | `3 != 5` → True |
| `>`      | größer als     | `10 > 5` → True |
| `<`      | kleiner als    | `3 < 2` → False |
| `>=`     | größer gleich  | `7 >= 7` → True |
| `<=`     | kleiner gleich | `4 <= 5` → True |

"Diese Operatoren sind wie deine Sinne – sie helfen dir, die Welt um dich herum zu verstehen und zu bewerten."

## 🧩 Logische Operatoren: Kombiniere Bedingungen

"Manchmal müssen mehrere Bedingungen gleichzeitig erfüllt sein", fährt Emi fort:

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
    # Wird ausgeführt, weil wetter == "sonnig"
    print("Eiszeit! 🍦")
```

**NOT** (Umkehrung):

```python
login_erfolgreich = False

if not login_erfolgreich:
    # Wird ausgeführt, weil login_erfolgreich False ist
    print("Bitte neu anmelden! 🔒")
```

"Mit diesen drei Operatoren – `and`, `or` und `not` – kannst du komplexe Entscheidungen programmieren, genau wie das menschliche Gehirn."

## 🏆 Jetzt bist du dran!

"Mit diesem Wissen kannst du jetzt richtig mächtige Programme schreiben", sagt Emi begeistert. "Du kannst deinem Code beibringen, intelligente Entscheidungen zu treffen – wie ein Mensch. Jetzt los, probiert euch an den Übungsaufgaben aus. Und seid nicht überrascht: diesmal habe ich mir ein paar kreative Sachen ausgedacht!"
