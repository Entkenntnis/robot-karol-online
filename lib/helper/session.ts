import { questData } from '../data/quests'
import { QuestSessionData } from '../state/types'

export function isQuestDone(id: number) {
  const data = getQuestSessionData(id)
  if (data) {
    if (data.completed || data.completedOnce) {
      return true
    }
  }
  return false
}

export function getQuestSessionData(id: number) {
  const rawSes = sessionStorage.getItem(`karol_quest_beta_${id}`)
  const rawLoc = localStorage.getItem(`karol_quest_beta_${id}`)
  if (rawLoc) {
    return JSON.parse(rawLoc) as QuestSessionData
  }
  if (rawSes) {
    return JSON.parse(rawSes) as QuestSessionData
  }
  return null
}

export function isQuestStarted(id: number) {
  const data = getQuestSessionData(id)
  if (data) {
    if (!data.completed && data.code) {
      return true
    }
  }
  return false
}
