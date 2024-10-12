<a href="https://karol.arrrg.de/"><img src="https://user-images.githubusercontent.com/13507950/216998771-19c71ce3-46de-47fb-86e9-c051eb89fdb0.png" alt="Robot Karol Quest"/></a>

_Der zeitlose Klassiker für den spielerischen Einstieg in die Programmierung._

## Übersicht

**Robot Karol Online** ([karol.arrrg.de](https://karol.arrrg.de/)) ist eine Fortführung der [gleichnamigen Programmierumgebung](https://mebis.bycs.de/beitrag/robot-karol) von Ulli Freiberger. Ziel ist die spielerische Einführung in die Algorithmik, insbesondere von Sequenz, Wiederholung mit fester Anzahl, bedingte Wiederholung und bedingte Anweisungen. Diese Themen finden sich in vielen Lehrplänen der Unterstufe.

![grafik](https://user-images.githubusercontent.com/13507950/217001346-f3c7463e-695f-4b16-bfdf-4ac178015d25.png)

Robot Karol stellt einen visuellen (blockbasierten) Editor zur Verfügung.

![grafik](https://github.com/Entkenntnis/robot-karol-online/assets/13507950/6b77eeac-a504-4314-b3a9-17327aeefc3f)

Zur Unterstützung der Modellierung kann das Programm zusätzlich als Struktogramm angezeigt werden.

![grafik](https://user-images.githubusercontent.com/13507950/217000953-20a0261a-71e7-479c-a5fe-c387062c9390.png)

Eine Bearbeitung im Text-Modus ist ebenfalls möglich. Es kann durchgehend zwischen Text und Blöcken gewechselt werden.

![grafik](https://user-images.githubusercontent.com/13507950/217001071-d341a03a-f6ca-4b1b-bcfd-1574ea95cab9.png)

Programm können in Python geschrieben werden,

![grafik](https://github.com/Entkenntnis/robot-karol-online/assets/13507950/3b9ddc95-5b76-4eec-85a6-2948b698fa40)

... oder auch in Java.

![grafik](https://github.com/Entkenntnis/robot-karol-online/assets/13507950/934478d4-bb24-437a-b3d9-5f024b9b1240)

Als Web-Anwendung entfällt die Installation. Einfach auf den Link https://karol.arrrg.de/ klicken und schon kann losgearbeitet werden.

## Aufgabensammlung

Robot Karol Online enthält eine Sammmlung interaktiver Aufgaben, die für die Übung und zum Selbstlernen geeignet sind. Die Aufgaben fangen mit einfachen Tutorials an und steigern sich bis zu komplexen Algorithmen mit verschachtelten Kontrollstrukturen.

Erhalte eine Übersicht über alle enthaltenen Aufgaben: https://karol.arrrg.de/#demo

Für einen maßgeschneiderten Unterricht können im [Aufgaben-Editor](https://karol.arrrg.de/#editor) eigene interaktive Aufgaben erstellt werden und über einen Link an die Klasse verteilt werden.

## Sprache

### Anweisungen

![grafik](https://user-images.githubusercontent.com/13507950/174558915-005a88e7-19fd-415f-b97a-27a857eb36a1.png)

`Schritt` - Karol geht einen Schritt nach vorne.

`Schritt(anzahl)` - Karol geht `anzahl` Schritte nach vorne.

`LinksDrehen` - Karol dreht sich um 90° nach links (optional mit Anzahl).

`RechtsDrehen` - Karol dreht sich um 90° nach rechts (optional mit Anzahl).

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

![grafik](https://github.com/Entkenntnis/robot-karol-online/assets/13507950/89b1dc60-b2d7-4999-b0f0-2db92b7b38a1)

`wiederhole {n} mal {Anweisungen} endewiederhole` - Wiederholung mit fester Anzahl

`wiederhole solange {Bedingung} {Anweisungen} endewiederhole` - Wiederholung mit Bedingung

`wiederhole immer {Anweisungen} endewiederhole` - Wiederholung bis zum Programmabbruch

`wenn {Bedingung} dann {Anweisungen} endewenn` - Einseitig bedingte Anweisung

`wenn {Bedingung} dann {Anweisungen A} sonst {Anweisungen B} endewenn` - Zweiseitig bedingte Anweisung

### Bedingungen

![grafik](https://github.com/Entkenntnis/robot-karol-online/assets/13507950/8b4d565d-cae6-44a4-b112-bd6dedcfaa42)

`IstWand` / `NichtIstWand` - Karol testet, ob vor ihr eine Wand (oder ein Quader) ist oder nicht.

`IstZiegel` / `NichtIstZiegel` - Karol testet, ob vor ihr Ziegel liegen oder nicht.

`IstMarke` / `NichtIstMarke` - Karol testet, ob sie auf einer Marke steht oder nicht.

`IstZiegel(anzahl)` / `NichtIstZiegel(anzahl)` - Karol testet, ob vor ihr genau `anzahl` Ziegel liegen oder nicht.

`IstNorden` / `NichtIstNorden` / `IstOsten` / `NichtIstOsten` / `IstSüden` / `NichtIstSüden` / `IstWesten` / `NichtIstWesten` - Karol testet, ob sie in diese Richtung schaut oder nicht. (Norden = oben)

### Eigene Anweisungen

![grafik](https://github.com/Entkenntnis/robot-karol-online/assets/13507950/8147ef95-7eda-40a1-b769-db9f94dfeda4)

`<name>` - Führe eigene Anweisung aus

`Anweisung <name> {...} endeAnweisung` - Definiere eine eigene Anweisung

### Hauptprogramm (optional)

![grafik](https://github.com/user-attachments/assets/aa2f4d6d-6e63-44ec-a6bb-ba73724d29bb)

Wenn es im Block-Modus mehrere Teilprogramme gibt, dann wird nur das Programm innerhalb des Hauptprogramm-Blocks ausgeführt. Alle anderen Blöcke sind inaktiv. Wird der Hauptprogramm-Block nicht verwenden und ist das Programm zusammenhängend, dann wird dieses Programm automatisch ausgeführt.

## Textmodus

Im textbasierten Editor werden alle obigen Anweisungen und Kontrollstrukturen unterstützt, außerdem gibt es noch folgende Möglichkeiten:

- Die meisten Befehle erlauben eine objektorientiere Schreibweise der Form `karol.Schritt(4)` oder ohne Parameter in der Form `karol.LinksDrehen()`.
- Die alte Syntax mit `*wiederhole`, `*wenn` und `*Anweisung` wird weiterhin unterstützt.
- Außerdem können weiterhin Kommentare mit `{ Kommentar }` geschrieben werden. Alternative Syntax für mehrzeilige Kommentare ist `/* Kommentar */`.
- Zur Abgrenzung von Befehlen kann ein Semikolon verwendet werden: `Hinlegen; Schritt; LinksDrehen`. Das Semikolon wird beim Parsen ignoriert.

## Ähnliche Projekte

Über die letzen Monate sind mir ein paar ähnliche Projekte begegnet:

- https://github.com/philer/karol: Textbasiert mit liebevoller 3D-Ansicht
- https://github.com/robotcoral: Textbasiert, 3D-Ansicht, schickes Design, Oberfläche sehr nah an Originalversion
- https://github.com/vanmeegen/react-three-karol: Block- und text-basiert, 3D-Ansicht
- https://github.com/andipaetzold/robotkarol.dev: ordentliche Umsetzung, nur text-basiert, keine manuelle Steuerung, viele Beispiele
- https://github.com/timjb/robot-karel: Mehr als 10 Jahre alt, [Vorschau](http://web.archive.org/web/20110924025946/http://www.robot-karel.org/)

## Trivia

Karol verwendet sie/ihr-Pronomen.

## Bildquellen

Hintergrundbild: [Bild von rawpixel.com](https://de.freepik.com/fotos-kostenlos/einfacher-strukturierter-hintergrund-des-glatten-gewebes_17593140.htm#query=leinen%20textur&position=0&from_view=keyword&track=ais) auf Freepik

Farbkleckse: [Bild von starline](https://de.freepik.com/vektoren-kostenlos/isolierter-aquarell-spritzerfleck-bunter-satz-von-acht_9728054.htm#query=klecks&position=4&from_view=keyword&track=sph) auf Freepik

Snake-Icon: [Snake icons created by apien - Flaticon](https://www.flaticon.com/free-icons/snake)

Kleeblatt: [Bild von jemastock](https://de.freepik.com/vektoren-kostenlos/gruener-gluecksklee-mit-vier-blaettern_70015845.htm#query=4%20bl%C3%A4tter%20kleeblatt&position=11&from_view=search&track=ais&uuid=e9b2280d-4977-4cff-9d02-e409163dc7f6) auf Freepik

Outfit: [Bild von rawpixel.com](https://de.freepik.com/vektoren-kostenlos/mode-logo-aufkleber-business-branding-schwarz-weiss-design-vektor_20346276.htm#query=outfit%20icon&position=36&from_view=search&track=ais&uuid=b2451275-7cef-4c28-9686-d610dcb630e6) auf Freepik

## Entwicklung

Installiere node.js und git. Um das Repo dann zum Laufen zu bringen, benötigt es folgende Schritte:

```
git clone https://github.com/Entkenntnis/robot-karol-online.git
cd robot-karol-online
npm install
npm run dev
```

Danach ist die lokale Version auf `localhost:3000` verfügbar.
