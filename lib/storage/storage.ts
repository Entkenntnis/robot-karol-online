// manage session and local storage data

import { Core } from '../state/core'
import type {
  EditorSessionSnapshot,
  KarolmaniaProgress_WILL_BE_STORED_ON_CLIENT,
  QuestSessionData_MUST_STAY_COMPATIBLE,
  Settings,
} from '../state/types'

export const userIdKey = 'robot_karol_online_tmp_id'
export const userNameKey = 'robot_karol_online_name'
export const questKey = (id: number) => `karol_quest_beta_${id}`
export const lngKey = 'robot_karol_online_lng'
export const robotImageKey = 'robot_karol_online_robot_image'
const karolmaniaCarouselIndexKey =
  'robot_karol_online_karolmania_carousel_index'
const karolmaniaMusicEnabledKey = 'robot_karol_online_karolmania_music_enabled'
const karolmaniaSoundEffectsEnabledKey =
  'robot_karol_online_karolmania_sound_effects_enabled'
export const karolmaniaProgressKey = 'robot_karol_online_karolmania_progress'
const miniProjectCollapsedKey = 'robot_karol_online_mini_project_collapsed'
export const experimentEventsKey = 'robot_karol_online_experiment_events'
const previewParticipationKey = 'robot_karol_online_preview_participation'

export function getUserId() {
  let userId = localStorage.getItem(userIdKey)
  if (!userId) {
    userId = Math.random().toString()
    localStorage.setItem(userIdKey, userId)
  }
  return userId
}

export function getUserName() {
  return (localStorage.getItem(userNameKey) ?? '').trim()
}

export function getLng() {
  return (localStorage.getItem(lngKey) || 'de') == 'de' ? 'de' : 'en'
}

export function setLngStorage(lng: 'de' | 'en') {
  localStorage.setItem(lngKey, lng)
}

export function setRobotImage(image?: string | null) {
  if (image) {
    localStorage.setItem(robotImageKey, image)
  }
}

export function getRobotImage() {
  return localStorage.getItem(robotImageKey)
}

export function setUserName(name: string) {
  localStorage.setItem(userNameKey, name)
}

export function getQuestData(id: number) {
  const rawLoc = localStorage.getItem(questKey(id))
  if (rawLoc) {
    return JSON.parse(rawLoc) as QuestSessionData_MUST_STAY_COMPATIBLE
  }
  return null
}

export function setQuestData(data: QuestSessionData_MUST_STAY_COMPATIBLE) {
  localStorage.setItem(questKey(data.id), JSON.stringify(data))
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
    isChatMode: core.ws.ui.isChatMode,
  }
  sessionStorage.setItem(
    'robot_karol_online_session_snapshot',
    JSON.stringify(snapshot),
  )
}

