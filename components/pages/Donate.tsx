import { faExternalLink } from '@fortawesome/free-solid-svg-icons'
import { useCore } from '../../lib/state/core'
import { FaIcon } from '../helper/FaIcon'
import { HFullStyles } from '../helper/HFullStyles'
import { submitAnalyzeEvent } from '../../lib/commands/analyze'
import { navigate } from '../../lib/commands/router'
import clsx from 'clsx'
import { View } from '../helper/View'
import { useState, useEffect } from 'react'

export function Donate() {
  const core = useCore()
  const [robotDirection, setRobotDirection] = useState<
    'east' | 'south' | 'west' | 'north'
  >('east')

  useEffect(() => {
    const rotationInterval = setInterval(() => {
      setRobotDirection((prevDir) => {
        switch (prevDir) {
          case 'east':
            return 'south'
          case 'south':
            return 'west'
          case 'west':
            return 'north'
          case 'north':
            return 'east'
          default:
            return 'east'
        }
      })
    }, 1000)

    return () => clearInterval(rotationInterval)
  }, [])

  const handleExternalLinkClick = (linkName: string, url: string) => {
    submitAnalyzeEvent(core, `ev_click_donate_${linkName}`)
    window.open(url, '_blank')
  }

  return (
    <div className="background-element min-h-full">
      <div className="flex flex-col relative min-h-full min-w-fit pb-24">
        <div className="flex justify-center">
          <div
            className={clsx(
              'flex mt-8 items-center rounded-xl',
              'p-2 px-6 bg-white/30',
            )}
          >
            <h1 className="whitespace-nowrap text-lg md:text-2xl">
              ❤️ Robot Karol Online ❤️
            </h1>
          </div>
        </div>

        <div className="max-w-3xl mx-auto mt-12 p-6 bg-white/50 rounded-lg shadow-md">
          <View
            robotImageDataUrl={core.ws.robotImageDataUrl}
            world={{
              dimX: 1,
              dimY: 1,
              karol: [
                {
                  x: 0,
                  y: 0,
                  dir: robotDirection,
                },
              ],
              blocks: [[false]],
              marks: [[false]],
              bricks: [[0]],
              height: 1,
            }}
            hideWorld
            className="pl-2 pb-3"
          />
          <h2 className="text-xl font-bold mb-6">
            Hallo liebe Coding-Community! 🤖
          </h2>

          <p className="mb-4">
            Robot Karol Online war von Anfang an ein Herzensprojekt - entwickelt
            mit Leidenschaft für alle, die spielerisch Programmieren lernen
            wollen. Siehst du, wie Karol fröhlich im Kreis tanzt? Genau diese
            Freude möchte ich mit dir teilen!
          </p>

          <p className="mb-4">
            Über 1.000 Stunden Herzblut stecken in diesem Projekt. Jedes
            Lächeln, wenn ein Konzept &quot;klick&quot; macht, jede gelöste
            Aufgabe, jede begeisterte Rückmeldung - das ist für mich
            unbezahlbar.
          </p>

          <p className="mb-8">
            <span className="bg-yellow-100 px-1 py-1 rounded">
              Wenn dir Karol etwas bedeutet
            </span>
            , freue ich mich riesig, wenn du ...
            <ul className="list-disc pl-5 mt-2">
              <li>... weiter mit Karol arbeitest,</li>
              <li>... das Projekt weiterempfiehlst,</li>
              <li>... dich mit einer Spende bedankst 💝</li>
              <li>... alle drei Dinge tust 😍</li>
            </ul>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div className="p-4 bg-yellow-100/70 rounded-lg border border-yellow-200">
              <h3 className="font-bold mb-2">🍀 Einmalige Wertschätzung</h3>
              <p className="mb-4">
                &quot;Danke für deine Arbeit!&quot; sagen mit...
                <br />
                <span className="text-2xl">🎁 5€</span>,
                <span className="text-2xl mx-2">💐 10€</span> oder
                <span className="text-2xl ml-2">🌻 20€</span>
              </p>
              <button
                className="px-4 py-2 bg-yellow-300 hover:bg-yellow-400 transition-colors rounded-md w-full"
                onClick={() =>
                  handleExternalLinkClick(
                    'onetime',
                    'https://www.paypal.com/donate/?hosted_button_id=HTXHJ46AF2YNA&',
                  )
                }
              >
                Dankeschön senden{' '}
                <FaIcon icon={faExternalLink} className="text-xs ml-1" />
              </button>
            </div>

            <div className="p-4 bg-blue-100/70 rounded-lg border border-blue-200">
              <h3 className="font-bold mb-2">Regelmäßige Unterstützung</h3>
              <p className="mb-4">
                Werde eine dauerhafte UnterstützerIn mit einem monatlichen
                Beitrag:
              </p>
              <button
                className="px-4 py-2 bg-blue-300 hover:bg-blue-400 transition-colors rounded-md w-full"
                onClick={() =>
                  handleExternalLinkClick(
                    'monthly',
                    'https://www.paypal.com/donate/?hosted_button_id=HTXHJ46AF2YNA&',
                  )
                }
              >
                UnterstützerIn werden*{' '}
                <FaIcon icon={faExternalLink} className="text-xs ml-1" />
              </button>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-8 text-right">
            * wähle eine monatliche oder jährliche Spende
          </p>

          <div className="p-4 bg-green-100/70 rounded-lg border border-green-200 mb-8">
            <h3 className="font-bold mb-3">Was bewirkst du? 🌈</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Hältst Karols Räder am Laufen (Serverkosten)</li>
              <li>Machst neue Unterrichtsideen möglich</li>
              <li>Zeigst: &quot;Diese Arbeit ist wertvoll!&quot;</li>
              <li>Ermöglichst mir, Zeit in Updates zu investieren</li>
            </ul>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            P.S.: Kein Druck! Karol bleibt immer kostenlos. Aber wenn du kannst:
            Jeder Beitrag hilft, diese Liebeserklärung an den
            Programmiernachwuchs lebendig zu halten. 💌
          </p>

          <div className="text-center mt-8 space-y-4">
            <div className="text-center mt-8">
              <button
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                onClick={() => navigate(core, '')}
              >
                Zurück zur Startseite
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Mit herzlichem Dank und einem virtuellen High-Five 👋
              <br />
              Deine Karol-Entwicklerin
            </p>
          </div>
        </div>
      </div>
      <HFullStyles />
    </div>
  )
}
