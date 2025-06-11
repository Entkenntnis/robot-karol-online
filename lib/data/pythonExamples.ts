// Python-Karol example data
export const pythonKarolExamples = [
  { title: 'Creeper', link: '#2VH3' },
  { title: 'Der Boden ist Lava', link: '#BYCE' },
  { title: 'Sprechen mit Karol', link: '#FFSM' },
  { title: 'Scanner', link: '#XGCF' },
  { title: 'Kunst-Generator', link: '#DASK' },
  { title: 'Verfolger', link: '#U2CR' },
  { title: 'Explosion', link: '#SW6Y' },
  { title: 'Twitch Alerts', link: '#SBEU' },
  { title: 'Begrüßung', link: '#C8PU' },
  { title: 'Mitternachtsformel', link: '#VHMG' },
  { title: 'Glider', link: '#WK3C' },
  { title: 'Sternenstaub', link: '#3UWS' },
  { title: 'Fraktal', link: '#GNTB' },
  { title: 'BetterRobot Klasse', link: '#GCPB' },
  { title: 'Himmel und Hölle', link: '#5THY' },
  { title: 'Programmier-Witze', link: '#4NR3' },
  { title: 'Karol Kart', link: '#CXTJ' },
  { title: 'Dance, Dance', link: '#CT2Z', hidden: true },
]

export function getExampleId(title: string) {
  return title.toLowerCase().replace(/\s+/g, '_')
}
