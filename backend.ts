// const host = 'http://localhost:3006'
const host = 'https://karol.arrrg.de/backend'

export const backend = {
  host,

  // loading projects and quests
  legacyEndpoint: host + '/load',
  questEndpoint: host + '/quest/load',

  // sharing quests in editor
  questShareEndpoint: host + '/quest_share',

  // store events on the server, like survey or feedback
  eventEndpoint: host + '/persistent_event',

  // store experiment events
  experimentEndpoint: host + '/experiment_event',

  // ping for every page view
  pageviewEndpoint: host + '/pageview',
}
