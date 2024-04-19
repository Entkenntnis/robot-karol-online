'use client'

import { Diagnostic } from '@codemirror/lint'
import { Op } from '../../lib/state/types'
import { useEffect, useState } from 'react'
import { FaIcon } from '../../components/helper/FaIcon'
import { faCheckCircle, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { Text } from '@codemirror/state'
import { compileJava } from '../../lib/language/java/compileJava'
import { CompilerTestCase } from './page'
import { parser } from '../../lib/codemirror/javaParser/parser'
import { useSearchParams } from 'next/navigation'

export function CompilerTest({ test }: { test: CompilerTestCase }) {
  const searchParams = useSearchParams()
  const [run, setRun] = useState(false)
  const [output, setOutput] = useState<Op[] | undefined>(undefined)
  const [warnings, setWarnings] = useState<Diagnostic[] | undefined>(undefined)
  const [rkCode, setRkCode] = useState<string | undefined>(undefined)
  const [proMode, setProMode] = useState(false)
  useEffect(() => {
    if (!run) {
      const tree = parser.parse(test.source)
      const doc = Text.of(test.source.split('\n'))
      const result = compileJava(tree, doc)
      console.log(result)
      if (result.warnings.length > 0) {
        setWarnings(result.warnings)
      } else {
        setOutput(result.output)
        setRkCode(result.rkCode)
        if (result.proMode) {
          setProMode(true)
        }
      }
      setRun(true)
    }
  }, [test.source, run])

  if (searchParams.has('profi')) {
    if (!test.proMode) {
      return null
    }
  }

  const expected = JSON.stringify(
    test.output ? test.output : test.warnings,
    null,
    2
  )
  const outputJSON = JSON.stringify(output, null, 2)
  const warningsJSON = JSON.stringify(warnings, null, 2)
  return (
    <>
      <h3 className="mt-8 border-t pt-4 font-bold">{test.title}</h3>
      {run ? (
        <div className="flex flex-row w-full justify-around">
          <div className="m-3 w-1/3">
            <h3>Quellcode</h3>
            <pre className="mt-3 border min-h-12 text-sm max-h-64 overflow-auto">
              {test.source ? test.source : <>&nbsp;</>}
            </pre>
          </div>
          <div className="m-3 w-1/3">
            <h3>{test.output ? 'Erwarteter Output' : 'Erwartete Warnungen'}</h3>
            <pre className="mt-3 border max-h-64 overflow-auto text-sm">
              {expected}
            </pre>
            {test.rkCode !== undefined && (
              <pre className="mt-3 border max-h-64 overflow-auto text-sm">
                {test.rkCode ? test.rkCode : ' '}
              </pre>
            )}
            {test.proMode && <small>Profi-Modus</small>}
          </div>
          <div className="m-3 w-1/3">
            <h3>
              Ergebnis{' '}
              <button
                className="inline-block ml-3 underline"
                onClick={() => {
                  setRun(false)
                }}
              >
                neu starten
              </button>
            </h3>
            {(
              ((!test.proMode && !proMode) || (test.proMode && proMode)) &&
              test.output
                ? expected == outputJSON && test.rkCode === rkCode
                : expected == warningsJSON
            ) ? (
              <div>
                <FaIcon
                  icon={faCheckCircle}
                  className="text-xl mt-4 text-green-600"
                />
              </div>
            ) : (
              <div>
                <p className="text-red-600">Fehler!</p>
                <pre className="mt-3 border bg-red-300 max-h-64 overflow-auto text-sm">
                  {outputJSON +
                    '\n' +
                    warningsJSON +
                    '\n' +
                    rkCode +
                    '\nproMode:' +
                    proMode}
                </pre>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center w-full">
          <FaIcon
            icon={faSpinner}
            className="animate-spin mx-auto w-10 my-16"
          />
        </div>
      )}
    </>
  )
}
