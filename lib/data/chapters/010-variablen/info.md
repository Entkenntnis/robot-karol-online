# 🎓 Kapitel 1: Variablen

Im Karols Atelier sind einige Laptops aufgestellt, an der einzig freien Wand projeziert ein Beamer, den man aber im hellen Licht kaum lesen kann. "Den werden wir erstmal nicht brauchen, solange ihr zu zweit seid", bemerkt Emi.

Du traust dich dann doch zu fragen: "Kommen noch weitere Leute?" Karol nickt: "Ein paar weitere Leute haben sich angemeldet, sie kommen etwas später. Wir sollen ruhig schon mal mit den ersten Themen anfangen. Ich brauche ja eh etwas mehr Zeit als die anderen." Karol gibt Emi ein Zeichen, sie räuspert sich ganz professionell und der Workshop beginnt.

"Ich möchte mit Variablen anfangen. Diese sind sind ein entspannter Einstieg. Stellt es euch so vor: Der Computer muss sich ja viele Dinge merken. Und jede Information speichert dein Programm in einer solchen Variable." Emi fängt an zu tippen:

```py
farbe = "blasslila"
pinsel_größe = 13
bild_breite_cm = 27.8
ist_inspiriert = True
```

"So kannst du, meine Tante, dir die wichtigsten Dinge notieren, falls du sie mal wieder vergisst."

"Hey, so alt bin ich auch wieder nicht", beschwert sich Karol. Gut zu wissen, dass Emi nicht nur dir gegenüber etwas schnippisch ist.

"Sind das alle Arten von Informationen, die man speichern kann?", fragt Karol zurück. "Ich würde erstmal mit diesen anfangen", erklärte Emi. "Später kannst du aus diesen grundlegenden Datentypen größere Objekte bauen oder eine Liste anlegen. Ah, ich sollte vielleicht noch ein paar Details ergänzen.

Dieses Gleichheitszeichen (`=`) ist eine Wertzuweisung:

```
<Name der Variable> = <Wert>
```

Dabei wird der alte Wert der Variable weggeschmissen und der neue Wert geschrieben. Der Name ist wichtig, denn nur mit diesem kannst du auf die Information zugreifen. Du kannst einer Variable jederzeit einen neuen Wert zuweisen:

```py
farbe = "grün"

# Wert von Variable farbe ist in diesem Bereich "grün"

farbe = "rot"

# Wert von Variable farbe ist in diesem Bereich "rot"

farbe = "dunkelviolett"
```

Jede Variable hat außerdem einen Typ. Nicht wie die Typen auf der Straße, sondern im Sinne von Kategorie. Ihr habt die vier wichtigsten Typen jetzt gesehen, ich fasse sie für euch nochmal zusammen.

## Datentypen im Überblick

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

## 📝 Kommentare

```py
# die Lieblingsfarbe meiner Tante
farbe = "?" # bitte noch ausfüllen
```

Die grauen Text hinter dem `#` (Hashtag) sind _Kommentare_. Sie erklären den Code und werden vom Computer ignoriert.

## 🚫 Verbotene Namen

Ihr dürft die Variablenamen fast beliebig wählen. Ein paar wenige Sachen sind nicht erlaubt:

```python
2pac = "Rapper"    # Zahl am Anfang geht nicht
mein-name = "Emi" # Bindestrich nicht erlaubt
class = 8         # Schlüsselwörter verboten
```

Achte bei den Variablenamen auf Groß- und Kleinschreibung! Diese machen einen Unterschied und `alter` ist eine andere Variable als `ALTER`.

## 🏋️ Übungen

Bis hierher alles klar?", Emi blickt uns beide an. Du nickst brav, Karol ist voller Tatendrang und bittet Emi, uns ein paar Übungsaufgaben zu stellen, damit wir die Theorie etwas üben können. Sie antwortet nur: "Ich wäre doch eine schlechte Dozentin wenn ich keine Übungsaufgaben vorbereitet hätte."
