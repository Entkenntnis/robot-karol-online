# Robot Karol Web

Zum Editor → https://robot-karol-web.vercel.app/

Der zeitlose Klassiker für den spielerischen Einstieg in die Programmierung.

[![grafik](https://user-images.githubusercontent.com/13507950/128869418-bb857426-1206-46f5-90ac-59875d181de0.png)](https://robot-karol-web.vercel.app/?project=https://entkenntnis.github.io/robot-karol-web/examples/karol.json)

## Übersicht

> Robot Karol ist eine Programmierumgebung mit einer Programmiersprache, die für Schülerinnen und Schüler zum Erlernen des Programmierens und zur Einführung in die Algorithmik gedacht ist. Robot Karol folgt der Tradition der “Mini-Languages”. Dies sind Programmiersprachen, die bewusst über einen kleinen, übersichtlichen Sprachumfang verfügen, um den Einstieg in die Algorithmik zu erleichtern.

> Dem Programm Robot Karol liegt die Idee von [„Karel the Robot“](https://www.cs.mtsu.edu/~untch/karel/index.html) zugrunde, wie sie zum ersten Mal von Richard E. Pattis in “Karel the Robot: A Gentle Introduction to the Art of Programming” veröffentlicht wurde. Die Idee ist, einen Roboter zu programmieren, der in einer “Bildschirmwelt” lebt. Wenn Karol-Programme ablaufen, sehen die Schülerinnen und Schüler an der Reaktion des Roboters sofort, was sie programmiert haben und ob ihr Programm die Aufgabenstellung erfüllt.

Quelle: https://www.mebis.bayern.de/infoportal/empfehlung/robot-karol/

## Funktionsumfang

Aufbauend auf der Programmierumgebung von [Robot Karol 3.0](https://www.mebis.bayern.de/infoportal/empfehlung/robot-karol/) bietet Robot Karol Web folgende Funktionen und **Erweiterungen**:

- Editor für die Sprache Karol, mit Syntaxhervorhebung und **Autovervollständigung**
- Syntaxüberprüfung im Hintergrund mit **Fehlerhervorhebung direkt im Code**
- grafischen Darstellung einer 3D-Welt, die den Roboter Karol als Figur im Raum zeigt und diese je nach Anweisungen bewegt
- Implementation als Web-App, damit ohne Installation **im Browser lauffähig**

## Sprache

### Bewegung

`Schritt` - Karol geht einen Schritt nach vorne. Befehl hat keine Wirkung, wenn Karol vor einer Wand oder einem Quader steht, oder wenn er dabei zwei oder mehr Ziegelhöhen überwinden muss.

`LinksDrehen` - Karol dreht sich um 90° nach links.

`RechtsDrehen` - Karol dreht sich um 90° nach rechts.

`Hinlegen` - Karol legt vor sich einen Ziegel. Befehl hat keine Wirkung, wenn Karol vor einer Wand oder einem Quader steht, oder wenn der Ziegelstapel bereits die maximale Höhe der Welt erreicht hat.

`Aufheben` - Karol hebt einen Ziegel vor sich auf. Befehl hat keine Wirkung, wenn Karol nicht vor einem Ziegel steht.

`MarkeSetzen` - Karol setzt unter sich eine Marke. Befehl hat keine Wirkung, wenn Marke bereits vorhanden.

`MarkeLöschen` - Karol löscht Marke unter sich. Befehl hat keine Wirkung, wenn keine Marke vorhanden.

### Steuerung

`wiederhole {n} mal {Anweisungen} endewiederhole` - Wiederholung mit fester Anzahl, die *Anweisungen* werden *n*-mal wiederholt.

`wiederhole solange {Bedingung} {Anweisungen} endewiederhole` - Wiederholung mit Bedingung, solange die *Bedingung* erfüllt ist, werden die `{Anweisungen}` wiederholt.

`wenn {Bedingung} dann {Anweisungen} endewenn` - Einseitige bedingte Anweisung, die *Anweisungen* werden nur ausgeführt, wenn die *Bedingung* erfüllt ist.

`wenn {Bedingung} dann {Anweisungen A} sonst {Anweisungen B} endewenn` - Zweiseitig bedingte Anweisung, je nach dem, ob die *Bedinung* erfüllt ist, werden entweder *Anweisungen A* oder *Anweisungen B* ausgeführt.

`Beenden` - Karol beendet die Ausführung des Programms.

### Bedingungen

`IstWand` / `NichtIstWand` - Karol testet, ob vor ihm eine Wand (oder ein Quader) ist oder nicht.

`IstZiegel` / `NichtIstZiegel` - Karol testet, ob vor ihm Ziegel liegen oder nicht.

`IstMarke` / `NichtIstMarke` - Karol testet, ob er auf einer Marke steht oder nicht.

### Eigene Anweisungen

`Anweisung {Name} endeAnweisung` - Definiert eine eigene Anweisung, die innerhalb des Programms verwendet werden kann.

`Unterbrechen` - Karol unterbricht die Ausführung der aktuellen Anweisung und springt zum Aufrufer zurück.

### Kommentare

`{ Kommentar }` - Text, der in geschweifte Klammern steht, wird bei der Ausführung ignoriert.

## Umstieg

Über die letzten Jahre hat sich Robot Karol immer wieder weiterentwickelt und neue Sprachelemente erhalten. Dadurch ist der Umfang der Sprache immer wieder angewachsen und besitzt nun eine gewisse Komplexität. Um wieder zurück zu einer "Minisprache" zu kommen, versucht Robot Karol Web, den Umfang der Sprache vorsichtig wieder zu verschlanken. Beim Umstieg sind bezüglich der Sprache folgende Punkte zu beachten:

- Um den Quelltext einheitlicher zu gestalten, wird nun zwischen Groß- und Kleinschreibung unterschieden. Die Autovervollständigung hilft bei der korrekten Schreibung
- Alte Versionen oder alternative Varianten wie `*wenn`, `*Anweisung` oder `Programm` werden nicht mehr unterstützt
- Bedingungen fallen raus, d.h. es lassen sich über `Bedingung`, `wahr` und `falsch` keine eigenen Bedingungen mehr definieren, sondern wird durch den Befehl `Unterbrechen` ersetzt
- Farben sind nicht implementiert
- Zur Vereinfachung fallen auch alle anderen parametrisierten Varianten raus, dazu gehören `Schritt(n)`, `Hinlegen(farbe)`, `IstZiegel(n)` usw. Die übrigen Funktionen lassen sich mit dem vorhandenen Befehlssatz umsetzen.
- Der Rucksack ist nicht implementiert
- Himmelsrichtungen sind nicht implementiert
- Alternative Schleifen-Varianten (wiederhole immer, wiederhole bis, ...) sind nicht unterstützt, außerdem wird das `nicht` Schlüsselwort bei Bedingungen nicht mehr benötigt
- Objekt-Notation und Semikolon sind nicht implementiert
- Ton ist nicht implementiert
- schnell/langsam ist nicht implementiert
- Einbindung von Bibliothek ist nicht implementiert

Falls eine dieser Punkte den Einsatz von Robot Karol Web verhindert, würde ich mich über eine Nachricht freuen. Dann kann ich nochmal die Vorteile und Nachteile eines Einbezugs untersuchen. Ansonsten steht es natürlich weiterhin frei, die vorhandene Desktop-Version von Robot Karol zu nutzen.

## Beispiele

### Schwimmbad

Karol baut ein Schwimmbad und schwimmt hindurch: https://robot-karol-web.vercel.app/?project=https://entkenntnis.github.io/robot-karol-web/examples/schwimmbad.json

### Labyrinth

Karol findet aus einem Labyrinth heraus. Mauern bestehen aus 2 Ziegeln, das Ziel besteht asu einem Ziegel.

Öffnen: https://robot-karol-web.vercel.app/?project=https://entkenntnis.github.io/robot-karol-web/examples/labyrinth.json

### Sortieren

Karol sortiert eine Reihe von Ziegelstapel der Größe nach.

6 Stapel: https://robot-karol-web.vercel.app/?project=https://entkenntnis.github.io/robot-karol-web/examples/sortieren.json

8 Stapel: https://robot-karol-web.vercel.app/?project=https://entkenntnis.github.io/robot-karol-web/examples/sortieren_verbessert.json

### Raum verlassen

Karol findet einen Weg aus einem Raum mit Mauern: https://robot-karol-web.vercel.app/?project=https://entkenntnis.github.io/robot-karol-web/examples/raum_verlassen.json

### Floodfill

Karol füllt eine Fläche: https://robot-karol-web.vercel.app/?project=https://entkenntnis.github.io/robot-karol-web/examples/füllen.json

### Brainf*ck

Hier ein Beweis, dass die Sprache von Robot Karol turing-vollständig ist. Der Beweis gelingt durch die Implementation eines Interpreter für die esoterische Sprache Brainfuck.

Addition: https://robot-karol-web.vercel.app/?project=https://entkenntnis.github.io/robot-karol-web/examples/brainf_ck.json

Multiplikation: https://robot-karol-web.vercel.app/?project=https://entkenntnis.github.io/robot-karol-web/examples/brainf_ck_multiplizieren.json
