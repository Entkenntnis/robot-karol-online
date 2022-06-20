# Robot Karol Web

Zum Editor → https://karol.arrrg.de/

Der zeitlose Klassiker für den spielerischen Einstieg in die Programmierung.

<img src="https://user-images.githubusercontent.com/13507950/174500998-32a2f0f0-ceb2-45b3-8bfd-78668a5053c8.png"/>

## Übersicht

> Robot Karol ist eine Programmierumgebung mit einer Programmiersprache, die für Schülerinnen und Schüler zum Erlernen des Programmierens und zur Einführung in die Algorithmik gedacht ist. Robot Karol folgt der Tradition der “Mini-Languages”. Dies sind Programmiersprachen, die bewusst über einen kleinen, übersichtlichen Sprachumfang verfügen, um den Einstieg in die Algorithmik zu erleichtern.

> Dem Programm Robot Karol liegt die Idee von [„Karel the Robot“](https://www.cs.mtsu.edu/~untch/karel/index.html) zugrunde, wie sie zum ersten Mal von Richard E. Pattis in “Karel the Robot: A Gentle Introduction to the Art of Programming” veröffentlicht wurde. Die Idee ist, einen Roboter zu programmieren, der in einer “Bildschirmwelt” lebt. Wenn Karol-Programme ablaufen, sehen die Schülerinnen und Schüler an der Reaktion des Roboters sofort, was sie programmiert haben und ob ihr Programm die Aufgabenstellung erfüllt.

Quelle: https://www.mebis.bayern.de/infoportal/empfehlung/robot-karol/

Die Idee eines programmierbaren kleinen Roboters in einer Bildschirmwelt ist für den Einstieg in das Programmmieren kaum mehr wegzudenken. Die aktuell genutzte Implementierung ist [Robot Karol 3.0](https://www.mebis.bayern.de/infoportal/empfehlung/robot-karol/) und weitverbreitet. Das Design davon stammt aus dem Jahr 1993 und ist damit schon fast 30 Jahre alt! Das heißt erstmal: Es ist was Bewährtes. Aber es gib immer wieder Entwicklungen, bei denen es sich lohnt, nochmal über das Design einer Software nachzudenken.

Eine dieser Entwicklungen ist aus meiner Sicht die block-basierte Programmierung. Es wird damit nicht nur das leidige Problem mit Syntaxfehler umgangen - sondern sie gibt dem Programmieren auch ein ganz anderes Gefühl - bisschen so wie Lego. Man hat seinen Baukasten mit unterschiedlichen Steinen und kann diese zu größeren Gebilde zusammenstecken. Nur dass es keine Plastikquader sind, sondern Befehle und Kontrollstrukturen. Ein solches Gefühl zu erleben ist zentral, vor allem beim Einstieg, denn das ist der Punkt, an dem Menschen sich entscheiden, weiterzumachen oder aufzuhören!

Diese Neuimplementation versucht, das Bewährte zu erhalten und mit Neuem zu mischen. Die Regeln der Welt und die graphische Darstellung sind geblieben (bis auf einen neuen Karol im Paper-Look) - dazu gesellt sich nun ein blockbasierter Editor (powered by [Blockly](https://github.com/google/blockly)). Programmieren mit Text ist weiterhin möglich und erwünscht, vor allem im Hinblick auf den Anschluss an gängige Programmiersprachen. Ein Wechsel zwischen Blöcken und Code (in beide Richtungen) ist möglich.

## Sprache

### Bewegung

![grafik](https://user-images.githubusercontent.com/13507950/174558915-005a88e7-19fd-415f-b97a-27a857eb36a1.png)

`Schritt` - Karol geht einen Schritt nach vorne.

`Schritt(anzahl)` - Karol geht `anzahl` Schritte nach vorne.

`LinksDrehen` - Karol dreht sich um 90° nach links.

`RechtsDrehen` - Karol dreht sich um 90° nach rechts.

`Hinlegen` - Karol legt vor sich einen Ziegel.

`Hinlegen(anzahl)` - Karol legt vor sich `anzahl` Ziegel.

`Aufheben` - Karol hebt einen Ziegel vor sich auf.

`Aufheben(anzahl)` - Karol hebt `anzahl` Ziegel vor sich auf.

`MarkeSetzen` - Karol setzt unter sich eine Marke.

`MarkeLöschen` - Karol löscht Marke unter sich.

`Beenden` - Karol beendet an dieser Stelle die Ausführung des Programms.

### Steuerung

![grafik](https://user-images.githubusercontent.com/13507950/174559742-710a0d46-b8ea-4224-915f-e8bb692a0381.png)

`wiederhole {n} mal {Anweisungen} endewiederhole` - Wiederholung mit fester Anzahl

`wiederhole solange {Bedingung} {Anweisungen} endewiederhole` - Wiederholung mit Bedingung

`wenn {Bedingung} dann {Anweisungen} endewenn` - Einseitige bedingte Anweisung

`wenn {Bedingung} dann {Anweisungen A} sonst {Anweisungen B} endewenn` - Zweiseitig bedingte Anweisung

### Bedingungen

![grafik](https://user-images.githubusercontent.com/13507950/174559930-3424b63e-fb3c-44b3-a329-2bb04b4a7b4e.png)

`IstWand` / `NichtIstWand` - Karol testet, ob vor ihm eine Wand (oder ein Quader) ist oder nicht.

`IstZiegel` / `NichtIstZiegel` - Karol testet, ob vor ihm Ziegel liegen oder nicht.

`IstMarke` / `NichtIstMarke` - Karol testet, ob er auf einer Marke steht oder nicht.

### Kommentare

![grafik](https://user-images.githubusercontent.com/13507950/174563384-07a9338d-1493-45de-a04c-2ab77f0b6069.png)

`// Kommentar` - einzeiliger Kommentar

## Beispiele

Karol baut eine kleine Burg: https://karol.arrrg.de/?id=H0rtb9iQo

Karol legt mit Marken ein Schachbrettmuster: https://karol.arrrg.de/?id=QytABXxX4

Karol baut ein Schwimmbad und schwimmt hindurch: [https://karol.arrrg.de/?id=pJ_cAXSQB](https://karol.arrrg.de/?id=lwl8yufk4)

Karol findet Weg aus einem Raum: https://karol.arrrg.de/?id=fU4PXzhwB

Karol invertiert den Boden: http://localhost:3000/?id=dGEbyMuNX

<hr>

## Erweiterungen (nur im Textmodus verfügbar)

### Eigene Anweisungen

`Anweisung {Name} endeAnweisung` - Definiert eine eigene Anweisung, die innerhalb des Programms verwendet werden kann.

### Objektnotation

Befehle lassen sich in objektorientierter Schreibweise notieren:

```
karol.Schritt(4)
karol.Hinlegen()
karol.LinksDrehen()
```

### \*-Notation

Statt `ende...` kann ein Sternchen geschrieben werden, also `*wenn`, `*wiederhole` oder `*Anweisung`.

### Semikolon

Befehle können optional mit einem Semikolon getrennt werden:

```
Hinlegen; Hinlegen; LinksDrehen
```

### Weiterer Kommentarsyntax

Kommentare werden bei der Ausführung ignoriert.

(Alternative: `# Kommentar`)

`/* Kommentar */` - mehrzeiliger Kommentar (Alternative: `{ Kommentar }`)

### Rücksprung aus Anweisung

In manchen Situationen kann ein Rücksprung aus einer Anweisung den Code deutlich vereinfachen. Dafür gibt es das Schlüsselwort `return`.

## Umstieg

Über die letzten Jahre hat sich Robot Karol immer wieder weiterentwickelt und neue Sprachelemente erhalten. Dadurch ist der Umfang der Sprache immer wieder angewachsen und besitzt nun eine gewisse Komplexität. Um wieder zurück zu einer "Minisprache" zu kommen, versucht Robot Karol Web, den Umfang der Sprache vorsichtig wieder zu verschlanken. Beim Umstieg sind bezüglich der Sprache folgende Punkte zu beachten:

- Farbige Ziegel und Marken sind nicht implementiert
- Der Rucksack ist nicht implementiert
- Himmelsrichtungen sind nicht implementiert
- Ton ist nicht implementiert
- Bedingungen fallen raus, d.h. es lassen sich über `Bedingung`, `wahr` und `falsch` keine eigenen Bedingungen mehr definieren, sondern wird durch das Schlüsselwort `return` ersetzt
- Willkürliche Groß-/Kleinschreibungen wie z.B. `sCHritt` werden nicht mehr unterstützt. Stattdessen kann man entweder `schritt` oder `Schritt` schreiben.
- Der Platzhalter `Programm` wird nicht mehr unterstützt
- Im Moment sind parametrisierten Varianten von Bedingungen z.B. `IstZiegel(n)` nicht implementiert
- Alternative Schleifen-Varianten (wiederhole immer, wiederhole bis, ...) sind nicht unterstützt, außerdem wird das `nicht` Schlüsselwort bei Bedingungen nicht mehr benötigt
- Ausführungsgeschwindigkeit kann angepasst werden, aber die Schlüsselworte `schnell`/`langsam` sind nicht implementiert
- Einbindung von Bibliothek ist nicht implementiert

Falls eine dieser Punkte den Einsatz von Robot Karol Web verhindert, würde ich mich über eine Nachricht freuen. Dann kann ich nochmal die Vorteile und Nachteile eines Einbezugs untersuchen.

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

## Entwicklung

Um das Repo zum Laufen zu bringen, benötigt es folgende Schritte:

```
git clone https://github.com/Entkenntnis/robot-karol-web.git
cd robot-karol-web
yarn
yarn dev
```

Danach kannst du über `localhost:3000` auf deine lokale Version zugreifen.
