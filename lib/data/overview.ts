export const questListByCategory = [
  {
    title: 'Anweisung und Sequenz',
    titleEn: 'Introduction',
    quests: [1, 47, 48, 39, 49, 41, 6, 44],
  },
  {
    title: 'Wiederholung mit fester Anzahl (Zählschleife)',
    titleEn: 'Loops',
    quests: [43, 2, 40, 31, 22, 42, 7, 23, 10, 9, 32],
  },
  {
    title: 'Bedingte Wiederholung (Schleife mit Anfangsbedingung)',
    titleEn: 'Conditional Loops',
    quests: [29, 35, 36, 25, 27, 4, 24],
  },
  {
    title: 'Bedingte Anweisung',
    titleEn: 'Conditional statements',
    quests: [53, 54, 55, 58, 56, 57, 59, 45],
  },
  {
    title: 'Kombinationen von Kontrollstrukturen',
    titleEn: 'Combinations',
    quests: [5, 12, 64, 26, 28, 14, 13],
  },
  {
    title: 'Anspruchsvolle Aufgaben',
    titleEn: 'Challenges',
    quests: [33, 15, 19, 50, 16, 52, 51],
  },
  {
    title: 'Rätsel',
    titleEn: 'Fun',
    quests: [30, 17, 18, 37],
  },
  {
    title: 'Sonstiges',
    titleEn: 'Miscellaneous',
    quests: [60],
  },
  {
    title: 'Einführung in Python (im Aufbau)',
    titleEn: 'Introduction to Python',
    quests: [61, 63, 66, 65, 62, 67, 68, 69],
  },
]

export const questList: number[] = []

questListByCategory.forEach((entry) =>
  entry.quests.forEach((id) => {
    questList.push(id)
  })
)
