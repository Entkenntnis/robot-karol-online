import { isAfter } from 'date-fns'
import { backend } from '../../backend'
import { questList } from '../data/overview'
import { questData } from '../data/quests'
import { submit_event } from '../helper/submit'
import { Core } from '../state/core'
import { loadLegacyProject, loadQuest } from './load'
import { switchToPage } from './page'
import { getAppearance, getLng } from '../storage/storage'
import { isSetName } from '../helper/events'
import { mapData } from '../data/map'
import { setLng, showOverviewList } from './mode'
import { createWorld } from '../state/create'
import { QuestSerialFormat } from '../state/types'
import { deserializeQuest } from './json'
import { startQuest } from './quest'
import { show } from 'blockly/core/contextmenu'

export async function initClient(core: Core) {
  window.addEventListener('popstate', () => {
    window.location.reload()
  })

  const parameterList = new URLSearchParams(window.location.search)

  const id = parameterList.get('id')

  const code = parameterList.get('code')

  if (typeof code === 'string') {
    // lock ui to code only
    core.mutateWs((ws) => {
      ws.ui.lockLanguage = 'karol'
      ws.settings.mode = 'code'
    })
  }

  function buildPlayground() {
    core.mutateWs((ws) => {
      ws.quest.title = 'Spielwiese'
      ws.quest.description = 'Programmiere frei und baue dein Herzensprojekt.'
      ws.ui.isPlayground = true
      ws.quest.tasks = [
        { title: 'Spielwiese', start: createWorld(15, 10, 6), target: null },
      ]
      ws.ui.needsTextRefresh = true
    })
    submit_event('show_playground', core)
    switchToPage(core, 'imported')
  }

  if (id) {
    if (id == 'Z9xO1rVGj') {
      buildPlayground()
      return
    }
    await loadLegacyProject(core, id)
    switchToPage(core, 'imported')
    return
  }

  const appearance = getAppearance()
  if (appearance) {
    core.mutateWs((ws) => {
      ws.appearance = appearance
    })
  }

  setLng(core, getLng())

  const hash = window.location.hash.toUpperCase()
  const normalHash = window.location.hash

  if (hash.startsWith('#SPIELWIESE')) {
    const parts = hash.split('-')
    if (parts.length > 1) {
      const mode = parts[1]
      if (mode == 'CODE') {
        core.mutateWs((ws) => {
          ws.settings.mode = 'code'
          ws.settings.language = 'robot karol'
        })
      } else if (mode == 'PYTHON') {
        core.mutateWs((ws) => {
          ws.settings.mode = 'code'
          ws.settings.language = 'python'
          ws.ui.proMode = parts.length == 3 && parts[2] == 'PRO'
        })
      } else if (mode == 'JAVA') {
        core.mutateWs((ws) => {
          ws.settings.mode = 'code'
          ws.settings.language = 'java'
        })
      }
    }
    buildPlayground()
    return
  }

  if (hash == '#OVERVIEW') {
    showOverviewList(core)
    return
  }

  if (hash == '#INSPIRATION') {
    switchToPage(core, 'inspiration')
    return
  }

  if (hash == '#INSPIRATION-OLD') {
    switchToPage(core, 'inspiration-old')
    return
  }

  if (hash.startsWith('#QUEST-')) {
    const questId = parseInt(hash.substring(7))
    startQuest(core, questId)
    return
  }

  if (hash == '#ANALYZE' /* && window.location.hostname == 'localhost'*/) {
    try {
      // cutoff is always one month before the current date
      const cutoff = new Date()
      cutoff.setMonth(cutoff.getMonth() - 1)

      const storedPW = sessionStorage.getItem('karol_stored_pw')
      const password = storedPW ?? prompt('Zugangspasswort:') ?? ''
      const response = await fetch(backend.analyzeEndpoint, {
        method: 'POST',
        body: new URLSearchParams({
          password,
          ts: cutoff.getTime().toString(),
        }),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      const data = (await response.json()) as {
        userId: string
        event: string
        createdAt: string
      }[]
      const responseSol = await fetch(backend.solutionAnalyzeEndpoint, {
        method: 'POST',
        body: new URLSearchParams({
          password,
          ts: cutoff.getTime().toString(),
        }),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      const dataSol = (await responseSol.json()) as {
        questId: number
        solution: string
        createdAt: string
        userId: string
      }[]

      if (data.length > 0) {
        sessionStorage.setItem('karol_stored_pw', password)
      }

      core.mutateWs((ws) => {
        ws.analyze.cutoff = cutoff.toLocaleString()
      })

      // pass 1: collect some basic information and build user data
      const userRawData: {
        [userId: string]: {
          quests: { [id: string]: { solvedAt: number } }
          nameSetAt: number
        }
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
            if (
              entry.event == 'load_id_Z9xO1rVGj' ||
              entry.event == 'show_playground'
            ) {
              ws.analyze.showPlayground++
              continue
            }
            if (entry.event == 'show_demo') {
              ws.analyze.showDemo++
              continue
            }
            if (entry.event == 'show_highscore') {
              ws.analyze.showHighscore++
              continue
            }
            if (entry.event == 'show_questlist') {
              ws.analyze.showQuestList++
              continue
            }
            if (entry.event == 'show_materials') {
              ws.analyze.showMaterials++
              continue
            }
            if (entry.event == 'show_inspiration') {
              ws.analyze.showInspiration++
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
            if (entry.event == 'use_java') {
              ws.analyze.useJava++
              continue
            }
            if (entry.event == 'use_python') {
              ws.analyze.usePython++
              continue
            }
            if (entry.event == 'play_snake') {
              ws.analyze.playSnake++
              continue
            }
            if (entry.event == 'pro_mode') {
              ws.analyze.proMode++
              continue
            }
            if (entry.event == 'lng_en') {
              ws.analyze.lngEn++
              continue
            }
            if (entry.event == 'limit_edit_options') {
              ws.analyze.limitEditOptions++
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
                userRawData[entry.userId] = { quests: {}, nameSetAt: -1 }
              }

              if (!userRawData[entry.userId].quests[id]) {
                userRawData[entry.userId].quests[id] = { solvedAt: ts }
              }
              if (ts < userRawData[entry.userId].quests[id].solvedAt) {
                userRawData[entry.userId].quests[id].solvedAt = ts
              }
            }

            if (isSetName(entry.event)) {
              if (!userRawData[entry.userId]) {
                userRawData[entry.userId] = { quests: {}, nameSetAt: -1 }
              }
              userRawData[entry.userId].nameSetAt = ts
            }

            const appearance = /^select_appearance_(.+)/.exec(entry.event)

            if (appearance) {
              const id = appearance[1]
              if (!ws.analyze.appearance[id]) {
                ws.analyze.appearance[id] = { count: 0 }
              }
              ws.analyze.appearance[id].count++
              continue
            }

            const rating = /^rate_quest_([\d]+)_(.+)/.exec(entry.event)

            if (rating) {
              const id = parseInt(rating[1])
              const value = parseInt(rating[2])

              const entry = (ws.analyze.ratings[id] = ws.analyze.ratings[
                id
              ] ?? { average: 0, count: 0, values: [] })
              const previousSum = entry.average * entry.count
              entry.average =
                (entry.average * entry.count + value) / (entry.count + 1)
              entry.count++
              entry.values.push(value)
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

      const deps = mapData

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
          const times = Object.values(data.quests).map((q) => q.solvedAt)
          if (data.nameSetAt > 0) {
            times.push(data.nameSetAt)
          }
          const max = Math.max(...times)
          const min = Math.min(...times)
          ws.analyze.userTimes.push(max - min)
          // these are relevant users
          for (const index in questData) {
            if (!questList.includes(parseInt(index))) {
              continue
            }
            if (data.quests[index]) ws.analyze.quests[index].complete++
            if (deps[index].deps.some((i) => data.quests[i] !== undefined)) {
              ws.analyze.quests[index].reachable++
            }
          }
        }
        ws.analyze.userTimes.sort((a, b) => b - a)
      })

      // pass 3: process solution data
      core.mutateWs((ws) => {
        for (const entry of dataSol) {
          if (isAfter(new Date(entry.createdAt), cutoff)) {
            if (!ws.analyze.solutions[entry.userId]) {
              ws.analyze.solutions[entry.userId] = []
            }
            let currentSolution = entry.solution.trim()
            let isCode = false
            if (currentSolution.startsWith('//code-tab\n')) {
              currentSolution = currentSolution
                .replace('//code-tab\n', '')
                .trim()
              isCode = true
            }
            let isAttempt = false
            if (currentSolution.endsWith('// attempt //')) {
              currentSolution = currentSolution
                .replace('// attempt //', '')
                .trim()
              isAttempt = true
            }
            /*const hasEntry = ws.analyze.solutions[entry.questId].find(
              (x) => x.solution == currentSolution && x.isCode == isCode
            )
            if (hasEntry) {
              hasEntry.count++
            } else {*/
            ws.analyze.solutions[entry.userId].push({
              solution: currentSolution,
              isCode,
              isAttempt,
              createdAt: isAttempt
                ? entry.createdAt
                : new Date(
                    new Date(entry.createdAt).getTime() - 1000
                  ).toISOString(),
            })
            //}
          }
        }
        /*for (const questId in ws.analyze.solutions) {
          ws.analyze.solutions[questId].sort((a, b) =>
            a.count == b.count
              ? a.solution.split('\n').length - b.solution.split('\n').length
              : b.count - a.count
          )
        }*/
      })

      // completely raw user-data
      const userEvents = data.reduce((res, obj) => {
        const key = obj.userId
        const entry = (res[key] = res[key] || { events: [] })
        entry.events.push(obj)
        return res
      }, {} as { [key: string]: { events: (typeof data)[number][] } })
      core.mutateWs((ws) => {
        ws.analyze.userEvents = userEvents
      })
      switchToPage(core, 'analyze')
      return
    } catch (e) {
      console.log(e)
    }
  }

  if (hash == '#EDITOR') {
    switchToPage(core, 'editor')
    return
  }

  if (hash.startsWith('#OPEN:')) {
    try {
      // extract url
      const url = normalHash.substring(6)
      // fetch data
      const response = await fetch(url)
      const text = await response.text()
      const obj = JSON.parse(text ?? '{}') as QuestSerialFormat
      if (obj.version !== 'v1') {
        throw 'bad format'
      }
      deserializeQuest(core, obj)
      switchToPage(core, 'shared')
      return
    } catch (e) {
      alert(e)
    }
  }

  if (hash == '#DEMO') {
    submit_event('show_demo', core)
    switchToPage(core, 'demo')
    return
  } else if (hash.length == 5) {
    await loadQuest(core, hash.substring(1))
    switchToPage(core, 'shared')
    return
  }

  switchToPage(core, 'overview')
}
