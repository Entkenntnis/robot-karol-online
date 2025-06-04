// Python-Karol example data
export const pythonKarolExamples = [
  { title: 'Creeper', link: '#2VH3' },
  { title: 'Der Boden ist Lava', link: '#BYCE' },
  { title: 'Sprechen mit Karol', link: '#FFSM' },
  { title: 'Scanner', link: '#XGCF' },
  { title: 'Kunst-Generator', link: '#DASK' },
  { title: 'Verfolger', link: '#U2CR' },
  { title: 'Explosion', link: '#SW6Y' },
  { title: 'Sternenstaub', link: '#3UWS' },
  { title: 'Fraktal', link: '#GNTB' },
  { title: 'BetterRobot Klasse', link: '#GCPB' },
  { title: 'Himmel und Hölle', link: '#5THY' },
  { title: 'Dance, Dance', link: '#8K3K', hidden: true },
  { title: 'Karol Kart', link: '#DS9C' },
]

export function getExampleId(title: string) {
  return title.toLowerCase().replace(/\s+/g, '_')
}
