import { Diagnostic } from '@codemirror/lint'
import { Op } from '../../lib/state/types'
import { Metadata } from 'next'
import { CompilerTest } from './CompilerTest'

export const metadata: Metadata = {
  title: 'Test Java',
}

export interface CompilerTestCase {
  title: string
  source: string
  output?: Op[]
  warnings?: Diagnostic[]
  rkCode?: string
}

const compilerTestCases: CompilerTestCase[] = [
  { title: 'Leeres Programm', source: '', output: [] },
  {
    title: 'Fehler bei Klasse ohne Name',
    source: 'class',
    warnings: [
      {
        from: 0,
        to: 5,
        severity: 'error',
        message: 'Erwarte Name der Klasse',
      },
    ],
  },
  {
    title: 'Fehler bei keiner Klasse',
    source: 'void main() {\n\n}',
    warnings: [
      {
        from: 0,
        to: 16,
        severity: 'error',
        message: 'Erwarte eine Klassendefinition',
      },
    ],
  },
  {
    title: 'Fehler bei mehreren Klassen',
    source: 'class P1 {}\nclass P2 {}',
    warnings: [
      {
        from: 0,
        to: 23,
        severity: 'error',
        message: 'Erwarte genau eine Klasse',
      },
    ],
  },
  {
    title: 'Fehler bei fehlendem Rumpf',
    source: 'class P1',
    warnings: [
      {
        from: 6,
        to: 8,
        severity: 'error',
        message: 'Erwarte Rumpf der Klasse',
      },
    ],
  },
  {
    title: 'Ignoriere Kommentare',
    source: '// Zeilen-Kommentar\n/* Block-Kommentar */',
    output: [],
  },
  {
    title: 'Fehler bei Import',
    source: 'import java.lang.Math;\nclass C {}',
    warnings: [
      {
        from: 0,
        to: 22,
        severity: 'error',
        message:
          "Bitte entferne 'import java.lang.Math;', wird hier nicht unterstützt",
      },
    ],
  },
  {
    title: 'Fehler bei Syntaxfehler',
    source: '% \nclass C {}',
    warnings: [
      {
        from: 0,
        to: 1,
        severity: 'error',
        message: 'Bitte Syntaxfehler korrigieren',
      },
    ],
  },
  {
    title: 'Fehler bei Zugriffsmodifier',
    source: 'public class C {}',
    warnings: [
      {
        from: 0,
        to: 6,
        severity: 'error',
        message: "Bitte entferne 'public', wird hier nicht unterstützt",
      },
    ],
  },
  {
    title: 'Fehler bei Syntaxfehler in Klassendeklaration',
    source: 'class C C {}',
    warnings: [
      {
        from: 8,
        to: 9,
        severity: 'error',
        message: 'Bitte Syntaxfehler korrigieren',
      },
    ],
  },
  {
    title: 'Fehler bei fehlender Klammern zu',
    source: 'class C {',
    warnings: [
      {
        from: 8,
        to: 9,
        severity: 'error',
        message: "Erwarte schließende geschweifte Klammer '}'",
      },
    ],
  },
  {
    title: 'Fehler bei fehlender Klammern auf',
    source: 'class C }',
    warnings: [
      {
        from: 8,
        to: 9,
        severity: 'error',
        message: "Erwarte öffnende geschweifte Klammer '{'",
      },
    ],
  },
  {
    title: 'Fehler bei fehlendem Attribut Robot',
    source: 'class C {}',
    warnings: [
      {
        from: 6,
        to: 7,
        severity: 'error',
        message: "Erwarte ein Attribut vom Typ 'Robot' in Klasse 'C'",
      },
    ],
  },
  {
    title: 'Fehler bei mehreren Attributen Robot',
    source:
      'class C {\n  Robot karol = new Robot();\n  Robot karol2 = new Robot();\n}',
    warnings: [
      {
        from: 6,
        to: 7,
        severity: 'error',
        message: "Erwarte genau ein Attribut vom Typ 'Robot' in Klasse 'C'",
      },
    ],
  },
  {
    title: 'Fehler bei fehlender Methode main',
    source: 'class C {\n  Robot karol = new Robot();\n}',
    warnings: [
      {
        from: 6,
        to: 7,
        severity: 'error',
        message: "Erwarte eine Methode 'void main()' in Klasse 'C'",
      },
    ],
  },
  {
    title: 'Fehler bei mehrfacher Methode main',
    source:
      'class C {\n  Robot karol = new Robot();\n  void main () {\n\n  }\n  void main () {\n\n  }\n}',
    warnings: [
      {
        from: 6,
        to: 7,
        severity: 'error',
        message: "Erwarte genau eine Methode 'main' in Klasse 'C'",
      },
    ],
  },
  {
    title: 'Fehler bei verschachtelter Klasse',
    source:
      'class Programm {\n  Robot karol = new Robot();\n\n  void main() {\n\n  }\n\n  class Inner { }\n}',
    warnings: [
      {
        from: 71,
        to: 86,
        severity: 'error',
        message:
          "Bitte entferne 'class Inner { }', wird hier nicht unterstützt",
      },
    ],
  },
  {
    title: 'Fehler bei fehlender Initialiserung',
    source: 'class Programm {\n  Robot x;\n}',
    warnings: [
      {
        from: 25,
        to: 26,
        severity: 'error',
        message: "Erwarte Initialisierung des Attributes 'x'",
      },
    ],
  },
  {
    title: 'Fehler bei Initialiserung ohne Objekt',
    source: 'class Programm {\n  Robot x =;\n\n  void main() {\n\n  }\n}',
    warnings: [
      {
        from: 25,
        to: 26,
        severity: 'error',
        message: "Erwarte Initialisierung mit 'new Robot()'",
      },
    ],
  },
  {
    title: 'Fehler bei Initialiserung mit fehlerhaftem Objekt',
    source:
      'class Programm {\n  Robot x = Robot();\n\n  void main() {\n\n  }\n}',
    warnings: [
      {
        from: 25,
        to: 26,
        severity: 'error',
        message: "Erwarte Initialisierung mit 'new Robot()'",
      },
    ],
  },
  {
    title: 'Fehler bei Initialiserung mit Argumenten',
    source: 'class Programm {\n  Robot x = Robot(42);\n}',
    warnings: [
      {
        from: 25,
        to: 26,
        severity: 'error',
        message: "Erwarte Initialisierung mit 'new Robot()'",
      },
    ],
  },
  {
    title: 'Fehler bei Initialiserung mit Syntaxfehler',
    source:
      'class Programm {\n  Robot x += new Robot();\n\n  void main() {\n\n  }\n}',
    warnings: [
      {
        from: 27,
        to: 28,
        severity: 'error',
        message: 'Bitte Syntaxfehler korrigieren',
      },
    ],
  },
  {
    title: 'Fehler bei fehlendem Semikolon',
    source:
      'class Programm {\n  Robot x = new Robot()\n\n  void main() {\n\n  }\n}',
    warnings: [
      {
        from: 39,
        to: 40,
        severity: 'error',
        message: "Erwarte Semikolon ';'",
      },
    ],
  },
  {
    title: 'Leeres Grundgerüst',
    source:
      'class Programm {\n  Robot karol = new Robot();\n\n  void main() {\n\n  }\n}',
    output: [],
    rkCode: '',
  },
  {
    title: 'Fehler bei eigenem Attribut',
    source:
      'class Programm {\n  Robot karol = new Robot();\n  int z = 4;\n\n  void main() {\n\n  }\n}',
    warnings: [
      {
        from: 48,
        to: 58,
        severity: 'error',
        message: 'Keine eigenen Attribute unterstützt',
      },
    ],
  },
  {
    title: 'Fehler bei eigener Methode',
    source:
      'class Programm {\n  Robot karol = new Robot();\n\n  void main() {\n\n  }\n\n  void test() {}\n}',
    warnings: [
      {
        from: 71,
        to: 85,
        severity: 'error',
        message: 'Keine eigenen Methoden unterstützt',
      },
    ],
  },
  {
    title: 'Fehler bei falschem Rückgabetyp der Hauptmethode',
    source:
      'class Programm {\n  Robot x = new Robot();\n\n  int main () {\n\n  }\n}',
    warnings: [
      {
        from: 49,
        to: 53,
        severity: 'error',
        message: "Erwarte Rückgabetyp 'void'",
      },
    ],
  },
  {
    title: 'Fehler bei fehlender Klammer',
    source:
      'class Programm {\n  Robot x = new Robot();\n\n  void main ( {\n\n  }\n}',
    warnings: [
      {
        from: 55,
        to: 57,
        severity: 'error',
        message: 'Bitte Syntaxfehler korrigieren',
      },
    ],
  },
  {
    title: 'Fehler bei fehlender Klammer',
    source:
      'class Programm {\n  Robot x = new Robot();\n\n  void main (int count) {\n\n  }\n}',
    warnings: [
      {
        from: 50,
        to: 54,
        severity: 'error',
        message: "Methode 'main' erwartet keine Parameter",
      },
    ],
  },
  {
    title: 'Fehler bei fehlendem Rumpf',
    source: 'class Programm {\n  Robot x = new Robot();\n\n  void main ()\n}',
    warnings: [
      {
        from: 50,
        to: 54,
        severity: 'error',
        message: "Erwarte Rumpf der Methode 'main'",
      },
    ],
  },
  {
    title: 'Fehler bei Syntaxfehler',
    source:
      'class Programm {\n  Robot x = new Robot();\n\n  void % main() {}\n}',
    warnings: [
      {
        from: 45,
        to: 61,
        severity: 'error',
        message: 'Bitte Syntaxfehler korrigieren',
      },
    ],
  },
  {
    title: 'Fehler bei fehlender Klammer',
    source:
      'class Programm {\n  Robot x = new Robot();\n\n  void  main() {\n    while (true) }\n  }\n}',
    warnings: [
      {
        from: 77,
        to: 78,
        severity: 'error',
        message: "Erwarte öffnende geschweifte Klammer '{'",
      },
    ],
  },
  {
    title: 'Fehler bei fehlendem Semikolon in Methodenrumpf',
    source:
      'class Programm {\n  Robot karol = new Robot();\n\n  void  main() {\n    karol.schritt()\n  }\n}',
    warnings: [
      {
        from: 82,
        to: 83,
        severity: 'error',
        message: "Erwarte Semikolon ';'",
      },
    ],
  },
  {
    title: 'Fehler bei leerstehendem Semikolon',
    source:
      'class Programm {\n  Robot karol = new Robot();\n\n  void  main() {\n    ;\n  }\n}',
    warnings: [
      {
        from: 68,
        to: 69,
        severity: 'error',
        message: 'Erwarte Methodenaufruf',
      },
    ],
  },
  {
    title: 'Fehler bei fehlendem Objekt',
    source:
      'class Programm {\n  Robot karol = new Robot();\n\n  void  main() {\n    schritt();\n  }\n}',
    warnings: [
      {
        from: 68,
        to: 77,
        severity: 'error',
        message: "Erwarte Punktnotation 'karol.'",
      },
    ],
  },
  {
    title: 'Fehler bei falschem Objekt',
    source:
      'class Programm {\n  Robot karol = new Robot();\n\n  void  main() {\n    k.schritt();\n  }\n}',
    warnings: [
      {
        from: 68,
        to: 69,
        severity: 'error',
        message: "Erwarte Objekt 'karol'",
      },
    ],
  },
  {
    title: 'Fehler bei unbekannter Methode',
    source:
      'class Programm {\n  Robot karol = new Robot();\n\n  void  main() {\n    karol.st();\n  }\n}',
    warnings: [
      {
        from: 74,
        to: 76,
        severity: 'error',
        message: "Unbekannte Methode 'st'",
      },
    ],
  },
  {
    title: 'Fehler bei überschüssigen Argument',
    source:
      'class Programm {\n  Robot karol = new Robot();\n\n  void  main() {\n    karol.markeSetzen(4);\n  }\n}',
    warnings: [
      {
        from: 85,
        to: 88,
        severity: 'error',
        message: 'Erwarte leere Parameterliste',
      },
    ],
  },
  {
    title: 'Fehler beginnt erst hinter Feldname',
    source:
      'class Programm {\n  Robot karol = new Robot();\n\n  void  main() {\n    karol.\n  }\n}',
    warnings: [
      {
        from: 74,
        to: 74,
        severity: 'error',
        message: 'Erwarte Methodenaufruf',
      },
    ],
  },
  {
    title: 'Fehler zeigt auf schließende Klammer',
    source:
      'class Programm {\n  Robot karol = new Robot();\n\n  void  main() {\n    karol.schritt(\n  }\n}',
    warnings: [
      {
        from: 81,
        to: 82,
        severity: 'error',
        message: 'Bitte runde Klammer schließen',
      },
      {
        from: 81,
        to: 82,
        severity: 'error',
        message: "Erwarte Semikolon ';'",
      },
    ],
  },
  {
    title: 'Erstes Programm mit Ausgabe',
    source:
      'class Programm {\n  Robot karol = new Robot();\n\n  void  main() {\n    karol.schritt();\n  }\n}',
    output: [{ type: 'action', command: 'forward', line: 5 }],
    rkCode: 'Schritt',
  },
  {
    title: 'Parameter für Schritt',
    source:
      'class Programm {\n  Robot karol = new Robot();\n\n  void  main() {\n    karol.schritt(2);\n  }\n}',
    output: [
      { type: 'action', command: 'forward', line: 5 },
      { type: 'action', command: 'forward', line: 5 },
    ],
    rkCode: 'Schritt(2)',
  },
  {
    title: 'Fehler falls Parameter negativ',
    source:
      'class Programm {\n  Robot karol = new Robot();\n\n  void  main() {\n    karol.schritt(-2);\n  }\n}',
    warnings: [
      {
        from: 81,
        to: 85,
        severity: 'error',
        message: 'Erwarte Zahl als Parameter',
      },
    ],
  },
  {
    title: 'Fehler falls kein Parameter erwartet',
    source:
      'class Programm {\n  Robot karol = new Robot();\n\n  void  main() {\n    karol.markeSetzen(2);\n  }\n}',
    warnings: [
      {
        from: 85,
        to: 88,
        severity: 'error',
        message: 'Erwarte leere Parameterliste',
      },
    ],
  },
  {
    title: 'Befehl Beenden',
    source:
      'class Programm {\n  Robot karol = new Robot();\n\n  void  main() {\n    karol.beenden();\n  }\n}',
    output: [
      {
        type: 'jump',
        target: Infinity,
      },
    ],
    rkCode: 'Beenden',
  },
  {
    title: 'Kommentare bleiben erhalten',
    source:
      'class Programm {\n  Robot karol = new Robot();\n\n  void  main() {\n    // Test\n    karol.schritt();\n    // Test 2\n  }\n}',
    output: [
      {
        type: 'action',
        command: 'forward',
        line: 6,
      },
    ],
    rkCode: '// Test\nSchritt\n// Test 2',
  },
  {
    title: 'Inline-Kommentare werden rausgeholt',
    source:
      'class Programm {\n  Robot karol = new Robot();\n\n  void  main() {\n    karol.schritt(/*123*/);\n  }\n}',
    output: [
      {
        type: 'action',
        command: 'forward',
        line: 5,
      },
    ],
    rkCode: 'Schritt\n/*123*/',
  },
  {
    title: 'Generiere Bytecode für Schleife',
    source:
      'class Programm {\n  Robot karol = new Robot();\n\n  void  main() {\n    for (int i = 0; i < 2; i++) {\n      karol.schritt();\n    }\n  }\n}',
    output: JSON.parse(
      '[{"type":"constant","value":3},{"type":"store","variable":"i"},{"type":"jump","target":4},{"type":"action","command":"forward","line":6},{"type":"load","variable":"i"},{"type":"constant","value":1},{"type":"operation","kind":"sub"},{"type":"store","variable":"i"},{"type":"load","variable":"i"},{"type":"branch","targetT":3,"targetF":10,"line":5}]'
    ),
    rkCode: 'wiederhole 2 mal\n  Schritt\nendewiederhole',
  },
  {
    title: 'Verschachtelte Schleie',
    source:
      'class Programm {\n  Robot karol = new Robot();\n\n  void  main() {\n    for (int i = 0; i < 2; i++) {\n      for (int j = 0; j < 2; j++) {\n        karol.schritt();\n      }\n    }\n  }\n}',
    output: JSON.parse(
      '[{"type":"constant","value":3},{"type":"store","variable":"i"},{"type":"jump","target":13},{"type":"constant","value":3},{"type":"store","variable":"j"},{"type":"jump","target":7},{"type":"action","command":"forward","line":7},{"type":"load","variable":"j"},{"type":"constant","value":1},{"type":"operation","kind":"sub"},{"type":"store","variable":"j"},{"type":"load","variable":"j"},{"type":"branch","targetT":6,"targetF":13,"line":6},{"type":"load","variable":"i"},{"type":"constant","value":1},{"type":"operation","kind":"sub"},{"type":"store","variable":"i"},{"type":"load","variable":"i"},{"type":"branch","targetT":3,"targetF":19,"line":5}]'
    ),
    rkCode:
      'wiederhole 2 mal\n  wiederhole 2 mal\n    Schritt\n  endewiederhole\nendewiederhole',
  },
  {
    title: 'Fehler bei wiederverwendeter Schleifenvariable',
    source:
      'class Programm {\n  Robot karol = new Robot();\n\n  void  main() {\n    for (int i = 0; i < 2; i++) {\n      for (int i = 0; i < 2; i++) {\n        karol.schritt();\n      }\n    }\n  }\n}',
    warnings: [
      {
        from: 113,
        to: 114,
        severity: 'error',
        message: "Variable 'i' existiert bereits, erwarte anderen Namen",
      },
    ],
  },
  {
    title: 'Endlosschleife',
    source:
      'class Programm {\n  Robot karol = new Robot();\n\n  void  main() {\n    while (true) {\n      karol.linksDrehen();\n    }\n  }\n}',
    output: [
      { type: 'action', command: 'left', line: 6 },
      { type: 'jump', target: 0 },
    ],
    rkCode: 'wiederhole immer\n  LinksDrehen\nendewiederhole',
  },
  {
    title: 'Bedingte Wiederholung',
    source:
      'class Programm {\n  Robot karol = new Robot();\n\n  void  main() {\n    while (karol.nichtIstWand()) {\n      karol.schritt();\n    }\n  }\n}',
    output: [
      { type: 'jump', target: 2 },
      { type: 'action', command: 'forward', line: 6 },
      {
        type: 'sense',
        condition: { type: 'wall', negated: true },
      },
      { type: 'branch', targetF: 4, targetT: 1, line: 68 },
    ],
    rkCode: 'wiederhole solange NichtIstWand\n  Schritt\nendewiederhole',
  },
  {
    title: 'Bedingte Wiederholung mit Parameter in Bedingung',
    source:
      'class Programm {\n  Robot karol = new Robot();\n\n  void  main() {\n    while (karol.istZiegel(2)) {\n      karol.aufheben();\n    }\n  }\n}',
    output: [
      { type: 'jump', target: 2 },
      { type: 'action', command: 'unbrick', line: 6 },
      { type: 'constant', value: 2 },
      {
        type: 'sense',
        condition: { type: 'brick_count', negated: false, count: 2 },
      },
      { type: 'branch', targetF: 5, targetT: 1, line: 68 },
    ],
    rkCode: 'wiederhole solange IstZiegel(2)\n  Aufheben\nendewiederhole',
  },
  {
    title: 'Fehler falls überflüssiger Parameter',
    source:
      'class Programm {\n  Robot karol = new Robot();\n\n  void  main() {\n    while (karol.istWand(2)) { }\n  }\n}',
    warnings: [
      {
        from: 88,
        to: 91,
        severity: 'error',
        message: 'Erwarte leere Parameterliste',
      },
    ],
  },
  {
    title: 'Zweiseitig bedingte Anweisung',
    source:
      'class Programm {\n  Robot karol = new Robot();\n\n  void  main() {\n    if (karol.nichtIstWand()) {\n        karol.linksDrehen();\n      } else {\n        karol.schritt();\n      }\n  }\n}',
    output: [
      {
        type: 'sense',
        condition: { type: 'wall', negated: true },
      },
      { type: 'branch', targetF: 4, targetT: 2, line: 5 },
      { type: 'action', command: 'left', line: 6 },
      { type: 'jump', target: 5 },
      { type: 'action', command: 'forward', line: 8 },
    ],
    rkCode: `wenn NichtIstWand dann\n  LinksDrehen\nsonst\n  Schritt\nendewenn`,
  },
  /*{
    title: 'Playground',
    source: 'class Programm {\n  Robot x;\n\n  void main() {\n\n  }\n}',
    warnings: [],
  },*/
]

export default function TestJava() {
  return (
    <div className="mx-8 mb-12">
      <h1 className="text-2xl mt-8">Testseite für Java-Modus</h1>
      <h2 className="mt-7 text-xl font-bold">Compiler</h2>
      {compilerTestCases.map((test, i) => (
        <CompilerTest test={test} key={i} />
      ))}
    </div>
  )
}
