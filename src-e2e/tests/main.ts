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
  I.click('OK')
  I.refreshPage()
  I.dontSee('Fortschritt speichern')
  I.see('Spiegelei')
})

Scenario('See if playground works fine', ({ I }) => {
  I.amOnPage('/')
  I.click('Spielwiese')
  I.seeTitleEquals('Spielwiese')
  // browser back button
  I.usePlaywrightTo('go back', async ({ page }) => {
    await page.goBack()
  })
  I.seeTitleEquals('Robot Karol Online')

  I.click('Spielwiese')
  I.seeTitleEquals('Spielwiese')
  I.click('zurück zu Robot Karol Online')
  I.seeTitleEquals('Robot Karol Online')

  I.click('Spielwiese')
  I.see('Programmiere frei und baue dein Herzensprojekt.')

  // HOW TO DO THAT?
  /*I.selectOption('select.rounded-lg', 'python-pro')
  I.waitForText('Spickzettel')
  I.wait(10)
  I.click('Start')

  I.wait(10)*/
})
