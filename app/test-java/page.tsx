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
        message: "Erwarte eine Methode 'main' in Klasse 'C'",
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
        from: 19,
        to: 44,
        severity: 'error',
        message: "Erwarte Abschluss mit Semikolon ';'",
      },
    ],
  },
  {
    title: 'Leeres Grundgerüst',
    source:
      'class Programm {\n  Robot karol = new Robot();\n\n  void main() {\n\n  }\n}',
    output: [],
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
