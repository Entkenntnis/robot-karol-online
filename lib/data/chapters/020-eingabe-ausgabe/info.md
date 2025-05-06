# 💬 Kapitel 2: Interaktionen

"Wir kommen voran!", feiert Karol mit einem strahlenden Lächeln. "Mal sehen, was uns als Nächstes erwartet. Davor muss ich mal kurz." Sie verschwindet für ein paar Minuten und du bist mit Emi alleine. Du nutzt die Zeit, dich ein wenig im Atelier umzusehen. Die Wände sind übersät mit bunten Bildern, und du bist überrascht, dass viele von Karols Kunstwerken fast kindlich anmuten – farbenfroh, fantasievoll und voller Lebensfreude.

Emi tippt währenddessen konzentriert auf ihrem Laptop. "Willst du auch einen Blick darauf werfen?", fragt sie plötzlich, etwas weniger schroff als zuvor. Du nickst und siehst Codezeilen über ihren Bildschirm flimmern. Aber sobald Karol wieder da ist, klappt sie den Laptop wieder zu und ist wieder ganz ernst.

"Was für Kunst machst du eigentlich?", fragst du, als Karol wieder erscheint. Die alte Dame antwortet mit einem verschmitzten Grinsen: "Haha, das ist eine komplizierte Sache. Früher habe ich mich mit abstrakter Kunst beschäftigt, aber heute male ich hauptsächlich Bilder, die ich an Schulen verschenke, um die Kinder dort ein wenig zu inspirieren..."

Karol schaut für einen kurzen Moment verträumt in die Ferne, dann findet sie sich wieder: "Kunst und Programmieren haben übrigens mehr gemeinsam, als man denkt – bei beiden geht es um Kreativität und Kommunikation!"

Emi übernimmt wieder: "Kommunikation ist das perfekte Stichwort. Jetzt zeige ich euch, wie man dem Computer das Sprechen beibringt und er euch fragen stellen kann."

## 1. Die `print()`-Funktion – sprich mit der Welt!

"Mit `print()` kannst du alles ausgeben – Texte, Zahlen oder Variablen", erklärt Emi und tippt ein paar Beispiele:

```python
print("Hallo Welt! 🌍")

print(42)

alter = 17
print(alter)
```

"So einfach ist das?", fragt Karol erstaunt. "Ja, so einfach", bestätigt Emi, "du kannst alles, was du zeigen möchtest, zwischen die Klammern schreiben."

## 2. Mit `f-Strings` Texte bauen

"Jetzt wird's interessant", fährt Emi fort. "Stell dir vor, du willst nicht nur einzelne Informationen ausgeben, sondern sie in einen schönen Satz packen."

"Wie bei einer Bildunterschrift in einer Ausstellung?", fragt Karol.

"Genau! Dafür sind _f-Strings_ super praktisch", erklärt Emi. "Du kannst damit Text mit Variablen mischen. Schau mal:"

```python
bildart = "Ölgemälde"
jahr = 1995

print(f"Ein {bildart} aus dem Jahr {jahr}.")

# -> Ein Ölgemälde aus dem Jahr 1995.
```

"Das f am Anfang des Textes ist wichtig", betont Emi. "Es bedeutet 'formatierter String'. Und in die geschweiften Klammern schreibst du die Variablen, deren Werte du einfügen möchtest."

## 3. Die `input()`-Funktion – stelle Fragen!

Du meintest, der Computer kan auch Fragen stellen?", hakt Karol nach. "Dafür haben wir die `input()`-Funktion", antwortet Emi und tippt weiter:

```python
# Einfache Eingabe
name = input("Wie heißt du? ")

print(f"Hallo, {name}! 😊")
```

"Probier's aus", fordert sie dich auf. Du tippst deinen Namen ein und das Programm begrüßt dich persönlich. Karol ist begeistert und klatscht in die Hände.

"Die Zeichenkette in den Klammern ist die Frage, die angezeigt wird", erklärt Emi. "Und was der Benutzer eingibt, wird in der Variable gespeichert.

## 4. Typumwandlung – mach aus Text eine Zahl

Es gibt aber einen kleinen Haken, `input` gibt immer nur einen Text zurück. Wenn ihr eine Zahl abfragen wollt, muss dieser noch in eine Zahl umwandelt werden. So, jetzt wisst ihr Bescheid, wenn euer Programm später einen Fehler wirft, dann beschwert euch nicht, ich hätte es euch nicht erklärt!"

```python
# String zu Integer
geburtsjahr = int(input("Geburtsjahr: "))

aktuelles_jahr = 2025
alter = aktuelles_jahr - geburtsjahr
print(f"Du bist etwa {alter} Jahre jung! 🎂")
```

"Die `int()`-Funktion wandelt den Text in eine ganze Zahl um", erklärt Emi. "Für Kommazahlen würden wir `float()` verwenden."

## 💡 Wichtigste Erkenntnisse

Karol bittet dich, einen Blick über ihre Notizen zu werfen und diese zu überprüfen:

- `print()` gibt Informationen aus – deine Botschaft an die Welt
- `input()` nimmt Eingaben entgegen – immer als Text (String)
- `f-Strings` mit `{variable}` sind perfekt, um Texte mit Daten zu mischen
- Mit `int()` und `float()` wandelst du Text in Zahlen um

"Und, passt alles?". Du sieht keine Probleme und nickst. Du sprichst Emi an: "Lass mal raten, Dozentin, jetzt ist wieder Zeit für Übungsaufgaben?"

Emi lächelt – zum ersten Mal, seit du hier bist. "Genau. Ab an die Aufgaben ihr beiden! Hop, hop, worauf wartet ihr noch? 🎮💬"
