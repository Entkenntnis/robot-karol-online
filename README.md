# Robot Karol Web

Zum Editor → https://robot-karol-web.vercel.app/

Der zeitlose Klassiker für den spielerischen Einstieg in die Programmierung.

[![grafik](https://user-images.githubusercontent.com/13507950/128869418-bb857426-1206-46f5-90ac-59875d181de0.png)](https://robot-karol-web.vercel.app/?project=https://entkenntnis.github.io/robot-karol-web/examples/karol.json)

## Didaktik

### Lernziele:

Die Schülerinnen und Schüler ...

- analysieren und strukturieren geeignete Problemstellungen u. a. aus ihrer Erfahrungswelt (z. B. Bedienung eines Geräts), entwickeln Algorithmen zu deren Lösung und beschreiben diese unter effizienter Verwendung von Kontrollstrukturen.
- setzen unter sinnvoller Nutzung algorithmischer Bausteine einfache Algorithmen mithilfe geeigneter Programmierwerkzeuge um. 

### Inhalte

- Algorithmus: Definition des Begriffs, Strukturelemente (Anweisung, Sequenz, ein- und zweiseitig bedingte Anweisung, Wiederholung mit fester Anzahl, Wiederholung mit Bedingung)
- Fachbegriffe: Algorithmus, Anweisung, Sequenz, ein- und zweiseitig bedingte Anweisung, Wiederholung mit fester Anzahl, Wiederholung mit Bedingung 

Quelle: [Lehrplan Bayern, NT7 2.3](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/7/nt_gym)

## Sprachumfang

- Grundbefehle: Schritt, LinksDrehen, RechtsDrehen, Hinlegen, Aufheben, MarkeSetzen, MarkeLöschen
- Steuerung: wenn - dann, wenn - dann - sonst, wiederhole n mal, wiederhole solange
- Bedingungen: IstWand, IstZiegel, IstMarke, NichtIstWand, NichtIstZiegel, NichtIstMarke
- Anweisungen: Anweisung, Unterbrechen(*)

(Unterbrechen beendet die Ausführung einer selbstdefinierten Anweisung, entspricht einem `return`. Das ist eine Erweiterung zu Robot Karol. Damit werden keine selbstdefinierten Bedingungen benötigt, sondern können über entsprechende Anweisungen umgesetzt werden)

Für mehr Funktionen kann auf die Originalversion von Robot Karol unter https://www.mebis.bayern.de/infoportal/empfehlung/robot-karol/ zurückgegriffen werden.

## Beispiele

### Schwimmbad

Karol baut ein Schwimmbad und schwimmt hindurch: https://robot-karol-web.vercel.app/?project=https://entkenntnis.github.io/robot-karol-web/examples/schwimmbad.json

### Labyrinth

Karol findet aus einem Labyrinth heraus. Mauern bestehen aus 2 Ziegeln, das Ziel besteht asu einem Ziegel.

Öffnen: https://robot-karol-web.vercel.app/?project=https://entkenntnis.github.io/robot-karol-web/examples/labyrinth.json

### Brainfuck

Hier ein Beweis, dass die Sprache von Robot Karol turing-vollständig ist. Der Beweis gelingt durch die Implementation eines Interpreter für die esoterische Sprache Brainfuck.

Addition: https://robot-karol-web.vercel.app/?project=https://entkenntnis.github.io/robot-karol-web/examples/brainf_ck.json

Multiplikation: https://robot-karol-web.vercel.app/?project=https://entkenntnis.github.io/robot-karol-web/examples/brainf_ck_multiplizieren.json

### Sortieren

Karol sortiert eine Reihe von Ziegelstapel der Größe nach.

6 Stapel: https://robot-karol-web.vercel.app/?project=https://entkenntnis.github.io/robot-karol-web/examples/sortieren.json

8 Stapel: https://robot-karol-web.vercel.app/?project=https://entkenntnis.github.io/robot-karol-web/examples/sortieren_verbessert.json

### Raum verlassen

Karol findet einen Weg aus einem Raum mit Mauern: https://robot-karol-web.vercel.app/?project=https://entkenntnis.github.io/robot-karol-web/examples/raum_verlassen.json

### Floodfill

Karol füllt eine Fläche: https://robot-karol-web.vercel.app/?project=https://entkenntnis.github.io/robot-karol-web/examples/füllen.json
