<a href="https://karol.arrrg.de/"><img src="https://user-images.githubusercontent.com/13507950/208775985-db971660-26f0-46d5-a773-55841cfc4d56.png" alt="Robot Karol Quest"/></a>

*Der zeitlose Klassiker für den spielerischen Einstieg in die Programmierung.*

## Übersicht

<blockquote>

Robot Karol ist eine Programmierumgebung mit einer Programmiersprache, die für Schülerinnen und Schüler zum Erlernen des Programmierens und zur Einführung in die Algorithmik gedacht ist. Robot Karol folgt der Tradition der “Mini-Languages”. Dies sind Programmiersprachen, die bewusst über einen kleinen, übersichtlichen Sprachumfang verfügen, um den Einstieg in die Algorithmik zu erleichtern.

Dem Programm Robot Karol liegt die Idee von [„Karel the Robot“](https://www.cs.mtsu.edu/~untch/karel/index.html) zugrunde, wie sie zum ersten Mal von Richard E. Pattis in “Karel the Robot: A Gentle Introduction to the Art of Programming” veröffentlicht wurde. Die Idee ist, einen Roboter zu programmieren, der in einer “Bildschirmwelt” lebt. Wenn Karol-Programme ablaufen, sehen die Schülerinnen und Schüler an der Reaktion des Roboters sofort, was sie programmiert haben und ob ihr Programm die Aufgabenstellung erfüllt.

Quelle: https://mebis.bycs.de/beitrag/robot-karol

</blockquote>

**Robot Karol Quest** erweitert die bisherigen Implementationen von Robot Karol um einen blockbasierten Editor und einer eingebauten Aufgabensammlung. Damit werden die Einstiegshürden nochmal deutlich gesenkt: Für den Anfang muss man sich um Syntax-Fehler keine Sorgen machen und das beigefügte Tutorial und die Aufgaben bieten sofortiges Feedback für die ersten eigenen Programme.

Die Aufgabensammmlung besteht aus einzelnen Quests. Jede Quest besteht wiederum aus einen oder mehreren Aufträgen, die mit *einem* Programm gelöst werden müssen. Bei jedem Auftrag geht es darum, eine vorgegebene Welt mit Karol nachzubauen - beziehungsweise das passende Programm dazu zu schreiben. Dadurch, dass alle Aufträge mit einem Programm gelöst werden, ist der Einsatz von Bedingungen unverzichtbar. Sobald ein Auftrag erledigt ist, wird das in Robot Karol Quest markiert und man kann damit seinen Fortschritt nachverfolgen.

Die Aufgaben beginnen mit einer Reihe von Tutorials, die die Grundlagen der Sprache vermitteln. Danach gibt es eine Reihe an einfachen und mittleren Aufgaben um die Grundlagen gut einzuüben.



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

## Beispiele

![grafik](https://user-images.githubusercontent.com/13507950/174608128-dbb55c54-6196-48aa-84a8-d86cb909c71a.png)

Karol baut eine kleine Burg: https://karol.arrrg.de/?id=H0rtb9iQo

![grafik](https://user-images.githubusercontent.com/13507950/175013216-17958098-a14d-4a31-bbeb-1441c4d193e4.png)

Karol findet zurück zum Start: https://karol.arrrg.de/?id=lZtwOLmN9

![grafik](https://user-images.githubusercontent.com/13507950/175125936-3983411e-8526-4e1c-bfa3-4ce3b9f8063f.png)

Karol kopiert einen Stapel Ziegel: https://karol.arrrg.de/?id=RPXh1Tk1R

![grafik](https://user-images.githubusercontent.com/13507950/174683877-e4b18d6c-a8c0-40e2-87d6-06bfe8aca68c.png)

Karol legt den Boden mit Ziegeln aus: https://karol.arrrg.de/?id=MecEAhU2D

![grafik](https://user-images.githubusercontent.com/13507950/174608320-cfb76ed2-4ea8-4cf3-a984-96c6f332856c.png)

Karol legt mit Marken ein Schachbrettmuster: https://karol.arrrg.de/?id=EUOOAJ3I7

![grafik](https://user-images.githubusercontent.com/13507950/175024634-72014ceb-4319-44a0-baf8-750f196fa3b6.png)

Karol räumt den Boden auf: https://karol.arrrg.de/?id=cEg42dNwy

![grafik](https://user-images.githubusercontent.com/13507950/174608520-88f081d6-972c-4db2-bae8-c823211e35d9.png)

Karol baut ein Schwimmbad und schwimmt hindurch: https://karol.arrrg.de/?id=lwl8yufk4

![grafik](https://user-images.githubusercontent.com/13507950/174608626-17a91c3b-1627-42b8-a5de-28db61692a6a.png)

Karol findet Weg aus einem Raum: https://karol.arrrg.de/?id=fU4PXzhwB

![grafik](https://user-images.githubusercontent.com/13507950/174684341-9c35d570-1a50-4957-af78-379ba4edd00c.png)

Karol spielt FizzBuzz: https://karol.arrrg.de/?id=w-ZnWgG-Z

![grafik](https://user-images.githubusercontent.com/13507950/174609057-b169791d-c097-46cc-9fb3-a8703eaccd52.png)

Karol invertiert den Boden: https://karol.arrrg.de/?id=eq0xUy4nz

![grafik](https://user-images.githubusercontent.com/13507950/174674749-26fb2b7a-57d4-409c-a3ff-5a9f71c8647f.png)

Karol baut Treppen: https://karol.arrrg.de/?id=uvGUlYKtO

![grafik](https://user-images.githubusercontent.com/13507950/174771349-9ac376fb-8d17-4153-a3d9-60b55dca476e.png)

Karol addiert 5 und 7: https://karol.arrrg.de/?id=X6L6m7x3I

![grafik](https://user-images.githubusercontent.com/13507950/174916495-072950e0-d76b-4abc-ad2f-3f3f3e0a5a2c.png)

Karol multipliziert 3 und 5: https://karol.arrrg.de/?id=YhXnGAJZz (Nerdfrage: Welche Laufzeit hat der Algorithmus? Kann man den Algorithmus auch schneller schreiben? Auflösung [hier](https://karol.arrrg.de/?id=5Wqwff3Mi))

![grafik](https://user-images.githubusercontent.com/13507950/174922382-c52f64ac-bed6-4f93-9cbf-5ac325d724a3.png)

Karol sortiert Stapel nach der Größe: https://karol.arrrg.de/?id=IAcMKSmST

![karol_ziffern](https://user-images.githubusercontent.com/13507950/175029596-f4742a3d-1392-4620-b5c1-e655788462ee.gif)

Karol schreibt die Ziffern von 0 bis 9: https://karol.arrrg.de/?id=yHV8VsEak

![gameoflifee](https://user-images.githubusercontent.com/13507950/175084189-adf18f24-afc2-4166-a865-cccd773f71c9.gif)

Karol simuliert Conways Game of Life: https://karol.arrrg.de/?id=lypiXliaW (damit zählt Robot Karol als [Turing-vollständig](https://de.wikipedia.org/wiki/Turing-Vollst%C3%A4ndigkeit) Programmiersprache)

![image](https://user-images.githubusercontent.com/13507950/175257884-90e9f039-0b55-4900-a263-f2f46e0b8776.png)

Karol findet Weg aus Labyrinth: https://karol.arrrg.de/?id=eHGQ1vYUR

![grafik](https://user-images.githubusercontent.com/13507950/175704629-6f06ad33-a2f6-49f6-b730-232ff9454307.png)

Karol füllt einen umrandeten Bereich: https://karol.arrrg.de/?id=Zm1p1pF-z

<hr>

## Erweiterungen (nur im Textmodus verfügbar)

Im Textmodus gibt es einige Erweiterungen, die aus Robot Karol 3.0 übernommen wurden und die Sprache erweitern:

- Eigene Anweisungen können mit `Anweisung {Name} endeAnweisung` definiert werden und überall mit `Name` aufgerufen werden. Außerdem kann aus einer Anweisung mit `return` zurückgesprungen werden. (x)
- Die meisten Befehle erlauben eine objektorientiere Schreibweise der Form `karol.Schritt(4)` oder ohne Parameter in der Form `karol.LinksDrehen()`.
- Die alte Syntax mit `*wiederhole`, `*wenn` und `*Anweisung` wird weiterhin unterstützt.
- Außerdem können weiterhin Kommentare mit `{ Kommentar }` geschrieben werden. Alternative Syntax für mehrzeilige Kommentare ist `/* Kommentar */`, Alternative für einzeiligen Kommentar ist `# Kommentar`. (x)
- Zur Abgrenzung von Befehlen kann ein Semikolon verwendet werden: `Hinlegen; Schritt; LinksDrehen`

(x) Durch Nutzung dieser Erweiterungen ist ein Umschalten in den Blockeditor leider nicht mehr möglich.

![grafik](https://user-images.githubusercontent.com/13507950/176788686-a952cdd8-4a3e-4745-ac92-51b072835623.png)

Karol findet mit dem Algorithmus von Dijkstra den kürzesten Weg, einige Erweiterungen kommen hier zum Einsatz: https://karol.arrrg.de/?id=K4xfaLLnM

## Umstieg

Über die letzten Jahre hat sich Robot Karol immer wieder weiterentwickelt und neue Sprachelemente erhalten. Dadurch ist der Umfang der Sprache immer wieder angewachsen und besitzt nun eine gewisse Komplexität. Um wieder zurück zu einer "Minisprache" zu kommen, versucht Robot Karol Web, den Umfang der Sprache vorsichtig wieder zu verschlanken. Beim Umstieg sind bezüglich der Sprache folgende Punkte zu beachten:

- Farbige Ziegel und Marken sind nicht implementiert
- Der Rucksack ist nicht implementiert
- Ton ist nicht implementiert
- Bedingungen fallen raus, d.h. es lassen sich über `Bedingung`, `wahr` und `falsch` keine eigenen Bedingungen mehr definieren, sondern wird durch das Schlüsselwort `return` ersetzt
- Willkürliche Groß-/Kleinschreibungen wie z.B. `sCHritt` werden nicht mehr unterstützt. Stattdessen kann man entweder `schritt` oder `Schritt` schreiben.
- Der Platzhalter `Programm` wird nicht mehr unterstützt
- Im Moment sind parametrisierten Varianten von Bedingungen z.B. `IstZiegel(n)` nicht implementiert
- Alternative Schleifen-Varianten (wiederhole immer, wiederhole bis, ...) sind nicht unterstützt, außerdem wird das `nicht` Schlüsselwort bei Bedingungen nicht mehr benötigt
- Ausführungsgeschwindigkeit kann angepasst werden, aber die Schlüsselworte `schnell`/`langsam` sind nicht implementiert
- Einbindung von Bibliothek ist nicht implementiert

Falls eine dieser Punkte den Einsatz von Robot Karol Web verhindert, würde ich mich über eine Nachricht freuen. Dann kann ich nochmal die Vorteile und Nachteile eines Einbezugs untersuchen.

## Entwicklung

Installiere node.js, git und yarn. Um das Repo dann zum Laufen zu bringen, benötigt es folgende Schritte:

```
git clone https://github.com/Entkenntnis/robot-karol-web.git
cd robot-karol-web
yarn
yarn dev
```

Danach ist die lokale Version über `localhost:3000` verfügbar.
