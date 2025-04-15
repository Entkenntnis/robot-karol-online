// manage session and local storage data

import { questList } from '../data/overview'
import { Core } from '../state/core'
import {
  EditorSessionSnapshot,
  QuestSessionData_MUST_STAY_COMPATIBLE,
} from '../state/types'

const userIdKey = 'robot_karol_online_tmp_id'
const userNameKey = 'robot_karol_online_name'
const questKey = (id: number) => `karol_quest_beta_${id}`
const persistKey = 'karol_quest_beta_persist'
const lngKey = 'robot_karol_online_lng'
const robotImageKey = 'robot_karol_online_robot_image'

export function getUserId() {
  if (!sessionStorage.getItem(userIdKey) && !localStorage.getItem(userIdKey)) {
    sessionStorage.setItem(userIdKey, Math.random().toString())
  }

  return localStorage.getItem(userIdKey) ?? sessionStorage.getItem(userIdKey)
}

export function getUserName() {
  return (
    localStorage.getItem(userNameKey) ??
    sessionStorage.getItem(userNameKey) ??
    ''
  ).trim()
}

export function getLng() {
  return (localStorage.getItem(lngKey) ??
    sessionStorage.getItem(lngKey) ??
    'de') == 'de'
    ? 'de'
    : 'en'
}

export function setLngStorage(lng: 'de' | 'en') {
  if (isPersisted()) {
    localStorage.setItem(lngKey, lng)
  }
  sessionStorage.setItem(lngKey, lng)
}

export function setRobotImage(image?: string | null) {
  if (image) {
    localStorage.setItem(robotImageKey, image)
  }
}

export function getRobotImage() {
  return localStorage.getItem(robotImageKey)
}

export function isPersisted() {
  return !!localStorage.getItem(persistKey)
}

export function setUserName(name: string) {
  if (isPersisted()) {
    localStorage.setItem(userNameKey, name)
  }
  sessionStorage.setItem(userNameKey, name)
}

export function getQuestData(id: number) {
  const rawSes = sessionStorage.getItem(questKey(id))
  const rawLoc = localStorage.getItem(questKey(id))
  if (rawLoc) {
    return JSON.parse(rawLoc) as QuestSessionData_MUST_STAY_COMPATIBLE
  }
  if (rawSes) {
    return JSON.parse(rawSes) as QuestSessionData_MUST_STAY_COMPATIBLE
  }
  return null
}

export function setQuestData(data: QuestSessionData_MUST_STAY_COMPATIBLE) {
  if (isPersisted()) {
    localStorage.setItem(questKey(data.id), JSON.stringify(data))
  }
  sessionStorage.setItem(questKey(data.id), JSON.stringify(data))
}

export function saveToJSON(core: Core) {
  let data: Record<string, any> = {
    [userIdKey]: getUserId(),
    [userNameKey]: getUserName(),
    [persistKey]: isPersisted(),
    [lngKey]: getLng(),
    [robotImageKey]: getRobotImage(),
  }
  for (const id of questList) {
    const questData = getQuestData(id)
    if (questData != null) {
      data[questKey(id)] = questData
    }
  }

  const blob = new Blob([JSON.stringify(data)], { type: 'text/json' })
  const link = document.createElement('a')

  link.download = `${new Date().toISOString().substring(0, 10)}-${
    getUserName()
      ? `${getUserName().replace(/[^A-Za-z0-9äüöÄÜÖß]/g, '_')}-`
      : ''
  }${core.strings.overview.gameState}_robot_karol_online.json`
  link.href = window.URL.createObjectURL(blob)
  link.dataset.downloadurl = ['text/json', link.download, link.href].join(':')

  const evt = new MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true,
  })

  link.dispatchEvent(evt)
  link.remove()
}

export async function loadFromJSON() {
  return new Promise((res, rej) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'

    const reader = new FileReader()
    reader.addEventListener('load', (e) => {
      if (e.target != null && typeof e.target.result === 'string') {
        const data = JSON.parse(e.target.result)
        setUserName(data[userNameKey])
        //setAppearance(data[appearanceKey])
        for (const id of questList) {
          const questData = data[questKey(id)]
          if (questData != null) {
            setQuestData(questData)
          }
        }
        setLngStorage(data[lngKey])
        res(true)
        setRobotImage(data[robotImageKey])
      }
      rej(false)
    })

    input.addEventListener('change', () => {
      if (input.files != null) {
        let file = input.files[0]
        reader.readAsText(file)
      }
    })

    const evt = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
    })

    input.dispatchEvent(evt)
  })
}

