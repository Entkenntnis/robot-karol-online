# 🧠 Kapitel 3: Dein Code wird schlau! Mit Bedingungen entscheiden lernen

"Dein Erfolg bei den bisherigen Aufgaben ist beeindruckend!", freut sich Karol. Du bemerkst, dass die Muster auf den Leinwänden sich verändert haben – sie wirken jetzt dynamischer, als würden sie auf etwas reagieren.

"Etwas stimmt nicht...", murmelt Karol besorgt. "Die Leinwände müssten sich öffnen, aber es passiert nichts. Ich habe den Verdacht, dass die Quantensysteme eine Sicherheitsprüfung durchführen." Sie schaut dich hoffnungsvoll an. "Deine Hilfe ist jetzt wichtiger denn je! Wir müssen dem System beibringen, kluge Entscheidungen zu treffen."

Ihre Stimme wird ernst: "In der Programmierung ist das ein entscheidender Schritt: deinem Code beizubringen, verschiedene Situationen zu erkennen und entsprechend zu handeln. Genau wie ein Zauberlehrling wissen muss, wann der Kessel die richtige Temperatur hat, oder eine Wetterstation erkennen muss, wann ein Sturm aufzieht."

## 🚦 If-Statement: Die Grundlage aller Entscheidungen

Karol projiziert ein einfaches Beispiel auf die Leinwand:

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

"Aber was, wenn die Ampel **nicht** grün ist?", fragt Karol. Die Leinwand verändert sich und zeigt ein erweitertes Beispiel:

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

"Manchmal gibt es mehr als nur zwei Möglichkeiten", sagt Karol und zaubert ein neues Beispiel hervor:

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

"Um Entscheidungen zu treffen, brauchst du die richtigen Werkzeuge", erklärt Karol und lässt eine Tabelle erscheinen:

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

"Manchmal müssen mehrere Bedingungen gleichzeitig erfüllt sein", fährt Karol fort. Die Leinwand leuchtet heller und zeigt neue Beispiele:

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

"Mit diesem Wissen kannst du jetzt richtig mächtige Programme schreiben", sagt Karol aufgeregt. "Du kannst deinem Code beibringen, intelligente Entscheidungen zu treffen – sei es für die Temperatur eines Zaubertranks oder die Warnsysteme einer Wetterstation. Die Leinwände reagieren bereits positiv, ich spüre es!"

Die Muster auf den Leinwänden flimmern und bilden kurz ein Lächeln, bevor sie wieder zu abstrakten Formen werden.

"Ich glaube, wir sind auf dem richtigen Weg", flüstert Karol. "Die Quantentore zu den Aufgaben öffnen sich. Löse sie, und wir kommen dem Ausgang näher..."

Du betrachtest die schimmernden Quantenknoten, die vor dir erscheinen, und bereitest dich auf die nächste Herausforderung vor.
