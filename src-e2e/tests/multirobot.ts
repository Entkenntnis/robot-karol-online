Feature('Multi Robot')

Scenario('multiple robots in python playground', ({ I }) => {
  I.amOnPage('/#SPIELWIESE-PYTHON')
  I.click('div .cm-activeLine')
  I.pressKey(['Control', 'a'])
  I.type(
    'a = Robot(); b = Robot(); a.schritt(2); b.schritt(3); a.linksDrehen(); b.rechtsDrehen()',
  )
  I.click('Start')
  I.waitForText('Ausführung beendet', 30)
  I.dontSee('Traceback')
  I.dontSee('kann nur einmal erzeugt werden')
})

Scenario('two robots can sense independently', ({ I }) => {
  I.amOnPage('/#SPIELWIESE-PYTHON')
  I.click('div .cm-activeLine')
  I.pressKey(['Control', 'a'])
  I.type(
    'a = Robot(); b = Robot(); print("A", a.istWand()); b.schritt(2); print("B", b.istWand())',
  )
  I.click('Start')
  I.waitForText('Ausführung beendet', 30)
  I.dontSee('Traceback')
})
