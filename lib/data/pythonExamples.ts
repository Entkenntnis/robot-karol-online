// Python-Karol example data
export const pythonKarolExamples = [
  { title: 'Creeper', link: '#2VH3' },
  { title: 'Begrüßung', link: '#C8PU' },
  { title: 'Explosion', link: '#SW6Y' },
  { title: 'Twitch Alerts', link: '#SBEU' },
  { title: 'Passwort-Check', link: '#C2ZW' },
  { title: 'Zahlenraten', link: '#M464' },
  { title: 'Tresor-Code', link: '#GDWS' },
  { title: 'Trommelwirbel', link: '#YS36' },
  { title: 'Raketenstart', link: '#YSBE' },
  { title: 'To-Do-Liste', link: '#5RU5' },
  { title: 'Der Boden ist Lava', link: '#BYCE' },
  { title: 'Begrüßungs-Bot', link: '#KCP4' },
  { title: 'Verfolger', link: '#U2CR' },
  { title: 'Scanner', link: '#XGCF' },
  { title: 'Kunst-Generator', link: '#DASK' },
  { title: 'Mitternachtsformel', link: '#VHMG' },
  { title: 'Glider', link: '#WK3C' },
  { title: 'Sprechen mit Karol', link: '#FFSM' },
  { title: 'Sternenstaub', link: '#3UWS' },
  { title: 'Fraktal', link: '#GNTB' },
  { title: 'BetterRobot Klasse', link: '#GCPB' },
  { title: 'Himmel und Hölle', link: '#5THY' },
  { title: 'Programmier-Witze', link: '#4NR3' },
  { title: 'Karol Kart', link: '#CXTJ' },
  { title: 'Dance, Dance', link: '#TH6H', hidden: true },
]

export function getExampleId(title: string) {
  return title.toLowerCase().replace(/\s+/g, '_')
}
