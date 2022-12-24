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
