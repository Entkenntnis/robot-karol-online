import {
  faExternalLink,
  faHeartCirclePlus,
} from '@fortawesome/free-solid-svg-icons'
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
    // Set up rotation interval - every 2 seconds
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
    }, 2000)

    // Clean up interval on component unmount
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
              'p-2 px-6 bg-white/30'
            )}
          >
            <h1 className="whitespace-nowrap text-lg md:text-2xl">
              <FaIcon icon={faHeartCirclePlus} className="text-rose-500 mr-3" />
              Robot Karol Online - Spenden
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
            Unterstütze Robot Karol Online
          </h2>

          <p className="mb-4">
            Vielen Dank für dein Interesse, Robot Karol Online zu unterstützen!
            Diese Plattform wird als freies Bildungsangebot entwickelt und steht
            allen kostenlos zur Verfügung.
          </p>

          <p className="mb-4">
            Kostenlos heißt aber nicht, dass es nichts kostet! Ich habe in den
            letzten Jahren ca. über 50.000 Euro an umgerechneter Arbeitszeit in
            dieses Projekt investiert - ehrenamtlich.
          </p>
          <p className="mb-8">
            Das ist viel Zeit und Energie. Ich freue mich über jede
            Unterstützung, die mir hilft, Robot Karol Online auch in Zukunft
            weiterzuentwickeln und zu betreiben. Du kannst das auf verschiedene
            Arten tun:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div className="p-4 bg-yellow-100/70 rounded-lg border border-yellow-200">
              <h3 className="font-bold mb-2">Einmalige Spende</h3>
              <p className="mb-4">
                Unterstütze mit einem Betrag deiner Wahl:
                <br />
                &nbsp;
              </p>
              <button
                className="px-4 py-2 bg-yellow-300 hover:bg-yellow-400 transition-colors rounded-md w-full"
                onClick={() =>
                  handleExternalLinkClick(
                    'onetime',
                    'https://www.paypal.com/donate/?hosted_button_id=HTXHJ46AF2YNA&'
                  )
                }
              >
                Jetzt spenden{' '}
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
                    'https://www.paypal.com/donate/?hosted_button_id=HTXHJ46AF2YNA&'
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
            <h3 className="font-bold mb-3">Warum spenden?</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Beitrag für eine offene Bildungslandschaft</li>
              <li>Wartung und Verbesserung der Plattform</li>
              <li>Erstellung neuer Aufgaben und Tutorials</li>
              <li>Hosting- und Serverkosten</li>
            </ul>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Robot Karol Online ist ein Bildungsprojekt, das ohne kommerzielle
            Absichten betrieben wird. Alle Spenden fließen direkt in die
            Weiterentwicklung und den Betrieb der Plattform.
          </p>

          <div className="text-center mt-8">
            <button
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
              onClick={() => navigate(core, '')}
            >
              Zurück zur Startseite
            </button>
          </div>
        </div>
      </div>
      <HFullStyles />
    </div>
  )
}
