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
      'class Programm {\n  Robot karol = new Robot();\n\n  void  main() {\n    karol.beenden(4);\n  }\n}',
    warnings: [
      {
        from: 81,
        to: 84,
        severity: 'error',
        message: 'Erwarte leere Argumentliste',
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
