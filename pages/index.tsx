import { Editor } from '../components/Editor'
import Image from 'next/image'
import Head from 'next/head'

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
import istmarkeImg from '../public/istmarke.png'
import nichtistmarkeImg from '../public/nichtistmarke.png'

import anweisungImg from '../public/anweisung.png'
import { useEffect, useRef, useState } from 'react'
import { EditorView } from '@codemirror/basic-setup'
import clsx from 'clsx'
import { Scrollbars } from 'react-custom-scrollbars'

import { Heading, KarolWorld, View } from '../components/View'

export default function Home() {
  const editor = useRef<EditorView | null>(null)

  const [section, setSection] = useState('Bewegung')

  const [counter, setCounter] = useState(0)

  useEffect(() => {
    setTimeout(() => {
      setCounter(counter + 1)
    }, 100)
  }, [counter])

  return (
    <>
      <Head>
        <title>Robot Karol Web</title>
      </Head>
      <div className="flex h-[100vh]">
        {renderBlockMenu()}
        <div className="w-full text-base h-full overflow-y-auto">
          <Editor setRef={(e: EditorView) => (editor.current = e)} />
        </div>
        <Player />
      </div>
    </>
  )

  function renderBlockMenu() {
    return (
      <div className="h-full bg-gray-50 flex">
        <div className="h-full bg-white flex flex-col">
          {renderCategory('Bewegung')}
          {renderCategory('Steuerung')}
          {renderCategory('Fühlen')}
          {renderCategory('Anweisung')}
        </div>
        <div className="h-full border-l border-gray-300">
          <Scrollbars
            style={{ height: '100vh', width: 200 }}
            universal
            onScroll={(e: any) => {
              const scrollTop = e.currentTarget.scrollTop
              if (scrollTop < 470) {
                setSection('Bewegung')
              } else if (scrollTop < 976) {
                setSection('Steuerung')
              } else if (scrollTop < 1299) {
                setSection('Fühlen')
              } else {
                setSection('Anweisung')
              }
            }}
          >
            {renderCategoryTitle('Bewegung')}
            {buildProtoBlock('schritt', schrittImg, 'Schritt\n')}
            {buildProtoBlock('linksdrehen', linksdrehenImg, 'LinksDrehen\n')}
            {buildProtoBlock('rechtsdrehen', rechtsdrehenImg, 'RechtsDrehen\n')}
            {buildProtoBlock('hinlegen', hinlegenImg, 'Hinlegen\n')}
            {buildProtoBlock('aufheben', aufhebenImg, 'Aufheben\n')}
            {buildProtoBlock('markesetzen', markesetzenImg, 'MarkeSetzen\n')}
            {buildProtoBlock(
              'markeloeschen',
              markeloeschenImg,
              'MarkeLöschen\n'
            )}
            {renderCategoryTitle('Steuerung')}
            {buildProtoBlock(
              'wiederholenmal',
              wiederholenmalImg,
              'wiederhole 3 mal\n  \nendewiederhole'
            )}
            {buildProtoBlock(
              'wiederholesolange',
              wiederholesolangeImg,
              'wiederhole solange \n  \nendewiederhole'
            )}
            {buildProtoBlock(
              'wenndann',
              wenndannImg,
              'wenn  dann\n  \nendewenn'
            )}
            {buildProtoBlock(
              'wenndannsonst',
              wenndannsonstImg,
              'wenn  dann\n  \nsonst\n  \nendewenn'
            )}
            {renderCategoryTitle('Fühlen')}
            {buildProtoBlock('istwand', istwandImg, 'IstWand')}
            {buildProtoBlock('nichtistwand', nichtistwandImg, 'NichtIstWand')}
            {buildProtoBlock('istziegel', istziegenImg, 'IstZiegel')}
            {buildProtoBlock(
              'nichtistziegel',
              nichtistziegelImg,
              'NichtIstZiegel'
            )}{' '}
            {buildProtoBlock('istmarke', istmarkeImg, 'IstMarke')}{' '}
            {buildProtoBlock(
              'nichtistmarke',
              nichtistmarkeImg,
              'NichtIstMarke'
            )}
            <div className="h-[100vh]">
              {renderCategoryTitle('Anweisung')}
              {buildProtoBlock(
                'anweisung',
                anweisungImg,
                'Anweisung NeueAnweisung\n  \nendeAnweisung'
              )}
            </div>
          </Scrollbars>
        </div>
      </div>
    )
  }

  function renderCategory(name: string) {
    return (
      <div
        className={clsx(
          'flex flex-col items-center pb-3 px-2',
          'hover:cursor-pointer text-gray-800 hover:text-blue-500',
          'transition-colors select-none',
          name == section && 'bg-gray-200'
        )}
        onClick={() => {
          setSection(name)
          document.getElementById(name)?.scrollIntoView()
        }}
      >
        <div
          className={clsx('w-5 h-5 rounded-full border border-gray-800 mt-3', {
            'bg-blue-500': name == 'Bewegung',
            'bg-yellow-400': name == 'Steuerung',
            'bg-[#06B6D4]': name == 'Fühlen',
            'bg-red-500': name == 'Anweisung',
          })}
        ></div>
        <div className="text-xs">{name}</div>
      </div>
    )
  }

  function renderCategoryTitle(name: string) {
    return (
      <>
        <div id={name} className="pb-[1px]" />
        <h2 className="my-3 ml-2 text-sm font-bold">{name}</h2>
      </>
    )
  }

  function buildProtoBlock(id: string, image: StaticImageData, code: string) {
    return (
      <div className="mb-2 mx-2">
        <Image
          className="cursor-pointer"
          onDoubleClick={() => {
            if (editor.current) {
              editor.current.dispatch(
                editor.current.state.replaceSelection(code)
              )
              editor.current.focus()
            }
          }}
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

function Player() {
  const [world, setWorld] = useState<KarolWorld>({
    height: 6,
    width: 5,
    length: 10,
    karol: {
      x: 0,
      y: 0,
      dir: 'south',
    },
    bricks: [
      [6, 0, 0, 0, 0],
      [0, 1, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
    ],
    marks: [
      [false, false, false, false, false],
      [false, false, false, false, false],
      [false, false, false, false, false],
      [false, false, false, false, false],
      [false, false, false, false, false],
      [false, false, false, false, false],
      [false, false, false, false, false],
      [false, false, false, false, false],
      [false, false, false, false, false],
      [false, false, false, false, false],
    ],
  })

  return (
    <div
      onKeyDown={(e) => {
        if (e.code == 'ArrowLeft') {
          const newWorld = cloneWorld(world)
          newWorld.karol.dir = {
            north: 'west',
            west: 'south',
            south: 'east',
            east: 'north',
          }[newWorld.karol.dir] as any
          setWorld(newWorld)
          e.preventDefault()
        }
        if (e.code == 'ArrowRight') {
          const newWorld = cloneWorld(world)
          newWorld.karol.dir = {
            north: 'east',
            east: 'south',
            south: 'west',
            west: 'north',
          }[newWorld.karol.dir] as any
          setWorld(newWorld)
          e.preventDefault()
        }
        if (e.code == 'ArrowUp') {
          const newWorld = cloneWorld(world)

          const newPos = move(
            world.karol.x,
            world.karol.y,
            world.karol.dir,
            world
          )

          if (newPos) {
            newWorld.karol.x = newPos.x
            newWorld.karol.y = newPos.y
          }

          setWorld(newWorld)
          e.preventDefault()
        }
        if (e.code == 'ArrowDown') {
          const newWorld = cloneWorld(world)

          if (world.karol.dir == 'west') {
            if (world.karol.x + 1 < world.width) {
              newWorld.karol.x++
            }
          }
          if (world.karol.dir == 'east') {
            if (world.karol.x > 0) {
              newWorld.karol.x--
            }
          }
          if (world.karol.dir == 'north') {
            if (world.karol.y + 1 < world.length) {
              newWorld.karol.y++
            }
          }
          if (world.karol.dir == 'south') {
            if (world.karol.y > 0) {
              newWorld.karol.y--
            }
          }
          setWorld(newWorld)
          e.preventDefault()
        }
        if (e.code == 'KeyM') {
          const newWorld = cloneWorld(world)

          newWorld.marks[world.karol.y][world.karol.x] =
            !newWorld.marks[world.karol.y][world.karol.x]

          setWorld(newWorld)
          e.preventDefault()
        }
        if (e.code == 'KeyH') {
          const newWorld = cloneWorld(world)

          const pos = move(world.karol.x, world.karol.y, world.karol.dir, world)

          if (pos) {
            newWorld.bricks[pos.y][pos.x] = Math.min(
              world.height,
              newWorld.bricks[pos.y][pos.x] + 1
            )
          }

          setWorld(newWorld)
          e.preventDefault()
        }
        if (e.code == 'KeyA') {
          const newWorld = cloneWorld(world)

          const pos = move(world.karol.x, world.karol.y, world.karol.dir, world)

          if (pos) {
            newWorld.bricks[pos.y][pos.x] = Math.max(
              0,
              newWorld.bricks[pos.y][pos.x] - 1
            )
          }

          setWorld(newWorld)
          e.preventDefault()
        }
      }}
      tabIndex={1}
      className="focus:border-green-200 border-white border-2"
    >
      <View world={world} />
    </div>
  )
}

function cloneWorld(world: KarolWorld): KarolWorld {
  return JSON.parse(JSON.stringify(world))
}

function move(x: number, y: number, dir: Heading, world: KarolWorld) {
  if (dir == 'east') {
    if (x + 1 < world.width) {
      return { x: x + 1, y }
    }
  }
  if (dir == 'west') {
    if (x > 0) {
      return { x: x - 1, y }
    }
  }
  if (dir == 'south') {
    if (y + 1 < world.length) {
      return { x, y: y + 1 }
    }
  }
  if (dir == 'north') {
    if (y > 0) {
      return { x, y: y - 1 }
    }
  }
}
