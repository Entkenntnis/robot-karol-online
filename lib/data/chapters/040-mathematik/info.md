# 🧮 Kapitel 4: Mathe-Genie – Rechnen wie ein Profi!

"Ich glaube, wir können jetzt etwas anspruchsvoller werden", sagt Emi mit einem Blick zu Karol. Du bemerkst ihr kurzes Zögern. "In echten Programmen dreht sich vieles um Zahlen und Berechnungen."

Karol streicht sich eine graue Haarsträhne aus dem Gesicht. "Tatsächlich habe ich mich kürzlich mit dem goldenen Schnitt beschäftigt." Ihre Hände zittern leicht. "Zu schade, dass meine Lehrer früher nie den Zusammenhang zwischen Kunst und Zahlen erklärt haben."

Max lehnt sich vor, die Müdigkeit in seinen Augen erkennbar. "Meine Mutter sagt immer, dass Mathe das Herz der Programmierung ist. Letzte Woche hat sie mich beim Abendessen mit Binärzahlen gelöchert." Tim wirft ihm einen besorgten Blick zu.

## 1. Arithmetische Grundoperationen

"Python versteht alle Grundrechenarten:", erklärt Emi, ihre Stimme sanfter als sonst.

```python
print(5 + 3)   # Addition: 8
print(10 - 4)  # Subtraktion: 6
print(2 * 6)   # Multiplikation: 12
print(8 / 2)   # Division: 4.0 (Achtung, Ergebnis ist float!)
```

"Was bedeutet diese Anmerkung mit dem 'float'?", fragst du, trotz deiner Angst, dumm zu wirken.

"Gute Frage! Bei der Division gibt Python immer eine Dezimalzahl zurück, auch wenn das Ergebnis eine ganze Zahl ist."

## 2. Punkt-vor-Strich & Klammern

"Karol, erinnerst du dich an die Regel 'Punkt vor Strich' aus der Schule?", fragt Emi.

Karol verzieht kurz das Gesicht. "Meine Mathelehrerin war... nicht gerade ermutigend." Ein Schatten huscht über ihr Gesicht.

```python
print(3 + 4 * 2)   # 11 (nicht 14!)
print((3 + 4) * 2) # 14 – Klammern ändern alles!
```

Tim erklärt leise: "Mit Klammern kannst du die Reihenfolge ändern." Du hörst den Hauch von Stolz in seiner Stimme.

## 3. Turbo-Zuweisungen 🚀

```python
punkte = 10
punkte += 5  # Äquivalent zu: punkte = punkte + 5
print(punkte) # 15

# Funktioniert auch mit -=, *=, /=
```

"Das ist wie im Spiel!", ruft Tim begeistert. Seine plötzliche Begeisterung lässt sein schüchternes Wesen kurz in den Hintergrund treten.

## 4. Power mit \*\*

```python
print(2 ** 3)  # 8 (2³)
print(5 ** 0.5) # Wurzel aus 5 ≈ 2.236
```

"Mit 5 hoch 0.5 kann ich Wurzeln ziehen?", fragt Karol überrascht.

Max erklärt: "Die Wurzel ist dasselbe wie Potenzieren mit 1/2." Seine Wangen färben sich leicht rot, als Emi ihm anerkennend zunickt.

## 5. Mathe-Modul für Profis

"Für komplexere Berechnungen brauchen wir das 'math'-Modul:", erklärt Emi, während ihre Hände nervös über die Tastatur huschen.

```python
import math

# Wurzel ziehen
print(math.sqrt(25))  # 5.0

# Mit Pi rechnen
radius = 3
umfang = 2 * math.pi * radius
print(f"Umfang: {umfang:.2f} cm")  # Formatierung auf 2 Nachkommastellen
```

"Was bedeutet dieser Teil mit '{umfang:.2f}'?", fragst du mit klopfendem Herzen.

"Das ist eine erweiterte Form der f-Strings. Der Teil ':.2f' bedeutet, dass wir die Zahl auf zwei Dezimalstellen formatieren."

Karol murmelt: "Ich habe immer auf ganze Euro-Beträge gerundet, weil mir die Berechnung zu kompliziert war."

## 6. Variablen im Einsatz

"Lass uns das Ganze praktisch anwenden", sagt Emi.

```python
# Fläche berechnen
länge = 8
breite = 5
fläche = länge * breite
print(f"Die Fläche beträgt {fläche} m²")  # 40 m²

# Der goldene Schnitt
phi = (1 + math.sqrt(5)) / 2
print(f"Der goldene Schnitt beträgt etwa: {phi:.3f}")  # ungefähr 1.618
```

"Fantastisch!", ruft Karol. "Wenn ich damals in der Schule gewusst hätte, wozu all diese abstrakten Zahlen gut sind..."

"Ihr müsst nicht alles auswendig lernen", beruhigt Emi euch, während sie nervös mit ihrem Armband spielt. "Die meisten Programmierer schlagen regelmäßig in der Dokumentation nach."

"Zeit für eine Pause", schlägt Karol vor und massiert ihre Schläfen. "Mein alter Kopf braucht etwas Zeit zum Verarbeiten."

Du bemerkst, wie Tim dir immer wieder nervöse Blicke zuwirft, und fragst dich, ob deine Abneigung gegen Mathe vielleicht gar nicht so stark ist, wie du immer gedacht hast – ein Gedanke, der dich gleichzeitig befreit und beunruhigt.
