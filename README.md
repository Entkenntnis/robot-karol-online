# Robot Karol Web

Zum Editor → https://robot-karol-web.vercel.app/

Der zeitlose Klassiker für den spielerischen Einstieg in die Programmierung.

[![grafik](https://user-images.githubusercontent.com/13507950/128869418-bb857426-1206-46f5-90ac-59875d181de0.png)](https://robot-karol-web.vercel.app/?project=https://entkenntnis.github.io/robot-karol-web/examples/karol.json)

## Übersicht

> Robot Karol ist eine Programmierumgebung mit einer Programmiersprache, die für Schülerinnen und Schüler zum Erlernen des Programmierens und zur Einführung in die Algorithmik gedacht ist. Robot Karol folgt der Tradition der “Mini-Languages”. Dies sind Programmiersprachen, die bewusst über einen kleinen, übersichtlichen Sprachumfang verfügen, um den Einstieg in die Algorithmik zu erleichtern.

> Dem Programm Robot Karol liegt die Idee von [„Karel the Robot“](https://www.cs.mtsu.edu/~untch/karel/index.html) zugrunde, wie sie zum ersten Mal von Richard E. Pattis in “Karel the Robot: A Gentle Introduction to the Art of Programming” veröffentlicht wurde. Die Idee ist, einen Roboter zu programmieren, der in einer “Bildschirmwelt” lebt. Wenn Karol-Programme ablaufen, sehen die Schülerinnen und Schüler an der Reaktion des Roboters sofort, was sie programmiert haben und ob ihr Programm die Aufgabenstellung erfüllt.

Quelle: https://www.mebis.bayern.de/infoportal/empfehlung/robot-karol/

## Funktionsumfang

- Editor für die Sprache Karol, mit Syntaxhervorhebung und **Autovervollständigung**
- Syntaxüberprüfung im Hintergrund mit **Fehlerhervorhebung direkt im Code**
- grafischen Darstellung einer 3D-Welt, die den Roboter Karol als Figur im Raum zeigt und diese je nach Anweisungen bewegt
- Implementation als Web-App, damit ohne Installation **im Browser lauffähig**

Die markierten Funktionen sind Ergänzungen zur Desktop-Version von [Robot Karol 3.0](https://www.mebis.bayern.de/infoportal/empfehlung/robot-karol/).

## Sprache

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
