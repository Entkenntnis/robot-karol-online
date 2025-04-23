import { useState } from 'react'
import { closeModal } from '../../lib/commands/modal'
import { useCore } from '../../lib/state/core'
import { executeInBench } from '../../lib/commands/bench'
import { submitAnalyzeEvent } from '../../lib/commands/analyze'
import { capitalize } from '../../lib/helper/capitalize'

export function InvocationModal() {
  const core = useCore()
  const {
    invocationClass,
    invocationParameters,
    invocationMethod,
    invocationObject,
    invocationMode,
  } = core.ws.bench

  const [variableName, setVariableName] = useState(
    getDefaultVariableName(invocationClass)
  )
  const [parameters, setParameters] = useState(
    invocationParameters.map((p) => p.default || '')
  )

  function getDefaultVariableName(className: string) {
    if (!className) return 'obj'
    return className.charAt(0).toLowerCase() + className.slice(1)
  }

  const handleParamChange = (index: number, value: string) => {
    const newParams = [...parameters]
    newParams[index] = value
    setParameters(newParams)
  }

  const codeParams = invocationParameters
    .map((param, index) => {
      const value = parameters[index]
      return value ? `${param.name}=${value}` : ''
    })
    .filter(Boolean)
    .join(', ')

  const codePreview =
    invocationMode == 'constructor'
      ? `${variableName} = ${invocationClass}(${codeParams})`
      : `${invocationObject}.${invocationMethod}(${codeParams})`

  const doc =
    invocationMode == 'constructor'
      ? core.ws.bench.classInfo[invocationClass].doc
      : core.ws.bench.classInfo[invocationClass].methods[invocationMethod].doc

  const handleSubmit = (e: React.FormEvent) => {
    submitAnalyzeEvent(core, 'ev_click_bench_invocationExecute')
    e.preventDefault()
    executeInBench(core, codePreview).then((res: any) => {
      if (res.result !== undefined) {
        if (typeof res.result === 'boolean') {
          alert('Rückgabewert: ' + capitalize(res.result.toString()))
        } else if (
          typeof res.result === 'string' ||
          typeof res.result === 'number'
        ) {
          alert('Rückgabewert: ' + JSON.stringify(res.result))
        }
      }
    })
    closeModal(core)
  }

  return (
    <div className="bg-black/20 fixed inset-0 flex justify-center items-center z-[350]">
      <div
        className="w-[500px] bg-white z-[400] rounded-xl relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-4">
          <h1 className="text-xl">
            {invocationMode == 'constructor' ? (
              <>
                Erzeuge neues Objekt der Klasse{' '}
                <strong>{invocationClass}</strong>
              </>
            ) : (
              <>Methodenaufruf</>
            )}
          </h1>
          {doc && <p className="my-4 italic text-gray-500">{doc}</p>}

          {invocationMode == 'constructor' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Name der Variable
              </label>
              <input
                type="text"
                value={variableName}
                onChange={(e) => setVariableName(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                pattern="^(?!\d)(?:[\p{L}_])(?:[\p{L}\p{N}_]*)$"
                required
              />
            </div>
          )}

          {invocationParameters.length > 0 && (
            <div className=" text-sm font-medium">Argumente</div>
          )}
          {invocationParameters.map((param, index) => (
            <div key={param.name} className="flex items-center space-x-2">
              <label className="text-sm font-medium whitespace-nowrap">
                {param.name}
              </label>{' '}
              <span className="mx-3">=</span>
              <input
                type="text"
                value={parameters[index]}
                onChange={(e) => handleParamChange(index, e.target.value)}
                className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={`Bitte gib einen Wert für den Parameter ${param.name} ein`}
                required
              />
            </div>
          ))}

          <div className="space-y-2">
            <label className="block text-sm font-medium">Code-Vorschau</label>
            <pre className="p-3 bg-gray-100 rounded-md text-sm font-mono">
              {codePreview}
            </pre>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => closeModal(core)}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:ring-2 focus:ring-green-500"
            >
              Ausführen
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
