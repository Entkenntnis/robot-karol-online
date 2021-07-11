import { Editor } from '../components/Editor'
import Image from 'next/image'

import schrittImg from '../public/schritt.png'
import hinlegenImg from '../public/hinlegen.png'
import aufhebenImg from '../public/aufheben.png'
import linksdrehenImg from '../public/linksdrehen.png'
import rechtsdrehenImg from '../public/rechtsdrehen.png'
import markesetzenImg from '../public/markesetzen.png'
import markeloeschenImg from '../public/markeloeschen.png'

import wenndannImg from '../public/wenndann.png'
import wenndannsonstImg from '../public/wenndannsonst.png'
import wiederholenmalImg from '../public/wiederholenmal.png'
import wiederholeimmerImg from '../public/wiederholeimmer.png'
import wiederholesolangeImg from '../public/wiederholesolange.png'

import istwandImg from '../public/istwand.png'
import nichtistwandImg from '../public/nichtistwand.png'
import istziegenImg from '../public/istziegel.png'
import nichtistziegelImg from '../public/nichtistziegel.png'

import anweisungImg from '../public/anweisung.png'
import { useRef } from 'react'
import { EditorView } from '@codemirror/basic-setup'
import { createEmitAndSemanticDiagnosticsBuilderProgram } from 'typescript'

export default function Home() {
  const editor = useRef<EditorView | null>(null)

  return (
    <div className="flex h-[100vh]">
      <div className="w-52 bg-gray-50 flex flex-col items-center max-h-full overflow-y-scroll">
        {buildProtoBlock('schritt', schrittImg, 'Schritt\n')}
        {buildProtoBlock('linksdrehen', linksdrehenImg, 'LinksDrehen\n')}
        {buildProtoBlock('rechtsdrehen', rechtsdrehenImg, 'RechtsDrehen\n')}
        {buildProtoBlock(
          'wiederholesolange',
          wiederholesolangeImg,
          'wiederhole solange \n  \nendewiederhole'
        )}
        {buildProtoBlock('istwand', istwandImg, 'IstWand')}
        {buildProtoBlock('nichtistwand', nichtistwandImg, 'NichtIstWand')}
        {buildProtoBlock('istziegel', istziegenImg, 'IstZiegel')}
        {buildProtoBlock('nichtistziegel', nichtistziegelImg, 'NichtIstZiegel')}

        {buildProtoBlock(
          'wiederholenmal',
          wiederholenmalImg,
          'wiederhole 3 mal\n  \nendewiederhole'
        )}

        {buildProtoBlock('hinlegen', hinlegenImg, 'Hinlegen\n')}
        {buildProtoBlock('aufheben', aufhebenImg, 'Aufheben\n')}
        {buildProtoBlock('markesetzen', markesetzenImg, 'MarkeSetzen\n')}
        {buildProtoBlock('markeloeschen', markeloeschenImg, 'MarkeLöschen\n')}
        {buildProtoBlock('wenndann', wenndannImg, 'wenn  dann\n  \nendewenn')}
        {buildProtoBlock(
          'wenndannsonst',
          wenndannsonstImg,
          'wenn  dann\n  \nsonst\n  \nendewenn'
        )}
        {buildProtoBlock(
          'wiederholeimmer',
          wiederholeimmerImg,
          'wiederhole immer\n  \nendewiederhole'
        )}
        {buildProtoBlock(
          'anweisung',
          anweisungImg,
          'Anweisung NeueAnweisung\n  \nendeAnweisung'
        )}
      </div>
      <div className="w-full text-base h-full overflow-y-scroll">
        <Editor setRef={(e: EditorView) => (editor.current = e)} />
      </div>
    </div>
  )

  function buildProtoBlock(id: string, image: StaticImageData, code: string) {
    return (
      <div
        className="mb-2 cursor-pointer"
        onDoubleClick={() => {
          if (editor.current) {
            editor.current.dispatch(editor.current.state.replaceSelection(code))
            editor.current.focus()
          }
        }}
      >
        <Image
          src={image}
          alt={id}
          id={`protoblock-${id}`}
          draggable
          layout="fixed"
          onDragStart={(e) => {
            e.dataTransfer.setDragImage(
              document.getElementById(`protoblock-${id}`)!,
              0,
              0
            )
            e.dataTransfer.setData('text/plain', code)
          }}
        />
      </div>
    )
  }
}
