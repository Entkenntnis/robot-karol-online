# QuestScript

Über `QuestScript` können interaktive Aufgaben in Python programmiert werden. Dieser Modus eignet sich für Aufgaben, die über die Veränderungen in der Welt hinaus auch Variablen und Funktionen innerhalb des Codes überprüfen wollen.

Das QuestScript wird **anstelle** der normalen Steuerung gestartet. Eine Reihe von Funktionen mit dem Prefix `__ide_` erlauben den Eingriff in interne Abläufe. So wird das Standard-Verhalten abgebildet:

```py
__ide_run_client()
```

Es wird sofort der Client-Code (= Code, den die SchülerInnen schreiben) ausgeführt. Die Welt wird auf Vollständigkeit geprüft und dann als erfolgreich oder nicht erfolgreich markiert. Gibt es in der Welt keine Veränderungen, ist der Auftrag nicht erfüllt.

Der Client kann so oft wie gewünscht ausgeführt werden und davor/danach können weitere Python-Aktionen passieren.

## API

### `__ide_run_client(globals=[]: list[str]) -> None`

Führt den Client-Code in einer neuen, leeren Umgebung aus (nur built-ins und `Robot` verfügbar). Falls `globals` angegeben, werden aus der QuestScript-Umgebung diese Variable in die Client-Umgebung kopiert.

Nach der Ausführung werden neue Variable der Client-Umgebung automatisch in die QuestScript-Umgebung kopiert. Variablen mit dem Prefix `__ide_` werden nicht überschrieben

So sieht ein Beispiel aus:

```py
# client
test()
monty = 4
```

```py
# QuestScript
def test():
    print("Hallo aus QuestScript")

__ide_run_client(globals=['test'])

print(monty) # -> 4
```

### `__ide_prompt(message: str, confirm="weiter": str) -> None`

Zeigt die Nachricht an und wartet, bis der Client die Nachricht bestätigt. `message` ist der Text und `confirm` die Beschriftung des Buttons.

```py
___ide_prompt("Hallo")
___ide_prompt("Schön dass du hier bist", "Beenden")
```

### `__ide_set_progress(completed: bool) -> None`

Markiert die Aufgabe als abgeschlossen oder nicht, überschreibt den bisherigen Stand.

```py
___ide_set_progress(True)
```

### `__ide_exit() -> None`

Beendet das QuestScript sofort.

### `__ide_sleep(sec: int | float) -> None`

Pausiert das Script für `sec` Sekunden. Bevorzuge diese Methode statt `time.sleep()`.

### `__ide_get_outputs() -> list[str]`

Erhalte eine Liste aller Zeile, die bisher an stdout geschickt wurden. Hilft die erfolgreiche Ausführung von `print` zu überprüfen.

### `__ide_get_inputs() -> list[str]`

Erhalte eine Liste aller Zeile, die bisher über stdin eingelesen wurden. Hilft die efolgreiche Ausführung von `input` zu überprüfen.

## Beispiel

Das ist das QuestScript zur Aufgabe [`Neubeginn`](https://karol.arrrg.de/#QUEST-61):

```py
__ide_run_client()

__ide_sleep(0.4)

stdout = __ide_get_outputs()

if len(stdout) == 0:
    __ide_prompt("Du hast nichts ausgegeben. `" +
                 "Nutze den Befehl `print()` in deinem Programm.",
                 "Beenden")
    __ide_exit()

if len(stdout) > 1:
    __ide_prompt("Bitte gib nur einen Text aus.", "Beenden")
    __ide_exit()

if not stdout[0].strip().lower() == "hallo, python!":
    __ide_prompt("Ein Text wurde ausgegeben 👍 Ändere deine Ausgabe noch " +
                 "auf die passende Nachricht.", "Beenden")
    __ide_exit()

__ide_set_progress(True)
__ide_prompt("Perfekt gemacht 🎉 Deine Ausgabe erscheint im rechten Fenster als grün-hinterlegter Text.", "Ja, hab ich gesehen")
```

Im Editor können weitere Aufgaben über "Aus Vorlage laden" geöffnet und die zugehören QuestScripts betrachtet werden.
