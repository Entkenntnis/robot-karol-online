<a href="https://karol.arrrg.de/"><img src="https://user-images.githubusercontent.com/13507950/209194132-0ba11ff1-1ded-49e7-b556-912096d8eef0.png" alt="Robot Karol Quest"/></a>

*Der zeitlose Klassiker für den spielerischen Einstieg in die Programmierung.*

## Übersicht

<blockquote>

Aus https://mebis.bycs.de/beitrag/robot-karol:

Robot Karol ist eine Programmierumgebung mit einer Programmiersprache, die für Schülerinnen und Schüler zum Erlernen des Programmierens und zur Einführung in die Algorithmik gedacht ist. Robot Karol folgt der Tradition der “Mini-Languages”. Dies sind Programmiersprachen, die bewusst über einen kleinen, übersichtlichen Sprachumfang verfügen, um den Einstieg in die Algorithmik zu erleichtern.

Dem Programm Robot Karol liegt die Idee von [„Karel the Robot“](https://www.cs.mtsu.edu/~untch/karel/index.html) zugrunde, wie sie zum ersten Mal von Richard E. Pattis in “Karel the Robot: A Gentle Introduction to the Art of Programming” veröffentlicht wurde. Die Idee ist, einen Roboter zu programmieren, der in einer “Bildschirmwelt” lebt. Wenn Karol-Programme ablaufen, sehen die Schülerinnen und Schüler an der Reaktion des Roboters sofort, was sie programmiert haben und ob ihr Programm die Aufgabenstellung erfüllt.

</blockquote>

**Robot Karol Online** ([karol.arrrg.de](https://karol.arrrg.de/)) erweitert die bisherigen Implementationen von Robot Karol um einen blockbasierten Editor und einer eingebauten Aufgabensammlung. Damit werden die Einstiegshürden nochmal deutlich gesenkt: Für den Anfang muss man sich um Syntax-Fehler keine Sorgen machen und das beigefügte Tutorial und die Aufgaben bieten sofortiges Feedback für die ersten eigenen Programme. Auch die Installation von Software entfällt.

Die einzelnen Aufgaben in der Aufgabensammmlung bestehen selbst aus einen oder mehreren Aufträgen, die mit *einem* Programm gelöst werden müssen. Bei jedem Auftrag geht es darum, eine vorgegebene Welt mit Karol nachzubauen - beziehungsweise das passende Programm dazu zu schreiben. Dadurch, dass alle Aufträge mit einem Programm gelöst werden, ist der Einsatz von Bedingungen unverzichtbar. Sobald ein Auftrag erledigt ist, wird das in Robot Karol Online markiert und macht den Fortschritt nachvollziehbar.

Die Aufgaben beginnen mit Tutorials, die die Grundlagen der Sprache vermitteln. Danach gibt es eine Reihe an einfachen und mittleren Aufgaben, um die Grundlagen einzuüben. Für ehrgeizige Spieler bieten dann die schweren Aufgaben eine ordentliche Herausforderung. Dabei kann außerdem in den textbasierten Editor gewechselt werden, der zusätzlich Möglichkeiten bietet, wie z.B. die Definition eigener Anweisugen.

## Sprache

### Anweisungen

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

### Kommentare

![grafik](https://user-images.githubusercontent.com/13507950/174563384-07a9338d-1493-45de-a04c-2ab77f0b6069.png)

`// Kommentar` - Nutze Kommentare, um den Code zu gliedern und die Struktur zu erklären.

### Steuerung

![grafik](https://user-images.githubusercontent.com/13507950/208776391-bd902daf-72e1-4bef-959a-9ae1e4d28fb2.png)

`wiederhole {n} mal {Anweisungen} endewiederhole` - Wiederholung mit fester Anzahl

`wiederhole solange {Bedingung} {Anweisungen} endewiederhole` - Wiederholung mit Bedingung

`wiederhole immer {Anweisungen} endewiederhole` - Wiederholung bis zum Programmabbruch

`wenn {Bedingung} dann {Anweisungen} endewenn` - Einseitig bedingte Anweisung

`wenn {Bedingung} dann {Anweisungen A} sonst {Anweisungen B} endewenn` - Zweiseitig bedingte Anweisung

### Bedingungen

![grafik](https://user-images.githubusercontent.com/13507950/208776560-15d88203-900c-45e7-b788-abcf8da8b27c.png)

`IstWand` / `NichtIstWand` - Karol testet, ob vor ihm eine Wand (oder ein Quader) ist oder nicht.

`IstZiegel` / `NichtIstZiegel` - Karol testet, ob vor ihm Ziegel liegen oder nicht.

`IstMarke` / `NichtIstMarke` - Karol testet, ob er auf einer Marke steht oder nicht.

`IstZiegel(anzahl)` / `NichtIstZiegel(anzahl)` - Karol testet, ob vor ihm genau `anzahl` Ziegel liegen oder nicht.

`IstNorden` / `NichtIstNorden` - Karol testet, ob er nach Norden schaut oder nicht. (Norden = oben)

## Textmodus

Im textbasierten Editor werden alle obigen Anweisungen und Kontrollstrukturen unterstützt, außerdem gibt es noch folgende Möglichkeiten:

- Eigene Anweisungen können mit `Anweisung {Name} endeAnweisung` definiert werden und überall mit `Name` aufgerufen werden. Außerdem kann aus einer Anweisung mit `return` zurückgesprungen werden.
- Die meisten Befehle erlauben eine objektorientiere Schreibweise der Form `karol.Schritt(4)` oder ohne Parameter in der Form `karol.LinksDrehen()`.
- Die alte Syntax mit `*wiederhole`, `*wenn` und `*Anweisung` wird weiterhin unterstützt.
- Außerdem können weiterhin Kommentare mit `{ Kommentar }` geschrieben werden. Alternative Syntax für mehrzeilige Kommentare ist `/* Kommentar */`, Alternative für einzeiligen Kommentar ist `# Kommentar`.
- Zur Abgrenzung von Befehlen kann ein Semikolon verwendet werden: `Hinlegen; Schritt; LinksDrehen`

## Entwicklung

Installiere node.js und git. Um das Repo dann zum Laufen zu bringen, benötigt es folgende Schritte:

```
git clone https://github.com/Entkenntnis/robot-karol-online.git
cd robot-karol-online
npm install
npm run dev
```

Danach ist die lokale Version auf `localhost:3000` verfügbar.
