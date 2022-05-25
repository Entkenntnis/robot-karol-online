# Robot Karol Web

Zum Editor → https://karol.arrrg.de/

Der zeitlose Klassiker für den spielerischen Einstieg in die Programmierung.

<img src="https://user-images.githubusercontent.com/13507950/170216019-869efcd5-dda6-40c1-a071-e8e4380cb3e7.png" width=900 />

## Übersicht

> Robot Karol ist eine Programmierumgebung mit einer Programmiersprache, die für Schülerinnen und Schüler zum Erlernen des Programmierens und zur Einführung in die Algorithmik gedacht ist. Robot Karol folgt der Tradition der “Mini-Languages”. Dies sind Programmiersprachen, die bewusst über einen kleinen, übersichtlichen Sprachumfang verfügen, um den Einstieg in die Algorithmik zu erleichtern.

> Dem Programm Robot Karol liegt die Idee von [„Karel the Robot“](https://www.cs.mtsu.edu/~untch/karel/index.html) zugrunde, wie sie zum ersten Mal von Richard E. Pattis in “Karel the Robot: A Gentle Introduction to the Art of Programming” veröffentlicht wurde. Die Idee ist, einen Roboter zu programmieren, der in einer “Bildschirmwelt” lebt. Wenn Karol-Programme ablaufen, sehen die Schülerinnen und Schüler an der Reaktion des Roboters sofort, was sie programmiert haben und ob ihr Programm die Aufgabenstellung erfüllt.

Quelle: https://www.mebis.bayern.de/infoportal/empfehlung/robot-karol/

## Funktionsumfang

Aufbauend auf der Programmierumgebung von [Robot Karol 3.0](https://www.mebis.bayern.de/infoportal/empfehlung/robot-karol/) bietet Robot Karol Web folgende Funktionen und **Erweiterungen**:

- Implementation als Web-App, damit ohne Installation **im Browser lauffähig**
- **Live-Vorschau** der Ausführung für direktes Feedback
- **Aufgaben**, um die eigenen Programmierfähigkeiten zu testen und zu verbessern
- Editor für die Sprache Karol, mit Syntaxhervorhebung und **Autovervollständigung**
- Syntaxüberprüfung im Hintergrund mit **Fehlerhervorhebung direkt im Code**
- grafischen Darstellung einer 3D-Welt, die den Roboter Karol als Figur im Raum zeigt und diese je nach Anweisungen bewegt

## Sprache

### Bewegung

`Schritt` - Karol geht einen Schritt nach vorne.

`LinksDrehen` - Karol dreht sich um 90° nach links.

`RechtsDrehen` - Karol dreht sich um 90° nach rechts.

`Hinlegen` - Karol legt vor sich einen Ziegel.

`Aufheben` - Karol hebt einen Ziegel vor sich auf.

`MarkeSetzen` - Karol setzt unter sich eine Marke.

`MarkeLöschen` - Karol löscht Marke unter sich.

### Steuerung

`wiederhole {n} mal {Anweisungen} endewiederhole` - Wiederholung mit fester Anzahl

`wiederhole solange {Bedingung} {Anweisungen} endewiederhole` - Wiederholung mit Bedingung

`wenn {Bedingung} dann {Anweisungen} endewenn` - Einseitige bedingte Anweisung

`wenn {Bedingung} dann {Anweisungen A} sonst {Anweisungen B} endewenn` - Zweiseitig bedingte Anweisung

`Beenden` - Karol beendet an dieser Stelle die Ausführung des Programms.

### Bedingungen

`IstWand` / `NichtIstWand` - Karol testet, ob vor ihm eine Wand (oder ein Quader) ist oder nicht.

`IstZiegel` / `NichtIstZiegel` - Karol testet, ob vor ihm Ziegel liegen oder nicht.

`IstMarke` / `NichtIstMarke` - Karol testet, ob er auf einer Marke steht oder nicht.

### Eigene Anweisungen

`Anweisung {Name} endeAnweisung` - Definiert eine eigene Anweisung, die innerhalb des Programms verwendet werden kann.

`Unterbrechen` - Karol unterbricht die Ausführung der aktuellen Anweisung und springt zum Aufrufer zurück (d.h. ein _return_-statement).

### Kommentare

`{ Kommentar }` - Text, der in geschweifte Klammern steht, wird bei der Ausführung ignoriert.

## Umstieg

Über die letzten Jahre hat sich Robot Karol immer wieder weiterentwickelt und neue Sprachelemente erhalten. Dadurch ist der Umfang der Sprache immer wieder angewachsen und besitzt nun eine gewisse Komplexität. Um wieder zurück zu einer "Minisprache" zu kommen, versucht Robot Karol Web, den Umfang der Sprache vorsichtig wieder zu verschlanken. Beim Umstieg sind bezüglich der Sprache folgende Punkte zu beachten:

- Um den Quelltext einheitlicher zu gestalten, wird nun zwischen Groß- und Kleinschreibung unterschieden. Die Autovervollständigung hilft bei der korrekten Schreibung
- Alte oder alternative Varianten der Kontrollstrukturen wie `*wenn`, `*Anweisung` oder `Programm` werden nicht mehr unterstützt
- Bedingungen fallen raus, d.h. es lassen sich über `Bedingung`, `wahr` und `falsch` keine eigenen Bedingungen mehr definieren, sondern wird durch den Befehl `Unterbrechen` ersetzt
- Farbige Ziegel und Marken sind nicht implementiert
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

Diese Beispiele sollen zeigen, welche Algorithmen mit Robot Karol umsetzbar sind. Dabei sind der Kreativität kaum Grenzen gesetzt.

### Schwimmbad

Karol baut ein Schwimmbad und schwimmt hindurch: https://karol.arrrg.de/?project=https://entkenntnis.github.io/robot-karol-web/examples/schwimmbad.json

### Schachbrett

Karol legt mit Marken ein Schachbrettmuster: https://karol.arrrg.de/?project=https://entkenntnis.github.io/robot-karol-web/examples/schachbrett.json

### Invertieren

Karol invertiert den gesamten Boden: https://karol.arrrg.de/?project=https://entkenntnis.github.io/robot-karol-web/examples/allesinvertieren.json

### Aufräumen

Karol hebt alle Ziegel auf und plaziert sie hinter dem gelben Streifen: https://karol.arrrg.de/?project=https://entkenntnis.github.io/robot-karol-web/examples/stapeln.json

### Raum verlassen

Karol findet den Weg aus einem beliebigen Raum heraus: https://karol.arrrg.de/?project=https://entkenntnis.github.io/robot-karol-web/examples/raum_verlassen.json

### Floodfill

Karol füllt eine Fläche mit dem rekursivenFloodfill-Algorithmus: https://karol.arrrg.de/?project=https://entkenntnis.github.io/robot-karol-web/examples/füllen.json

### Labyrinth

Karol findet das Ziel in einem Labyrinth. Mauern bestehen aus 2 Ziegeln, das Ziel besteht aus einem Ziegel: https://karol.arrrg.de/?project=https://entkenntnis.github.io/robot-karol-web/examples/labyrinth.json

### Binärzahl als Dezimalzahl ausgeben

Karol liest eine Binärzahl ein und zeigt diese in dezimal an: https://karol.arrrg.de/?project=https://entkenntnis.github.io/robot-karol-web/examples/binär_konverter.json

### Sortieren

Karol sortiert eine Reihe von Ziegelstapel der Größe nach.

6 Stapel: https://karol.arrrg.de/?project=https://entkenntnis.github.io/robot-karol-web/examples/sortieren.json

8 Stapel: https://karol.arrrg.de/?project=https://entkenntnis.github.io/robot-karol-web/examples/sortieren_verbessert.json

### Game of Life

Karol simuliert Conways Game of Life: https://karol.arrrg.de/?project=https://entkenntnis.github.io/robot-karol-web/examples/game_of_life.json

### Turing-Vollständigkeit

Zum krönenden Abschluss soll in diesem Beispiel bewiesen werden, dass Robot Karol turing-vollständig ist. Das heißt, dass jede berechenbare Funktion von Karol implementiert werden kann.

Der Beweis gelingt durch die Nutzung von brainf_ck - einer esoterischen Sprache, die an sich bereits turing-vollständig ist. Gelingt es, diese Sprache umzusetzen, dann ist die Vollständigkeit bewiesen.

Ein solcher Interpreter ist möglich. Die beiden folgenden Dateien zeigen einmal ein Beispiel für die Addition und einmal für die Multiplikation. Der brainf_uck Quellcode steht an der hinteren Wand. Die Speicherzellen finden sich an der linken Wand.

Addition: https://karol.arrrg.de/?project=https://entkenntnis.github.io/robot-karol-web/examples/brainf_ck.json

Multiplikation: https://karol.arrrg.de/?project=https://entkenntnis.github.io/robot-karol-web/examples/brainf_ck_multiplizieren.json

## Kontakt

Nachrichten können gerne direkt auf Github in den Issues angelegt werden.
