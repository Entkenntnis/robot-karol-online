// const host = 'http://localhost:3006'
const host = 'https://stats-karol.arrrg.de'

export const backend = {
  statsEndpoint: host + '/submit',
  questShareEndpoint: host + '/quest_share',
  legacyEndpoint: host + '/load',
  questEndpoint: host + '/quest/load',
  analyzeEndpoint: host + '/export',
  highscoreEndpoint: host + '/highscore',
  solutionEndpoint: host + '/submitSolution',
  solutionAnalyzeEndpoint: host + '/exportSolutions',
  randomEndpoint: host + '/random',
}