export function copySessionToLocal() {
  localStorage.setItem(userIdKey, sessionStorage.getItem(userIdKey) ?? '')

  localStorage.setItem(persistKey, '1')

  localStorage.setItem(userNameKey, sessionStorage.getItem(userNameKey) ?? '')

  for (const id of questList) {
    const qd = getQuestData(id)
    if (qd) {
      localStorage.setItem(questKey(id), JSON.stringify(qd))
    }
  }
}

export function copyLocalToSession() {
  sessionStorage.setItem(userIdKey, localStorage.getItem(userIdKey) ?? '')
  localStorage.removeItem(userIdKey)

  localStorage.removeItem(persistKey)

  sessionStorage.setItem(userNameKey, localStorage.getItem(userNameKey) ?? '')
  localStorage.removeItem(userNameKey)

  sessionStorage.setItem(lngKey, localStorage.getItem(lngKey) ?? '')
  localStorage.removeItem(lngKey)

  for (const id of questList) {
    const qd = getQuestData(id)
    if (qd) {
      localStorage.removeItem(questKey(id))
      sessionStorage.setItem(questKey(id), JSON.stringify(qd))
    }
  }
}

export function resetStorage() {
  copyLocalToSession()
  sessionStorage.clear()
}

export function saveEditorSnapshot(core: Core) {
  // create a snapshot
  const snapshot: EditorSessionSnapshot = {
    settings: core.ws.settings,
    editor: core.ws.editor,
    quest: core.ws.quest,
    code: core.ws.code,
    javaCode: core.ws.javaCode,
    pythonCode: core.ws.pythonCode,
  }
  sessionStorage.setItem(
    'robot_karol_online_session_snapshot',
    JSON.stringify(snapshot)
  )
}

export function restoreEditorSnapshot(core: Core) {
  try {
    const snapshotRaw = sessionStorage.getItem(
      'robot_karol_online_session_snapshot'
    )
    if (snapshotRaw) {
      const snapshot = JSON.parse(snapshotRaw) as EditorSessionSnapshot
      core.mutateWs((ws) => {
        ws.settings = snapshot.settings
        ws.editor = snapshot.editor
        ws.quest = snapshot.quest
        ws.code = snapshot.code
        ws.javaCode = snapshot.javaCode
        ws.pythonCode = snapshot.pythonCode
        ws.ui.needsTextRefresh = true
      })
    }
  } catch (e) {}
}

export function deleteEditorSnapshot() {
  sessionStorage.removeItem('robot_karol_online_session_snapshot')
}

export function setOverviewScroll(scroll: number) {
  sessionStorage.setItem(
    'robot_karol_online_overview_scroll',
    scroll.toString()
  )
}
export function getOverviewScroll() {
  const scroll = sessionStorage.getItem('robot_karol_online_overview_scroll')
  if (scroll) {
    return parseInt(scroll)
  }
  return 0
}

export function setLearningPathScroll(scroll: number) {
  sessionStorage.setItem(
    'robot_karol_online_learning_path_scroll',
    scroll.toString()
  )
}

export function getLearningPathScroll() {
  const scroll = sessionStorage.getItem(
    'robot_karol_online_learning_path_scroll'
  )
  if (scroll) {
    return parseInt(scroll)
  }
  return 0
}

export function setQuestReturnToMode(mode: 'path' | 'overview' | 'demo') {
  sessionStorage.setItem('robot_karol_online_quest_return_to', mode)
}

export function getQuestReturnToMode() {
  const mode = sessionStorage.getItem('robot_karol_online_quest_return_to')
  if (mode) {
    return mode as 'path' | 'overview' | 'demo'
  }
  return 'path'
}

export function setLockToKarolCode() {
  sessionStorage.setItem('robot_karol_online_lock_to_karol_code', '1')
}

export function getLockToKarolCode() {
  return !!sessionStorage.getItem('robot_karol_online_lock_to_karol_code')
}
