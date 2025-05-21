Feature('Main')

Scenario('Is landing page loading?', ({ I }) => {
  I.amOnPage('/')
  I.see('Robot Karol Online')
  I.seeTitleEquals('Robot Karol Online')
})

Scenario("Let's solve the first quests", ({ I }) => {
  I.amOnPage('/')
  I.click('Start')
  I.type('anna')
  I.type(['Enter'])
  I.seeTitleEquals('Start | Robot Karol Online')
  I.forceClick('#toggleSwitch')
  I.wait(1)
  I.type('Schritt Schritt Hinlegen')
  I.forceClick('#toggleSwitch')
  I.wait(1)
  I.forceClick('#toggleSwitch')
  I.see('Schritt')
  I.see('Hinlegen')
  I.click('Start')
  I.waitForText('weiter', 10)
  I.click('weiter')
  I.see('Verschieben')
  I.see('Um die Ecke')
  I.see('Umweltschutz')

  I.click('Umweltschutz')
  I.wait(1)
  I.click('div .fixed')
  I.click('div .cm-activeLine')
  I.type('Aufheben Schritt(2) Aufheben')
  I.click('Start')
  I.waitForText('weiter', 10)
  I.click('weiter')

  I.click('Um die Ecke')
  I.wait(1)
  I.click('div .fixed')
  I.click('div .cm-activeLine')
  I.type('Schritt(2) LinksDrehen Schritt Hinlegen')
  I.click('Start')
  I.waitForText('weiter', 10)
  I.click('weiter')

  I.click('Verschieben')
  I.wait(1)
  I.click('div .fixed')
  I.click('div .cm-activeLine')
  I.type('RechtsDrehen Aufheben LinksDrehen Schritt(3) Hinlegen')
  I.click('Start')
  I.waitForText('weiter', 10)
  I.click('weiter')

  I.wait(1)

  I.click('Fortschritt speichern')
  //I.click('OK')
  I.refreshPage()
  I.dontSee('Fortschritt speichern')
  I.see('Spiegelei')

  I.click('Treppe')
  I.wait(1)
  I.click('div .fixed')
  I.click('div .cm-activeLine')
  I.type('Hinlegen Schritt Hinlegen(2) Schritt Hinlegen(3)')
  I.click('Start')
  I.waitForText('weiter', 10)
  I.click('weiter')

  I.click('Spiegelei')
  I.wait(1)
  I.click('div .fixed')
  I.click('div .cm-activeLine')
  I.type('Schritt RechtsDrehen Schritt MarkeSetzen')
  I.click('Start')
  I.waitForText('weiter', 10)
  I.click('weiter')

  I.click('Parkour')
  I.wait(1)
  I.click('div .fixed')
  I.click('div .cm-activeLine')
  I.type('wiederhole 3 mal Hinlegen Schritt endewiederhole')
  I.click('Start')
  I.waitForText('weiter', 10)
  I.click('weiter')

  I.see('Tellerrand')
})

Scenario('See if playground works fine', ({ I }) => {
  I.amOnPage('/')
  I.click('Spielwiese')
  I.seeTitleEquals('Spielwiese | Robot Karol Online')
  // browser back button
  I.usePlaywrightTo('go back', async ({ page }) => {
    await page.goBack()
  })
  I.seeTitleEquals('Robot Karol Online')

  I.click('Spielwiese')
  I.seeTitleEquals('Spielwiese | Robot Karol Online')
  I.click({ css: '#ide-back-button' })
  I.seeTitleEquals('Robot Karol Online')

  I.click('Spielwiese')
  I.see('Programmiere frei und baue dein Herzensprojekt.')

  I.click({ css: '#select-language' })
  I.click({ css: '#select-language-python-pro' })
  I.dontSee('Hauptprogramm')
  I.see('Spickzettel')
  I.click('Start')
  I.click('Blöcke')
  I.see('Hauptprogramm')
  I.dontSee('Spickzettel')
})

Scenario('Test special case of empty world in learning path', ({ I }) => {
  I.amOnPage('/#QUEST-55')
  I.wait(0.2)
  I.click('div .fixed')
  I.click({ css: '#select-language' })
  I.click({ css: '#select-language-robot-karol' })
  I.type('Hinlegen')
  I.click('Start')
  I.wait(2)
  I.waitForText('Auftrag nicht erfüllt', 10)
  I.click('div .cm-activeLine')
  I.pressKey(['Control', 'a'])
  I.type('wenn NichtIstZiegel dann Hinlegen endewenn')
  I.click('Start')
  I.waitForText('weiter', 60)
})

