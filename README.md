# Robot Karol Web

![grafik](https://user-images.githubusercontent.com/13507950/128488062-3c1bdba3-0992-4354-b944-7f1af8ca1fa1.png)

Dein spielerische Einstieg in die Programmierung - direkt im Browser.

Probiere es gleich hier aus: https://robot-karol-web.vercel.app/

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

![grafik](https://user-images.githubusercontent.com/13507950/128593525-dbb6576a-2011-4725-a5da-403c54b58a41.png)

Öffnen: https://robot-karol-web.vercel.app/?project=https://entkenntnis.github.io/robot-karol-web/examples/labyrinth.json
