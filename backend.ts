// const host = 'http://localhost:3006'
const host = 'https://karol-neu.arrrg.de/backend'

export const backend = {
  // statistics endpoint for logging events
  // events are used to generate highscore
  statsEndpoint: host + '/submit',

  // loading projects and quests
  legacyEndpoint: host + '/load',
  questEndpoint: host + '/quest/load',

  highscoreEndpoint: host + '/highscore',

  // sharing quests in editor
  questShareEndpoint: host + '/quest_share',

  // url shortener for robot iamge gallery
  urlShortenerEndpoint: host + '/share_image',

  // internal routes
  analyzeEndpoint: host + '/export',
  solutionAnalyzeEndpoint: host + '/exportSolutions',
}
