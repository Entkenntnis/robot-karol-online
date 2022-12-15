import { faXmark } from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'
import { useState } from 'react'
import { impressum } from '../impressum'
import { useCore } from '../lib/state/core'
import { ExternalLink } from './ExternalLink'
import { FaIcon } from './FaIcon'
import { Ping } from './Ping'

export function Menu() {
  const core = useCore()

  const [modal, setModal] = useState<'none' | 'privacy' | 'contact'>('none')

  return (
    <div className="h-full flex flex-col">
      {renderTopbar()}
      {renderMiddle()}
      {renderFooter()}
      {modal !== 'none' && renderPrivacyModal()}
    </div>
  )

  function renderTopbar() {
    return (
      <div className="h-9 flex-grow-0 border-b flex items-center justify-between border-[blue]">
        <div className="ml-3 text-2xl">
          <img
            src="/favicon.ico"
            alt="Icon"
            className="inline-block h-6 mr-2 -mt-1"
          />
          Robot Karol <span className="italic">Web</span>
        </div>
        <div></div>
      </div>
    )
  }

  function renderMiddle() {
    let bricks: { x: number; y: number }[] = []

    return (
      <div className="flex-grow overflow-scroll">
        <div
          className="relative min-h-[600px] h-full"
          style={{ backgroundImage: 'url("/tile.png")' }}
        >
          {bricks.map(({ x, y }, i) => (
            <img
              src="/Ziegel.png"
              key={i}
              alt="Ziegel"
              className="absolute"
              style={{
                left: `${105 + x * 30 - y * 15}px`,
                top: `${43 + y * 15}px`,
                zIndex: x + 100 * y,
              }}
            ></img>
          ))}
        </div>
      </div>
    )
  }

  function renderFooter() {
    return (
      <div className="h-9 flex-grow-0 border-t flex items-center justify-between border-[blue]">
        <div className="ml-3">
          Version: Juli 2022 |{' '}
          <ExternalLink
            href="https://github.com/Entkenntnis/robot-karol-web#sprache"
            title="Sprachreferenz"
          />{' '}
          |{' '}
          <ExternalLink
            href="https://github.com/Entkenntnis/robot-karol-web#beispiele"
            title="Beispiele"
          />{' '}
          |{' '}
          <ExternalLink
            href="https://github.com/Entkenntnis/robot-karol-web"
            title="Quellcode"
          />
        </div>
        <div className="mr-3">
          <span
            className="cursor-pointer underline"
            onClick={() => {
              setModal('contact')
            }}
          >
            Kontakt / Impressum
          </span>{' '}
          |{' '}
          <span
            className="cursor-pointer underline"
            onClick={() => {
              setModal('privacy')
            }}
          >
            Datenschutzerklärung
          </span>
        </div>
      </div>
    )
  }

  function renderPrivacyModal() {
    return (
      <div
        className={clsx(
          'fixed inset-0 bg-gray-300 bg-opacity-30 flex justify-around',
          'items-center z-[9999]'
        )}
        onClick={() => setModal('none')}
      >
        <div
          onClick={(e) => {
            e.stopPropagation()
          }}
          className={clsx(
            'fixed mx-auto bg-white rounded w-[600px] z-[99999]',
            'top-[30vh]'
          )}
        >
          <h1 className="m-3 mb-6 text-xl font-bold">
            {modal == 'privacy'
              ? 'Datenschutzerklärung'
              : 'Kontakt / Impressum'}
          </h1>
          {modal == 'privacy' ? (
            <p className="m-3 mb-6">
              Diese Website wird auf einem uberspace (https://uberspace.de)
              gehostet. Bei einem Besuch kommen keine Cookies zum Einsatz. Es
              werden grundlegende Statistiken zu Aufrufen und gelösten Aufgaben
              auf dem uberspace gespeichert. Es werden keine Daten an
              Drittanbieter weitergeben. Außerdem findet die Datenverarbeitung
              vollständig in Deutschland statt.
            </p>
          ) : (
            <p className="m-3 mb-6">
              {impressum.name}
              <br />
              {impressum.address1}
              <br />
              {impressum.address2}
              <br />
              {impressum.contact}
            </p>
          )}
          <div
            className="absolute top-2 right-2 h-3 w-3 cursor-pointer"
            onClick={() => setModal('none')}
          >
            <FaIcon icon={faXmark} />
          </div>
        </div>
      </div>
    )
  }
}
