import { deserialize } from '../lib/commands/json'
import { useCore } from '../lib/state/core'

export function FileInput() {
  const core = useCore()
  return (
    <input
      type="file"
      id="load_project"
      multiple={false}
      accept=".json"
      className="hidden"
      onChange={(e) => {
        const fr = new FileReader()
        const files = e.target.files
        if (files) {
          fr.readAsText(files[0])
          fr.onload = () => {
            deserialize(core, fr.result?.toString())
          }
        }
      }}
    />
  )
}
