export const flashcards: {
  question: string
  answer: string
}[] = [
  // Variablen
  {
    question: 'Was ist eine Variable in Python?',
    answer:
      'Ein benannter Speicherplatz für Daten, der während der Programmausführung verändert werden kann.',
  },
  {
    question: 'Wie deklariert man eine Variable in Python?',
    answer: '`name = wert` - Python benötigt keine explizite Typdeklaration.',
  },
  {
    question:
      'Was ist der Unterschied zwischen lokalen und globalen Variablen?',
    answer:
      'Lokale Variablen sind nur innerhalb einer Funktion sichtbar, globale Variablen sind im gesamten Programm zugänglich.',
  },
  {
    question: 'Welche Datentypen gibt es in Python für Variablen?',
    answer:
      'Grundlegende Typen: `int`, `float`, `str`, `bool`, `list`, `tuple`, `dict`, `set`',
  },
  {
    question: 'Wie wandelt man eine Zahl in einen String um?',
    answer: 'Mit der Funktion `str()`, z.B. `text = str(42)`',
  },
  {
    question: 'Wie kann man den Typ einer Variable prüfen?',
    answer: 'Mit der Funktion `type()`, z.B. `type(variable)`',
  },

  // Operatoren
  {
    question: 'Was sind arithmetische Operatoren in Python?',
    answer:
      '`+` (Addition), `-` (Subtraktion), `*` (Multiplikation), `/` (Division), `//` (Ganzzahldivision), `%` (Modulo), `**` (Potenz)',
  },
  {
    question: 'Was ist der Unterschied zwischen `/` und `//` in Python?',
    answer:
      '`/` liefert eine Dezimalzahl, `//` liefert nur den ganzzahligen Anteil der Division.',
  },
  {
    question: 'Was macht der `%`-Operator?',
    answer:
      'Der Modulo-Operator gibt den Rest einer Division zurück, z.B. `10 % 3 = 1`',
  },
  {
    question: 'Was sind Zuweisungsoperatoren in Python?',
    answer: '`=`, `+=`, `-=`, `*=`, `/=`, `//=`, `%=`, `**=`',
  },
  {
    question: 'Was ist ein logischer Operator in Python?',
    answer: '`and`, `or`, `not` - verknüpfen boolesche Ausdrücke',
  },
  {
    question: 'Wofür wird der `+`-Operator bei Strings verwendet?',
    answer:
      "Für die Konkatenation (Verkettung) von Strings, z.B. `'Hallo' + 'Welt' = 'HalloWelt'`",
  },

  // Vergleiche
  {
    question: 'Welche Vergleichsoperatoren gibt es in Python?',
    answer:
      '`==` (gleich), `!=` (ungleich), `<` (kleiner), `>` (größer), `<=` (kleiner gleich), `>=` (größer gleich)',
  },
  {
    question: 'Was ist der Unterschied zwischen `==` und `is` in Python?',
    answer:
      '`==` vergleicht den Wert, `is` vergleicht die Identität (Speicheradresse) der Objekte.',
  },
  {
    question: 'Wie kann man mehrere Vergleiche kombinieren?',
    answer:
      'Mit logischen Operatoren: `and`, `or`, `not`, z.B. `if a > 0 and a < 10:`',
  },
  {
    question: 'Was liefert ein Vergleich in Python zurück?',
    answer: 'Einen booleschen Wert: `True` oder `False`',
  },
  {
    question: 'Wie überprüft man, ob ein Element in einer Liste enthalten ist?',
    answer: 'Mit dem `in`-Operator, z.B. `if element in liste:`',
  },
  {
    question: 'Wie vergleicht man Strings in Python?',
    answer:
      "Mit den üblichen Vergleichsoperatoren, z.B. `'abc' < 'abd'` (lexikographischer Vergleich)",
  },

  // Kontrollstrukturen
  {
    question: 'Was ist eine bedingte Anweisung in Python?',
    answer:
      'Ein Codeblock, der nur ausgeführt wird, wenn eine bestimmte Bedingung erfüllt ist: `if`, `elif`, `else`',
  },
  {
    question: 'Wie lautet die Syntax einer if-Anweisung?',
    answer:
      '```python\nif bedingung:\n    anweisungen\nelif andere_bedingung:\n    andere_anweisungen\nelse:\n    weitere_anweisungen```',
  },
  {
    question: 'Was ist eine for-Schleife in Python?',
    answer:
      'Eine Schleife, die über eine Sequenz (Liste, Tuple, String, etc.) iteriert, z.B. `for element in liste:`',
  },
  {
    question: 'Wie generiert man einen Zahlenbereich für eine for-Schleife?',
    answer: 'Mit der `range()`-Funktion, z.B. `for i in range(5):`',
  },
  {
    question: 'Was ist eine while-Schleife?',
    answer:
      'Eine Schleife, die solange ausgeführt wird, wie eine Bedingung wahr ist: `while bedingung:`',
  },
  {
    question: 'Was bewirkt `break` in einer Schleife?',
    answer:
      'Beendet die Schleife sofort und springt zum ersten Befehl nach der Schleife.',
  },
  {
    question: 'Was bewirkt `continue` in einer Schleife?',
    answer:
      'Überspringt den Rest des aktuellen Schleifendurchlaufs und geht zum nächsten Durchlauf.',
  },

  // Methoden
  {
    question: 'Was ist eine Funktion/Methode in Python?',
    answer:
      'Ein wiederverwendbarer Codeblock, der eine bestimmte Aufgabe ausführt und mit `def name(parameter):` definiert wird.',
  },
  {
    question: 'Wie definiert man eine Funktion mit Parametern?',
    answer:
      '```python\ndef funktionsname(param1, param2):\n    anweisungen\n    return ergebnis```',
  },
  {
    question: 'Was ist ein Rückgabewert einer Funktion?',
    answer:
      'Der Wert, den eine Funktion mit `return` zurückgibt und der weiterverarbeitet werden kann.',
  },
  {
    question: 'Was sind Standardparameter in Python?',
    answer:
      'Parameter mit vordefinierten Werten, die verwendet werden, wenn beim Funktionsaufruf kein Wert angegeben wird: `def funktion(param=standardwert):`',
  },
  {
    question: 'Was ist ein Docstring?',
    answer:
      'Ein Dokumentationsstring in dreifachen Anführungszeichen, der die Funktion beschreibt: ```python\ndef funktion():\n    """Beschreibung der Funktion"""\n    anweisungen```',
  },
  {
    question: 'Was sind Lambda-Funktionen?',
    answer:
      'Anonyme Funktionen, die in einer Zeile definiert werden: `lambda parameter: ausdruck`',
  },

  // Klassen
  {
    question: 'Was ist eine Klasse in Python?',
    answer:
      'Eine Vorlage für Objekte, die Daten (Attribute) und Verhalten (Methoden) definiert.',
  },
  {
    question: 'Wie definiert man eine Klasse in Python?',
    answer:
      '```python\nclass Klassenname:\n    def __init__(self, parameter):\n        self.attribut = parameter\n        \n    def methode(self):\n        anweisungen```',
  },
  {
    question: 'Was ist die `__init__`-Methode?',
    answer:
      'Der Konstruktor einer Klasse, der beim Erstellen eines Objekts automatisch aufgerufen wird.',
  },
  {
    question: 'Was bedeutet `self` in einer Klassenmethode?',
    answer:
      'Eine Referenz auf die aktuelle Instanz der Klasse, um auf ihre Attribute und Methoden zuzugreifen.',
  },
  {
    question: 'Was ist Vererbung in Python?',
    answer:
      'Ein Mechanismus, bei dem eine Klasse Attribute und Methoden einer anderen Klasse übernimmt: `class Unterklasse(Oberklasse):`',
  },
  {
    question: 'Was sind Klassenattribute vs. Instanzattribute?',
    answer:
      'Klassenattribute gehören der Klasse und werden von allen Instanzen geteilt. Instanzattribute gehören einer spezifischen Instanz.',
  },

  // Objekte
  {
    question: 'Was ist ein Objekt in Python?',
    answer:
      'Eine konkrete Instanz einer Klasse mit eigenem Zustand und Verhalten.',
  },
  {
    question: 'Wie erstellt man ein Objekt aus einer Klasse?',
    answer:
      'Durch Aufruf des Klassennamens wie eine Funktion: `objekt = Klassenname(parameter)`',
  },
  {
    question: 'Wie greift man auf Attribute eines Objekts zu?',
    answer: 'Mit der Punktnotation: `objekt.attribut`',
  },
  {
    question: 'Wie ruft man eine Methode eines Objekts auf?',
    answer: 'Mit der Punktnotation und Klammern: `objekt.methode(parameter)`',
  },
  {
    question: 'Was sind magische Methoden/Dunder-Methoden?',
    answer:
      'Spezielle Methoden mit doppelten Unterstrichen, z.B. `__str__`, `__add__`, die bestimmtes Verhalten definieren.',
  },
  {
    question: 'Wozu dient die `__str__`-Methode?',
    answer:
      'Sie definiert die String-Repräsentation eines Objekts, die beim Aufruf von `print(objekt)` verwendet wird.',
  },

  // Listen
  {
    question: 'Was ist eine Liste in Python?',
    answer:
      'Eine veränderbare, geordnete Sammlung von Elementen, definiert mit eckigen Klammern: `liste = [element1, element2]`',
  },
  {
    question: 'Wie greift man auf Elemente einer Liste zu?',
    answer:
      'Mit dem Index in eckigen Klammern, beginnend bei 0: `liste[0]`, `liste[-1]` (letztes Element)',
  },
  {
    question: 'Wie fügt man Elemente zu einer Liste hinzu?',
    answer: 'Mit `liste.append(element)` oder `liste.insert(index, element)`',
  },
  {
    question: 'Wie entfernt man Elemente aus einer Liste?',
    answer:
      'Mit `liste.remove(element)`, `liste.pop(index)` oder `del liste[index]`',
  },
  {
    question: 'Was ist List Comprehension?',
    answer:
      'Eine kompakte Schreibweise zum Erstellen von Listen: `[ausdruck for element in sequenz if bedingung]`',
  },
  {
    question: 'Wie schneidet man einen Teil einer Liste aus?',
    answer:
      'Mit der Slice-Notation: `liste[start:ende:schritt]`, z.B. `liste[1:4]`',
  },
]
