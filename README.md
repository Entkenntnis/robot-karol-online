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

![grafik](https://user-images.githubusercontent.com/13507950/174559742-710a0d46-b8ea-4224-915f-e8bb692a0381.png)

`wiederhole {n} mal {Anweisungen} endewiederhole` - Wiederholung mit fester Anzahl

`wiederhole solange {Bedingung} {Anweisungen} endewiederhole` - Wiederholung mit Bedingung

`wenn {Bedingung} dann {Anweisungen} endewenn` - Einseitige bedingte Anweisung

`wenn {Bedingung} dann {Anweisungen A} sonst {Anweisungen B} endewenn` - Zweiseitig bedingte Anweisung

### Bedingungen

![grafik](https://user-images.githubusercontent.com/13507950/175011392-4ab45def-d18c-4096-b2c0-090f0b3e42fa.png)

`IstWand` / `NichtIstWand` - Karol testet, ob vor ihm eine Wand (oder ein Quader) ist oder nicht.

`IstZiegel` / `NichtIstZiegel` - Karol testet, ob vor ihm Ziegel liegen oder nicht.

`IstMarke` / `NichtIstMarke` - Karol testet, ob er auf einer Marke steht oder nicht.

`IstNorden` / `NichtIstNorden` - Karol testet, ob er nach Norden schaut oder nicht. (Norden = oben)

## Beispiele

![grafik](https://user-images.githubusercontent.com/13507950/174608128-dbb55c54-6196-48aa-84a8-d86cb909c71a.png)

Karol baut eine kleine Burg: https://karol.arrrg.de/?id=H0rtb9iQo

![grafik](https://user-images.githubusercontent.com/13507950/175013216-17958098-a14d-4a31-bbeb-1441c4d193e4.png)

Karol findet zurück zum Start: https://karol.arrrg.de/?id=lZtwOLmN9

![grafik](https://user-images.githubusercontent.com/13507950/174683877-e4b18d6c-a8c0-40e2-87d6-06bfe8aca68c.png)

Karol legt den Boden mit Ziegeln aus: http://localhost:3000/?id=MecEAhU2D

![grafik](https://user-images.githubusercontent.com/13507950/174608320-cfb76ed2-4ea8-4cf3-a984-96c6f332856c.png)

Karol legt mit Marken ein Schachbrettmuster: https://karol.arrrg.de/?id=EUOOAJ3I7

![grafik](https://user-images.githubusercontent.com/13507950/175024634-72014ceb-4319-44a0-baf8-750f196fa3b6.png)

Karol räumt den Boden auf: https://karol.arrrg.de/?id=cEg42dNwy

![grafik](https://user-images.githubusercontent.com/13507950/174608520-88f081d6-972c-4db2-bae8-c823211e35d9.png)

Karol baut ein Schwimmbad und schwimmt hindurch: [https://karol.arrrg.de/?id=pJ_cAXSQB](https://karol.arrrg.de/?id=lwl8yufk4)

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

Karol multipliziert 3 und 5: https://karol.arrrg.de/?id=YhXnGAJZz (Nerdfrage: Welche Laufzeit hat der Algorithmus? Kann man den Algorithmus auch schneller schreiben? Auflösung [hier](https://github.com/Entkenntnis/robot-karol-web#effiziente-multiplikation).)

![grafik](https://user-images.githubusercontent.com/13507950/174922382-c52f64ac-bed6-4f93-9cbf-5ac325d724a3.png)

Karol sortiert Stapel nach der Größe: https://karol.arrrg.de/?id=IAcMKSmST

![karol_ziffern](https://user-images.githubusercontent.com/13507950/175029596-f4742a3d-1392-4620-b5c1-e655788462ee.gif)

Karol schreibt die Ziffern von 0 bis 9: https://karol.arrrg.de/?id=yHV8VsEak
<hr>

## Erweiterungen (nur im Textmodus verfügbar)

Im Textmodus gibt es einige Erweiterungen, die aus Robot Karol 3.0 übernommen wurden und die Sprache erweitern:

- Eigene Anweisungen können mit `Anweisung {Name} endeAnweisung` definiert werden und überall mit `Name` aufgerufen werden. Außerdem kann aus einer Anweisung mit `return` zurückgesprungen werden. (x)
- Die meisten Befehle erlauben eine objektorientiere Schreibweise der Form `karol.Schritt(4)` oder ohne Parameter in der Form `karol.LinksDrehen()`.
- Die alte Syntax mit `*wiederhole`, `*wenn` und `*Anweisung` wird weiterhin unterstützt.
- Außerdem können weiterhin Kommentare mit `{ Kommentar }` geschrieben werden. Alternative Syntax für mehrzeilige Kommentare ist `/* Kommentar */`, Alternative für einzeiligen Kommentar ist `# Kommentar`. (x)
- Zur Abgrenzung von Befehlen kann ein Semikolon verwendet werden: `Hinlegen; Schritt; LinksDrehen`

(x) Durch Nutzung dieser Erweiterungen ist ein Umschalten in den Blockeditor leider nicht mehr möglich.

## Beispiele mit Erweiterungen

Mithilfe der Erweiterungen sind nochmal mehr Algorithmen mit Robot Karol umsetzbar. Dabei ist vor allem die Möglichkeit von Rekursion entscheidend. Durch den Callstack erhält Karol quasi durch die Hintertür ein Gedächtnis. Eigentlich ist das ein wenig schummeln. Aber es lassen sich damit spannende Algorithmen umsetzen:

### Floodfill

Karol füllt eine Fläche mit dem rekursivenFloodfill-Algorithmus: https://karol.arrrg.de/?id=lTjOXgMEA

### Labyrinth

Karol findet das Ziel in einem Labyrinth. Mauern bestehen aus 2 Ziegeln, das Ziel besteht aus einem Ziegel: https://karol.arrrg.de/?id=8DJ_I8yc5

### Binärzahl als Dezimalzahl ausgeben

Karol liest eine Binärzahl ein und zeigt diese in dezimal an: https://karol.arrrg.de/?id=e2OGDPHp0

### Effiziente Multiplikation

Der bisherige Algorithmus hat eine Laufzeit von O(n² _ m²). Das kann mithilfe von Rekursion auf O(n _ m) verbessert werden: https://karol.arrrg.de/?id=GibpaN88x

### Game of Life

Karol simuliert Conways Game of Life: https://karol.arrrg.de/?id=-NO0NkzUk

### Turing-Vollständigkeit

Zum krönenden Abschluss soll in diesem Beispiel bewiesen werden, dass Robot Karol turing-vollständig ist. Das heißt, dass jede berechenbare Funktion von Karol implementiert werden kann.

Der Beweis gelingt durch die Nutzung von brainf_ck - einer esoterischen Sprache, die an sich bereits turing-vollständig ist. Gelingt es, diese Sprache umzusetzen, dann ist die Vollständigkeit bewiesen.

Ein solcher Interpreter ist möglich. Die beiden folgenden Dateien zeigen einmal ein Beispiel für die Addition und einmal für die Multiplikation. Der brainf_uck Quellcode steht an der hinteren Wand. Die Speicherzellen finden sich an der linken Wand.

Addition: https://karol.arrrg.de/?id=G-AH8m_Km

Multiplikation: https://karol.arrrg.de/?id=WEjDr5yhw

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