Scenario('Test special case of empty world in standalone quest', ({ I }) => {
  I.amOnPage('/#NG2X')
  I.waitForText('Start', 5)
  I.click({ css: '#select-language' })
  I.click({ css: '#select-language-robot-karol' })
  I.type('Hinlegen')
  I.click('Start')
  I.wait(2)
  I.waitForText('Auftrag nicht erfüllt', 10)
  I.click('div .cm-activeLine')
  I.pressKey(['Control', 'a'])
  I.type('wenn NichtIstZiegel dann Hinlegen endewenn')
  I.click('Start')
  I.waitForText('Yay!', 20)
})

Scenario('Playground should not test for success', ({ I }) => {
  I.amOnPage('/#SPIELWIESE-CODE')
  I.click('div .cm-activeLine')
  I.type('Hinlegen')
  I.click('Start')
  I.wait(2)
  I.waitForText('Ausführung beendet', 10)
})

Scenario('Empty world should not continue testing', ({ I }) => {
  I.amOnPage('/#BB82')
  I.waitForText('Start', 5)
  I.click({ css: '#select-language' })
  I.click({ css: '#select-language-robot-karol' })
  I.type('Hinlegen')
  I.click({ css: 'h2.font-bold' })
  I.click('Start')
  I.wait(2)
  I.see('Ausführung beendet')
})

Scenario('Bug with profile and langauge switch', ({ I }) => {
  I.amOnPage('/')
  I.click({ css: '#overview-self-learning-path' })
  I.click('Profil')
  I.click('Fortschritt dauerhaft auf diesem Gerät speichern')
  I.click('Fortschritt dauerhaft auf diesem Gerät speichern')
  I.click('Schließen')
  I.dontSee('Playground')
  I.see('Spielwiese')
})

Scenario('Changing speed is breaking debugger', ({ I }) => {
  I.amOnPage(
    '/#SPIELWIESE:%2F%2F Spielwiese%3A 15%2C 10%2C 6%0A%0Awiederhole immer%20%0A%20 LinksDrehen%0Aendewiederhole'
  )
  I.click('Start')
  I.see('Stopp')
  I.click({ css: '#ide-toggle-debugger' })
  I.see('Einzelschritt')
  I.dragSlider('#ide-speed-slider', 0)
  I.wait(0.2)
  I.see('Einzelschritt')
})

Scenario('Correctly convert code to python', ({ I }) => {
  I.amOnPage(
    '/#SPIELWIESE-CODE:%2F%2F Spielwiese%3A 15%2C 10%2C 6%0A%0ATueEtwas%0A%0AAnweisung TueEtwas%0A%20 Schritt%0AendeAnweisung'
  )

  I.click({ css: '#select-language' })
  I.click({ css: '#select-language-python-pro' })

  I.click('Start')
  I.waitForText('Ausführung beendet', 10)
  I.dontSee('Traceback')
})

Scenario('Test python quest', ({ I }) => {
  I.amOnPage('/#QUEST-61')
  I.wait(1)
  I.click('div .fixed')
  I.click('div .cm-activeLine')
  I.pressKey(['Control', 'a'])
  I.type('print("Hallo, Python!")')
  I.click('Start')
  I.click("Ja, los geht's!")
  I.waitForText('Perfekt gemacht', 3)
  I.click('Ja, hab ich gesehen')
  I.click('weiter')
  I.see('0. Einleitung')
})

Scenario('Toggles in output', ({ I }) => {
  I.amOnPage('/#VPY8')
  I.click({ css: 'canvas.object-contain' })
  I.see('Auftragsvorschau')
  I.amOnPage('#QUEST-27')
  I.click({ css: 'canvas.object-contain' })
  I.see('2D-Ansicht')
  I.dontSee('Auftragsvorschau')
})

Scenario('Dangling keywords should not break compiler', ({ I }) => {
  I.amOnPage(
    '#SPIELWIESE-CODE:%2F%2F%20Spielwiese%3A%2015%2C%2010%2C%206%0A%0A*Anweisung'
  )
  I.dontSee('internal error')
  I.see('Start')
  I.amOnPage(
    '#SPIELWIESE-CODE:%2F%2F%20Spielwiese%3A%2015%2C%2010%2C%206%0A%0Aendewiederhole'
  )
  I.dontSee('internal error')
  I.see('Start')
  I.amOnPage(
    '#SPIELWIESE-CODE:%2F%2F%20Spielwiese%3A%2015%2C%2010%2C%206%0A%0Amal'
  )
  I.dontSee('internal error')
  I.see('Start')
})

Scenario('Legacy links should work', ({ I }) => {
  I.amOnPage('/?id=lwl8yufk4')
  I.dontSee('internal error')
  I.see('Start')
})

Scenario("Don't use testing mode for single tasks", ({ I }) => {
  I.amOnPage('/#QUEST-23')
  I.click('div .fixed')
  I.click('Start')
  I.see('2D-Ansicht')
})
