export function sliderToDelay(input: number) {
  // input: 0 - 20
  const stepsPerSecond = [
    0.2, 0.5, 1, 1.5, 2, 3, 4, 5, 8, 10, 12, 15, 20, 25, 30, 40, 60, 120, 200,
    300, 600,
  ]
  return 1000 / stepsPerSecond[input]
}
