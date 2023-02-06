<a href="https://karol.arrrg.de/"><img src="https://user-images.githubusercontent.com/13507950/216998771-19c71ce3-46de-47fb-86e9-c051eb89fdb0.png" alt="Robot Karol Quest"/></a>

_Der zeitlose Klassiker für den spielerischen Einstieg in die Programmierung._

## Übersicht

**Robot Karol Online** ([karol.arrrg.de](https://karol.arrrg.de/)) ist eine Erweiterung der [gleichnamigen Programmierumgebung](https://mebis.bycs.de/beitrag/robot-karol) von Ulli Freiberger. Ziel ist die spielerische Einführung in die Algorithmik, insbesondere von Sequenz, Wiederholung mit fester Anzahl, bedingte Wiederholung und bedingte Anweisungen. Diese Themen finden sich in vielen Lehrplänen der Unterstufe.

![grafik](https://user-images.githubusercontent.com/13507950/217001346-f3c7463e-695f-4b16-bfdf-4ac178015d25.png)

Robot Karol stellt einen visuellen (blockbasierten) Editor zur Verfügung.

![grafik](https://user-images.githubusercontent.com/13507950/217000864-0184a92d-21e5-480f-8edd-ed1e8ba29a2f.png)

Zur Unterstützung der Modellierung kann das Programm zusätzlich als Struktogramm angezeigt werden.

![grafik](https://user-images.githubusercontent.com/13507950/217000953-20a0261a-71e7-479c-a5fe-c387062c9390.png)

 Eine Bearbeitung im Text-Modus ist ebenfalls möglich. Es kann durchgehend zwischen Text und Blöcken gewechselt werden.

![grafik](https://user-images.githubusercontent.com/13507950/217001071-d341a03a-f6ca-4b1b-bcfd-1574ea95cab9.png)

Als Web-Anwendung entfällt die Installation. Einfach auf den Link https://karol.arrrg.de/ klicken und schon kann losgearbeitet werden.

## Aufgabensammlung

Robot Karol Online enthält eine Sammmlung interaktiver Aufgaben, die für die Übung und zum Selbstlernen geeignet sind. Die Aufgaben fangen mit einfachen Tutorials an und steigern sich bis zu komplexen Algorithmen mit verschachtelten Kontrollstrukturen.

Erhalte eine Übersicht über alle enthaltenen Aufgaben: https://karol.arrrg.de/#demo

Für einen mßageschneiderten Unterricht können im Aufgaben-Editor eigene interaktive Aufgaben erstellt werden und über einen Link an die Klasse verteilt werden.

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

`IstWand` / `NichtIstWand` - Karol testet, ob vor ihr eine Wand (oder ein Quader) ist oder nicht.

`IstZiegel` / `NichtIstZiegel` - Karol testet, ob vor ihr Ziegel liegen oder nicht.

`IstMarke` / `NichtIstMarke` - Karol testet, ob sie auf einer Marke steht oder nicht.

`IstZiegel(anzahl)` / `NichtIstZiegel(anzahl)` - Karol testet, ob vor ihr genau `anzahl` Ziegel liegen oder nicht.

`IstNorden` / `NichtIstNorden` - Karol testet, ob sie nach Norden schaut oder nicht. (Norden = oben)

## Textmodus

Im textbasierten Editor werden alle obigen Anweisungen und Kontrollstrukturen unterstützt, außerdem gibt es noch folgende Möglichkeiten:

- Eigene Anweisungen können mit `Anweisung {Name} endeAnweisung` definiert werden und überall mit `Name` aufgerufen werden. Außerdem kann aus einer Anweisung mit `return` zurückgesprungen werden.
- Die meisten Befehle erlauben eine objektorientiere Schreibweise der Form `karol.Schritt(4)` oder ohne Parameter in der Form `karol.LinksDrehen()`.
- Die alte Syntax mit `*wiederhole`, `*wenn` und `*Anweisung` wird weiterhin unterstützt.
- Außerdem können weiterhin Kommentare mit `{ Kommentar }` geschrieben werden. Alternative Syntax für mehrzeilige Kommentare ist `/* Kommentar */`, Alternative für einzeiligen Kommentar ist `# Kommentar`.
- Zur Abgrenzung von Befehlen kann ein Semikolon verwendet werden: `Hinlegen; Schritt; LinksDrehen`

## Ähnliche Projekte

Über die letzen Monate sind mir ein paar ähnliche Projekte begegnet:

- https://github.com/robotcoral: Textbasiert, 3D-Ansicht, schickes Design, Oberfläche sehr nah an Originalversion
- https://github.com/vanmeegen/react-three-karol: Block- und text-basiert, 3D-Ansicht
- https://github.com/andipaetzold/robotkarol.dev: ordentliche Umsetzung, nur text-basiert, keine manuelle Steuerung, viele Beispiele
- https://github.com/timjb/robot-karel: Mehr als 10 Jahre alt, leider nicht mehr online

## Trivia

Karol verwendet sie/ihr-Pronomen.

## Entwicklung

Installiere node.js und git. Um das Repo dann zum Laufen zu bringen, benötigt es folgende Schritte:

```
git clone https://github.com/Entkenntnis/robot-karol-online.git
cd robot-karol-online
npm install
npm run dev
```

Danach ist die lokale Version auf `localhost:3000` verfügbar.
