const data = [
  'Gut gemacht!',
  'Super!',
  'Bravo!',
  'Glückwunsch!',
  'Stark!',
  'Prima!',
]

export function positiveText() {
  return data[Math.floor(Math.random() * data.length)]
}

const dataEn = [
  'Well done!',
  'Super!',
  'Bravo!',
  'Congratulations!',
  'Strong!',
  'Excellent!',
]

export function positiveTextEn() {
  return dataEn[Math.floor(Math.random() * dataEn.length)]
}
