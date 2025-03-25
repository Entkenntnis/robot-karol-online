Feature('Landing')

Scenario('Is page loading?', ({ I }) => {
  I.amOnPage('/')
  I.see('Robot Karol Online')
})

Scenario('Learning path Start', ({ I }) => {
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
})

Scenario('Learning path Continue', ({ I }) => {
  I.amOnPage('/')
  I.see('Verschieben')
  I.see('Um die Ecke')
})
