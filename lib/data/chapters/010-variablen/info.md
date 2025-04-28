# 🎓 Kapitel 1: Variablen

Karol spricht weiter: Diese Leinwände sind eine Verbindung aus Quantentechnik und AI. Seitdem ich hier gefangen bin, konnte ich ihre innere Struktur untersuchen und sie ist sehr faszinierend, aber auch verwirrend. Anscheinend gibt es die Möglichkeit, durch Python-Code mit der Quantenstruktur zu kommunizieren. Es kann daher nicht schaden, wenn ich dir ein paar Grundlagen der Programmiersprache zeige. Aber keine Sorge, ich werde mich knapp halten.

Lass dich nicht von Variablen erschrecken, sie sind viel einfacher zu verstehen als in der Mathematik. Sie funktionieren wie kleine Boxen, in denen du Informationen speichern kannst:

```py
name = "Anna"
alter = 14
größe = 1.65
kann_schwimmen = True
```

Das `=` nennt sich _Wertzuweisung_ und speichert den Wert auf der rechten Seite unter den Namen auf der linken Seite.

## 📦 Datentypen im Überblick

### 1. Strings - Für Text

Nutze doppelte Anführungszeichen.

```python
name = "Max"
```

### 2. Integer - Ganze Zahlen

```python
alter = 12
klassenstufe = 7
```

### 3. Float - Kommazahlen

Verwende als Dezimaltrenner einen Punkt.

```python
note = 2.3
pi = 3.14159
```

### 4. Boolean - Wahrheitswerte

```python
hat_geübt = True
ist_ferien = False
```

## 🔄 Variablen verändern

Du kannst Werte jederzeit ändern:

```python
punkte = 10
print(punkte)  # Ausgabe: 10

punkte = 15    # Neuer Wert
print(punkte)  # Ausgabe: 15
```

## 🚫 Verbotene Namen

So geht's **nicht**:

```python
2pac = "Rapper"    # Zahl am Anfang
mein-name = "Lena" # Bindestrich nicht erlaubt
class = 8B         # Schlüsselwörter verboten
```

Achte bei den Variablenamen auf Groß- und Kleinschreibung!

## 💡 Kommentare

Manchmal stehen Erklärungen im Text. Diese beginnen mit einem `#` (Hash-Tag).

```python
# Diese Variable zählt die Highscores
highscore = 0  # Startwert ist 0
```
