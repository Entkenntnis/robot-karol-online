# Robot Karol Web

Zum Editor → https://robot-karol-web.vercel.app/

Der zeitlose Klassiker für den spielerischen Einstieg in die Programmierung.

[![grafik](https://user-images.githubusercontent.com/13507950/128869418-bb857426-1206-46f5-90ac-59875d181de0.png)](https://robot-karol-web.vercel.app/?project=https://entkenntnis.github.io/robot-karol-web/examples/karol.json)

## Übersicht

> Robot Karol ist eine Programmierumgebung mit einer Programmiersprache, die für Schülerinnen und Schüler zum Erlernen des Programmierens und zur Einführung in die Algorithmik gedacht ist. Robot Karol folgt der Tradition der “Mini-Languages”. Dies sind Programmiersprachen, die bewusst über einen kleinen, übersichtlichen Sprachumfang verfügen, um den Einstieg in die Algorithmik zu erleichtern.

> Dem Programm Robot Karol liegt die Idee von [„Karel the Robot“](https://www.cs.mtsu.edu/~untch/karel/index.html) zugrunde, wie sie zum ersten Mal von Richard E. Pattis in “Karel the Robot: A Gentle Introduction to the Art of Programming” veröffentlicht wurde. Die Idee ist, einen Roboter zu programmieren, der in einer “Bildschirmwelt” lebt. Wenn Karol-Programme ablaufen, sehen die Schülerinnen und Schüler an der Reaktion des Roboters sofort, was sie programmiert haben und ob ihr Programm die Aufgabenstellung erfüllt.

Quelle: https://www.mebis.bayern.de/infoportal/empfehlung/robot-karol/

## Funktionsumfang

Aufbauend auf derProgrammierumgebung von [Robot Karol 3.0](https://www.mebis.bayern.de/infoportal/empfehlung/robot-karol/) bietet Robot Karol Web folgende Funktionen und **Erweiterungen**:

- Editor für die Sprache Karol, mit Syntaxhervorhebung und **Autovervollständigung**
- Syntaxüberprüfung im Hintergrund mit **Fehlerhervorhebung direkt im Code**
- grafischen Darstellung einer 3D-Welt, die den Roboter Karol als Figur im Raum zeigt und diese je nach Anweisungen bewegt
- Implementation als Web-App, damit ohne Installation **im Browser lauffähig**

## Sprache

Über die letzten Jahre hat Robot Karol immer wieder weiterentwickelt und hat neue Sprachelemente erhalten. Dadurch ist der Umfang der Sprache immer wieder angewachsen und besitzt nun eine gewisse Komplexität. Um wieder zurück zu einer "Minisprache" zu kommen, versucht Robot Karol Web, den Umfang der Sprache vorsichtig wieder zu verschlanken. Das Ergebnis wir hier nun vorgestellt:

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

### Bedingung

`IstWand` / `NichtIstWand` - Karol testet, ob vor ihm eine Wand (oder ein Quader) ist oder nicht.

`IstZiegel` / `NichtIstZiegel` - Karol testet, ob vor ihm Ziegel liegen oder nicht.

`IstMarke` / `NichtIstMarke` - Karol testet, ob er auf einer Marke steht oder nicht.

### Anweisungen

`Anweisung {Name} endeAnweisung` - Definiert eine Anweisung, die innerhalb des Programms verwendet werden kann.

`Unterbrechen` - Karol unterbricht die Ausführung der aktuellen Anweisung und springt zum Aufrufer zurück.

### Ausgelassene Funktionen

TODO


## LALALA
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
