import { Core } from '../state/core'

export function saveCodeToFile(core: Core) {
  // 3. Create a Blob from the string
  const blob = new Blob(
    [
      core.ws.settings.language == 'robot karol'
        ? core.ws.code
        : core.ws.settings.language == 'python'
        ? core.ws.pythonCode
        : core.ws.javaCode,
    ],
    {
      type: 'text/plain',
    }
  )

  // 4. Create a URL for the Blob
  const url = window.URL.createObjectURL(blob)

  // 5. Create an anchor element for the download link
  const a = document.createElement('a')
  a.href = url
  a.download = `${new Date()
    .toISOString()
    .substring(0, 10)}-${core.ws.quest.title.replace(
    /[^A-Za-z0-9äüöÄÜÖß]/g,
    '-'
  )}-robot-karol.${
    core.ws.settings.language == 'robot karol'
      ? 'txt'
      : core.ws.settings.language == 'python'
      ? 'py.txt'
      : 'java.txt'
  }` // specify the filename

  // 6. Simulate a click on the anchor element to trigger the download
  a.click()

  // 7. Clean up by revoking the Blob URL
  window.URL.revokeObjectURL(url)
}
