import { useState } from 'react'
import { closeModal } from '../../lib/commands/modal'
import { useCore } from '../../lib/state/core'

export function InvocationModal() {
  const core = useCore()
  const { invocationClass, invocationParameters } = core.ws.bench

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement actual execution logic
    closeModal(core)
  }

  const codeParams = invocationParameters
    .map((param, index) => {
      const value = parameters[index]
      return value ? `${param.name}=${value}` : ''
    })
    .filter(Boolean)
    .join(', ')

  const codePreview = `${variableName} = ${invocationClass}(${codeParams})`

  return (
    <div
      className="bg-black/20 fixed inset-0 flex justify-center items-center z-[350]"
      onClick={() => closeModal(core)}
    >
      <div
        className="min-h-[250px] w-[500px] bg-white z-[400] rounded-xl relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-4">
          <h1 className="text-xl">
            Erzeuge neues Objekt der Klasse <strong>{invocationClass}</strong>
          </h1>

          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Name der Variable
            </label>
            <input
              type="text"
              value={variableName}
              onChange={(e) => setVariableName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {invocationParameters.map((param, index) => (
            <div key={param.name} className="space-y-2">
              <label className="block text-sm font-medium">{param.name}</label>
              <input
                type={'text'}
                value={parameters[index]}
                onChange={(e) => handleParamChange(index, e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={param.default || `Wähle Wert für ${param.name}`}
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
              abbrechen
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
