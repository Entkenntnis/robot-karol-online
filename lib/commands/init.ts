import { isAfter, isBefore } from 'date-fns'
import { backend } from '../../backend'
import { questDeps } from '../data/dependencies'
import { questData } from '../data/quests'
import { submit_event } from '../helper/submit'
import { Core } from '../state/core'
import { QuestSerialFormat } from '../state/types'
import { addNewTask } from './editor'
import { deserializeQuest } from './json'
import { loadLegacyProject, loadQuest } from './load'

export async function initClient(core: Core) {
  if (core.ws.ui.clientInitDone) return

  const parameterList = new URLSearchParams(window.location.search)

  const id = parameterList.get('id')

  if (id) {
    core.mutateWs(({ ui }) => {
      ui.editorLoading = true
      ui.showQuestOverview = false
      ui.isImportedProject = true
    })
    await loadLegacyProject(core, id)
    core.mutateWs(({ ui }) => {
      ui.clientInitDone = true
    })
    return
  }

  const hash = window.location.hash.toUpperCase()

  if (hash == '#ANALYZE' && window.location.hostname == 'localhost') {
    try {
      const password = prompt('Zugangspasswort:') ?? ''
      const response = await fetch(backend.analyzeEndpoint, {
        method: 'POST',
        body: new URLSearchParams({ password }),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      const data = (await response.json()) as {
        userId: string
        event: string
        createdAt: string
      }[]
      const cutoff = new Date(2023, 0, 21)
      let count = 0
      let showEditor = 0
      let showPlayground = 0
      let showDemo = 0
      let legacy: { [key: string]: { count: number } } = {}
      let users: { [key: string]: { solved: string[] } } = {}
      const dedup: { [key: string]: boolean } = {}
      core.mutateWs((ws) => {
        ws.ui.isAnalyze = true
        ws.analyze.cutoff = cutoff.toLocaleString()
        const customStuff: {
          [key: string]: { start: number; complete: number }
        } = {}
        const quests: {
          [key: string]: { start: number; complete: number }
        } = {}
        for (const entry of data) {
          if (isAfter(new Date(entry.createdAt), cutoff)) {
            const key = entry.userId + entry.event
            if (dedup[key]) {
              continue
            } else {
              dedup[key] = true
            }
            count++
            if (entry.event == 'show_editor') {
              showEditor++
              continue
            }
            if (entry.event == 'load_id_Z9xO1rVGj') {
              showPlayground++
              continue
            }
            if (entry.event == 'show_demo') {
              showDemo++
              continue
            }
            const publish = /publish_custom_quest_(.+)/.exec(entry.event)
            if (publish) {
              ws.analyze.published.push({
                id: publish[1],
                date: new Date(entry.createdAt).toLocaleString(),
              })
              continue
            }
            const startCustom = /load_custom_quest_(.+)/.exec(entry.event)
            if (startCustom) {
              const id = startCustom[1]
              if (!customStuff[id]) {
                customStuff[id] = { start: 0, complete: 0 }
              }
              customStuff[id].start++
              continue
            }
            const completeCustom = /custom_quest_complete_(.+)/.exec(
              entry.event
            )
            if (completeCustom) {
              const id = completeCustom[1]
              if (!customStuff[id]) {
                customStuff[id] = { start: 0, complete: 0 }
              }
              customStuff[id].complete++
              continue
            }
            const startQuest = /start_quest_(.+)/.exec(entry.event)
            if (startQuest) {
              const id = startQuest[1]
              if (!quests[id]) {
                quests[id] = { start: 0, complete: 0 }
              }
              quests[id].start++
              continue
            }
            const completeQuest = /quest_complete_(.+)/.exec(entry.event)
            if (completeQuest) {
              const id = completeQuest[1]
              if (!quests[id]) {
                quests[id] = { start: 0, complete: 0 }
              }
              quests[id].complete++
              if (!users[entry.userId]) {
                users[entry.userId] = { solved: [] }
              }
              users[entry.userId].solved.push(id)
              continue
            }
            const loadLegacy = /load_id_(.+)/.exec(entry.event)
            if (loadLegacy) {
              const id = loadLegacy[1]
              if (!legacy[id]) {
                legacy[id] = { count: 0 }
              }
              legacy[id].count++
              continue
            }
            console.log(entry)
          }
        }
        for (const id in customStuff) {
          ws.analyze.customQuests.push({
            id,
            start: customStuff[id].start,
            complete: customStuff[id].complete,
          })
        }
        ws.analyze.quests = quests
        ws.analyze.count = count
        ws.analyze.showEditor = showEditor
        ws.analyze.showPlayground = showPlayground
        ws.analyze.showDemo = showDemo
        ws.analyze.legacy = legacy
        ws.analyze.users = users

        for (const index in questData) {
          let reachableCount = 0

          for (const userId in users) {
            if (
              questDeps[index].some((i) =>
                users[userId].solved.includes(i.toString())
              )
            ) {
              reachableCount++
            }
          }
          ws.analyze.reachable[index] = reachableCount
        }

        console.log(users)
      })
    } catch (e) {}
  }

  if (hash == '#EDITOR') {
    core.mutateWs(({ ui, quest }) => {
      ui.isEditor = true
      ui.showQuestOverview = false
      quest.title = 'Titel der Aufgabe'
      quest.description = 'Beschreibe, um was es bei der Aufgabe geht ...'
    })

    submit_event('show_editor', core)

    const id = parseInt(parameterList.get('quest') ?? '')

    if (id > 0) {
      const obj = questData[id]
      core.mutateWs((ws) => {
        ws.quest.title = obj.title
        ws.quest.description = obj.description
        ws.quest.tasks = obj.tasks
      })
    } else {
      addNewTask(core)
    }

    core.mutateWs(({ ui }) => {
      ui.clientInitDone = true
    })
    return
  }

  if (hash == '#DEMO') {
    core.mutateWs(({ ui }) => {
      ui.isDemo = true
    })
    submit_event('show_demo', core)
  } else if (hash.length == 5) {
    core.mutateWs(({ ui }) => {
      ui.editorLoading = true
      ui.showQuestOverview = false
    })
    await loadQuest(core, hash.substring(1))
    core.mutateWs(({ ui }) => {
      ui.clientInitDone = true
    })
    return
  }

  core.mutateWs(({ ui }) => {
    ui.clientInitDone = true
  })
}
