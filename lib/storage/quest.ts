// manage quest data transfer between session, local and JSON files

import { questList } from '../data/overview'
import { Core } from '../state/core'
import {
  getKarolmaniaProgress,
  getLng,
  getQuestData,
  getRobotImage,
  getUserId,
  getUserName,
  isPersisted,
  karolmaniaProgressKey,
  lngKey,
  persistKey,
  questKey,
  robotImageKey,
  setKarolmaniaProgress,
  setLngStorage,
  setQuestData,
  setRobotImage,
  setUserName,
  userIdKey,
  userNameKey,
} from './storage'

export function saveToJSON(core: Core) {
  let data: Record<string, any> = {
    [userIdKey]: getUserId(),
    [userNameKey]: getUserName(),
    [persistKey]: isPersisted(),
    [lngKey]: getLng(),
    [robotImageKey]: getRobotImage(),
    [karolmaniaProgressKey]: getKarolmaniaProgress(),
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
        if (data[persistKey]) {
          localStorage.setItem(persistKey, '1')
        }
        setUserName(data[userNameKey])
        //setAppearance(data[appearanceKey])
        for (const id of questList) {
          const questData = data[questKey(id)]
          if (questData != null) {
            setQuestData(questData)
          }
        }
        setLngStorage(data[lngKey])
        setRobotImage(data[robotImageKey])
        setKarolmaniaProgress(data[karolmaniaProgressKey])
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

  localStorage.setItem(lngKey, sessionStorage.getItem(lngKey) ?? 'de')

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
