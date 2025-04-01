// manage session and local storage data

import { questList } from '../data/overview'
import { Core } from '../state/core'
import { Appearance, QuestSessionData } from '../state/types'

const userIdKey = 'robot_karol_online_tmp_id'
const userNameKey = 'robot_karol_online_name'
const questKey = (id: number) => `karol_quest_beta_${id}`
const persistKey = 'karol_quest_beta_persist'
const appearanceKey = 'robot_karol_online_appearance'
const lngKey = 'robot_karol_online_lng'

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

export function getAppearance() {
  const rawSes = sessionStorage.getItem(appearanceKey)
  const rawLoc = localStorage.getItem(appearanceKey)
  if (rawLoc) {
    return JSON.parse(rawLoc) as Appearance
  }
  if (rawSes) {
    return JSON.parse(rawSes) as Appearance
  }
  return null
}

export function setAppearance(appearance: Appearance) {
  if (isPersisted()) {
    localStorage.setItem(appearanceKey, JSON.stringify(appearance))
  }
  sessionStorage.setItem(appearanceKey, JSON.stringify(appearance))
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
    return JSON.parse(rawLoc) as QuestSessionData
  }
  if (rawSes) {
    return JSON.parse(rawSes) as QuestSessionData
  }
  return null
}

export function setQuestData(data: QuestSessionData) {
  if (isPersisted()) {
    localStorage.setItem(questKey(data.id), JSON.stringify(data))
  }
  sessionStorage.setItem(questKey(data.id), JSON.stringify(data))
}

export function saveToJSON(core: Core) {
  let data: Record<string, any> = {
    [userIdKey]: getUserId(),
    [userNameKey]: getUserName(),
    [appearanceKey]: getAppearance(),
    [persistKey]: isPersisted(),
    [lngKey]: getLng(),
  }
  for (const id of questList) {
    const questData = getQuestData(id)
    if (questData != null) {
      data[questKey(id)] = questData
    }
  }

  const blob = new Blob([JSON.stringify(data)], { type: 'text/json' })
  const link = document.createElement('a')

  link.download = `${new Date().toISOString().substring(0, 10)}-robot-karol-${
    core.strings.overview.gameState
  }.json`
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
        setAppearance(data[appearanceKey])
        for (const id of questList) {
          const questData = data[questKey(id)]
          if (questData != null) {
            setQuestData(questData)
          }
        }
        setLngStorage(data[lngKey])
        res(true)
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
  localStorage.setItem(
    appearanceKey,
    sessionStorage.getItem(appearanceKey) ?? ''
  )

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

  sessionStorage.setItem(
    appearanceKey,
    localStorage.getItem(appearanceKey) ?? ''
  )
  localStorage.removeItem(appearanceKey)

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
