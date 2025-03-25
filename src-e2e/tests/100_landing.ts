Feature('Landing')

Scenario('Is page loading?', ({ I }) => {
  I.amOnPage('/')
  I.see('Robot Karol Online')
  I.wait(5)
})
