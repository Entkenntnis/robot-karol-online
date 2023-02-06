import { isAfter, isBefore } from 'date-fns'
import { backend } from '../../backend'
import { questDeps } from '../data/dependencies'
import { questList } from '../data/overview'
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
      const storedPW = sessionStorage.getItem('karol_stored_pw')
      const password = storedPW ?? prompt('Zugangspasswort:') ?? ''
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
      if (data.length > 0) {
        sessionStorage.setItem('karol_stored_pw', password)
      }
      const cutoff = new Date(2023, 1, 5)

      core.mutateWs((ws) => {
        ws.ui.isAnalyze = true
        ws.analyze.cutoff = cutoff.toLocaleString()
      })

      // pass 1: collect some basic information and build user data
      const userRawData: {
        [userId: string]: { quests: { [id: string]: { solvedAt: number } } }
      } = {}
      const dedup: { [key: string]: boolean } = {}
      core.mutateWs((ws) => {
        for (const entry of data) {
          if (isAfter(new Date(entry.createdAt), cutoff)) {
            const ts = new Date(entry.createdAt).getTime()
            const key = entry.userId + entry.event
            if (dedup[key]) {
              continue
            } else {
              dedup[key] = true
            }

            ws.analyze.count++

            if (entry.event == 'show_editor') {
              ws.analyze.showEditor++
              continue
            }
            if (entry.event == 'load_id_Z9xO1rVGj') {
              ws.analyze.showPlayground++
              continue
            }
            if (entry.event == 'show_demo') {
              ws.analyze.showDemo++
              continue
            }
            if (entry.event == 'show_structogram') {
              ws.analyze.showStructogram++
              continue
            }
            if (entry.event == 'persist_progress') {
              ws.analyze.usePersist++
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
              if (!ws.analyze.customQuests[id]) {
                ws.analyze.customQuests[id] = { start: 0, complete: 0 }
              }
              ws.analyze.customQuests[id].start++
              continue
            }
            const completeCustom = /custom_quest_complete_(.+)/.exec(
              entry.event
            )
            if (completeCustom) {
              const id = completeCustom[1]
              if (!ws.analyze.customQuests[id]) {
                ws.analyze.customQuests[id] = { start: 0, complete: 0 }
              }
              ws.analyze.customQuests[id].complete++
              continue
            }
            const loadLegacy = /load_id_(.+)/.exec(entry.event)
            if (loadLegacy) {
              const id = loadLegacy[1]
              if (!ws.analyze.legacy[id]) {
                ws.analyze.legacy[id] = { count: 0 }
              }
              ws.analyze.legacy[id].count++
              continue
            }

            const completeQuest = /^quest_complete_(.+)/.exec(entry.event)

            if (completeQuest) {
              const id = completeQuest[1]
              if (!userRawData[entry.userId]) {
                userRawData[entry.userId] = { quests: {} }
              }

              if (!userRawData[entry.userId].quests[id]) {
                userRawData[entry.userId].quests[id] = { solvedAt: ts }
              }
              if (ts < userRawData[entry.userId].quests[id].solvedAt) {
                userRawData[entry.userId].quests[id].solvedAt = ts
              }
            }
          }
        }
      })

      // prepare: populate quest data and generate deps
      core.mutateWs((ws) => {
        for (const index in questData) {
          ws.analyze.quests[index] = { reachable: 0, complete: 0 }
        }
      })

      const deps: typeof questDeps = JSON.parse(JSON.stringify(questDeps))
      for (let i = 1; i < questList.length - 1; i++) {
        deps[questList[i]].push(questList[i - 1])
      }

      // pass 2: collect relevant information for quests
      core.mutateWs((ws) => {
        for (const userId in userRawData) {
          const data = userRawData[userId]
          if (!data.quests[1]) {
            continue
          }
          if (data.quests[1].solvedAt < cutoff.getTime()) {
            continue
          }
          // these are relevant users
          for (const index in questData) {
            if (!questList.includes(parseInt(index))) {
              continue
            }
            if (data.quests[index]) ws.analyze.quests[index].complete++
            if (deps[index].some((i) => data.quests[i] !== undefined)) {
              ws.analyze.quests[index].reachable++
            }
          }
        }
      })
    } catch (e) {
      console.log(e)
    }
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