export function restoreEditorSnapshot(core: Core) {
  try {
    const snapshotRaw = sessionStorage.getItem(
      'robot_karol_online_session_snapshot',
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
        ws.ui.isChatMode = snapshot.isChatMode
        if (snapshot.isChatMode) {
          ws.ui.lockLanguage = 'python-pro'
        }
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
    scroll.toString(),
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
    scroll.toString(),
  )
}

export function getLearningPathScroll() {
  const scroll = sessionStorage.getItem(
    'robot_karol_online_learning_path_scroll',
  )
  if (scroll) {
    return parseInt(scroll)
  }
  return 0
}

export function setQuestReturnToMode(path: string) {
  sessionStorage.setItem('robot_karol_online_quest_return_to', path)
}

export function getQuestReturnToPath(fallback: string) {
  const path = sessionStorage.getItem('robot_karol_online_quest_return_to')
  if (path != null) {
    return path
  }
  return fallback
}

export function setLockToKarolCode() {
  sessionStorage.setItem('robot_karol_online_lock_to_karol_code', '1')
}

export function getLockToKarolCode() {
  return !!sessionStorage.getItem('robot_karol_online_lock_to_karol_code')
}

export function setPreferredQuestSettings(
  mode: Settings['mode'],
  language: Settings['language'],
) {
  sessionStorage.setItem(
    'robot_karol_online_preferred_quest_settings',
    JSON.stringify({ mode, language }),
  )
}

export function restorePreferredQuestSettings(core: Core) {
  const raw = sessionStorage.getItem(
    'robot_karol_online_preferred_quest_settings',
  )
  if (raw) {
    const { mode, language } = JSON.parse(raw)
    core.mutateWs((ws) => {
      ws.settings.mode = mode
      ws.settings.language = language
    })
  }
}

export function setKarolmaniaCarouselIndex(index: number) {
  sessionStorage.setItem(karolmaniaCarouselIndexKey, index.toString())
}

export function getKarolmaniaCarouselIndex() {
  const index = sessionStorage.getItem(karolmaniaCarouselIndexKey)
  if (index !== null) {
    return parseInt(index)
  }
  return 0
}

export function setKarolmaniaMusicEnabled(enabled: boolean) {
  sessionStorage.setItem(karolmaniaMusicEnabledKey, enabled ? '1' : '0')
}

export function getKarolmaniaMusicEnabled() {
  const value = sessionStorage.getItem(karolmaniaMusicEnabledKey)
  if (value === null) {
    return true // Default to music enabled if not set
  }
  return value === '1'
}

export function setKarolmaniaSoundEffectsEnabled(enabled: boolean) {
  sessionStorage.setItem(karolmaniaSoundEffectsEnabledKey, enabled ? '1' : '0')
}

export function getKarolmaniaSoundEffectsEnabled() {
  const value = sessionStorage.getItem(karolmaniaSoundEffectsEnabledKey)
  if (value === null) {
    return true // Default to sound effects enabled if not set
  }
  return value === '1'
}

// Functions for Karolmania high scores
export function getKarolmaniaProgress(): KarolmaniaProgress_WILL_BE_STORED_ON_CLIENT {
  const progressData = localStorage.getItem(karolmaniaProgressKey)
  if (!progressData) {
    return { levels: {} }
  }

  try {
    return JSON.parse(
      progressData,
    ) as KarolmaniaProgress_WILL_BE_STORED_ON_CLIENT
  } catch (e) {
    // If there's an error parsing the data, return a new empty object
    return { levels: {} }
  }
}

export function setKarolmaniaProgress(
  progress: KarolmaniaProgress_WILL_BE_STORED_ON_CLIENT,
) {
  localStorage.setItem(karolmaniaProgressKey, JSON.stringify(progress))
}

export function saveKarolmaniaHighScore(
  levelId: number,
  timeInSeconds: number,
): boolean {
  const progress = getKarolmaniaProgress()

  // Check if this is a new personal best
  const isNewPB =
    !progress.levels[levelId] || timeInSeconds < progress.levels[levelId].pb

  if (isNewPB) {
    // Save the new personal best
    if (!progress.levels[levelId]) {
      progress.levels[levelId] = { pb: timeInSeconds }
    } else {
      progress.levels[levelId].pb = timeInSeconds
    }

    // Save to localStorage
    localStorage.setItem(karolmaniaProgressKey, JSON.stringify(progress))
  }

  return isNewPB
}

export function getBestTimeForLevel(levelId: number): number | null {
  const progress = getKarolmaniaProgress()
  return progress.levels[levelId]?.pb || null
}

export function setMiniProjectCollapsed(collapsed: boolean) {
  sessionStorage.setItem(miniProjectCollapsedKey, collapsed ? '1' : '0')
}

export function getMiniProjectCollapsed(): boolean {
  const value = sessionStorage.getItem(miniProjectCollapsedKey)
  if (value === null) return true
  return value === '1'
}

export function getPreviewParticipation() {
  const value = localStorage.getItem(previewParticipationKey)
  if (value === null) {
    return true
  }
  return value == '1'
}

export function setPreviewParticipation(value: boolean) {
  localStorage.setItem(previewParticipationKey, value ? '1' : '0')
}

function getExperimentEvents(): string[] {
  for (const store of [localStorage, sessionStorage]) {
    const raw = store.getItem(experimentEventsKey)
    if (raw != null) {
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          return parsed
        }
      } catch {}
    }
  }
  return []
}

export function submitExperimentEventOnce(key: string): boolean {
  if (getExperimentEvents().includes(key)) {
    return false
  }
  const events = [...new Set([...getExperimentEvents(), key])]
  localStorage.setItem(experimentEventsKey, JSON.stringify(events))
  return true
}
