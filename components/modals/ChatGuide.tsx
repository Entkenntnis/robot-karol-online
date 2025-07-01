import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'
import { closeModal } from '../../lib/commands/modal'
import { useCore } from '../../lib/state/core'
import { FaIcon } from '../helper/FaIcon'
import clsx from 'clsx'

export function ChatGuide() {
  const core = useCore()
  return (
    <div className="bg-black/20 fixed inset-0 flex justify-center items-center z-[350]">
      <div
        className="max-h-[90%] w-[630px] bg-white z-[400] rounded-xl relative overflow-auto"
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        <button
          className="absolute top-3 right-3 h-8 w-8 flex justify-center items-center rounded-full bg-gray-200 hover:bg-gray-300"
          onClick={() => {
            closeModal(core)
          }}
        >
          <FaIcon icon={faTimes} />
        </button>
        <div className="mx-3 [&>p]:my-4">
          <p className="font-bold text-xl mt-6 mb-8 text-center">
            Anleitung für den Chat
          </p>
          <p>
            Schreibe ein Python-Programm, dass für alle Chats den gezeigten
            Ablauf ausführt.
          </p>
          <p>
            👉 Nutze <strong>print()</strong>, um Text auszugeben:
          </p>
          <p className="border rounded py-2 px-3 border-gray-400">
            <code className="mr-8">print("Wie heißt du?")</code>
            <span className="select-none"> ------&gt; </span>
            <span className="ml-8 px-2 py-0.5 bg-cyan-200 rounded-lg rounded-bl-none">
              Wie heißt du?
            </span>
          </p>
          <p>
            👉 Nutze <strong>input()</strong>, um Text einzulesen und in einer
            Variable zu speichern:
          </p>
          <p className="border rounded py-2 px-3 border-gray-400">
            <code className="mr-24">name = input()</code>
            <span className="select-none"> &lt;------ </span>
            <span className="ml-52 px-2 py-0.5 bg-orange-200 rounded-lg rounded-br-none">
              Quinn
            </span>
          </p>
          <p>
            👉 Mit <strong>f-Strings</strong> kannst du Variablen und Text
            verbinden:
          </p>
          <p className="border rounded py-2 px-3 border-gray-400">
            <code className="mr-4">
              print(f"Hallo, {'{'}name{'}'}!")
            </code>
            <span className="select-none"> ------&gt; </span>
            <span className="ml-8 px-2 py-0.5 bg-cyan-200 rounded-lg rounded-bl-none">
              Hallo, Quinn!
            </span>
          </p>
          <p>
            👉 Nutze für Zahlen die <strong>int()</strong> Funktion:
          </p>
          <p className="border rounded py-2 px-3 border-gray-400">
            <code className="mr-2">print("Wie alt bist du?")</code>
            <span className="select-none"> ------&gt; </span>
            <span className="ml-8 px-2 py-0.5 bg-cyan-200 rounded-lg rounded-bl-none">
              Wie alt bist du?
            </span>
            <br />
            <code className="mr-12">alter = int(input())</code>
            <span className="select-none"> &lt;------ </span>
            <span className="ml-56 px-2 py-0.5 bg-orange-200 rounded-lg rounded-br-none">
              15
            </span>
          </p>
          <p>Alle weiteren Funktionen findest du im Spickzettel.</p>
        </div>
        <p className="text-center mb-5 px-4 mt-8"></p>
      </div>
    </div>
  )
}
