# Neue Wege

_Maria und Ellie entwickeln gemeinsam ein Programm zur Überwachung der Patroullie, Maria beschreibt die Regeln und Ellie übersetzt sie in Code._

**Ellie**: Kannst du bitte nochmal die Regeln wiederholen? Wir fragen also `temperatur` und `windstärke` ab, und dann?  
**Maria**: Die Temperatur darf nicht zu sehr sinken. Wenn die Temperatur unter -15°C fällt, müssen wir die Patroullie abbrechen. Aber auch wenn der Wind stärker ist als 40 km/h, müssen alle zurückkommen. Kriegst du das hin?  
**Ellie**: Natürlich, einfach wieder ein `or`:

```py
temperatur = int(input("Temperatur(°C): "))
windstärke = int(input("Windstärke(km/h): "))

if temperatur < -15 or windstärke > 40:
    print("Wetterwarnung, Patroullie sofort abbrechen!")
else:
    print("Alles in Ordnung")
```

**Ellie**: Und Voila. Wenn eine der Bedingungen - oder beide - erfüllt sind, dann bricht die Patroullie ab.  
**Maria**: Lass mich mal testen:

```
Temperatur(°C): -10
Windstärke(km/h): 45
Wetterwarnung, Patroullie sofort abbrechen!
```

**Ellie**: Siehst du, genauso wie du es willst.  
**Maria**: Hm, aber das reicht nicht ... kannst du bitte noch eine Bedingung einfügen? Wenn die Temperatur unter -5°C **und** die Windstärke größer als 20 km/h ist, dann ist es schon gefährlich da draußen - dann kürzen wir die Patroullie ab.  
**Ellie**: Okay, aber das ist dann hoffentlich die letzte Änderung für heute. `elif` und `and`, kein Problem:

```py
temperatur = int(input("Temperatur(°C): "))
windstärke = int(input("Windstärke(km/h): "))

if temperatur < -15 or windstärke > 40:
    print("Wetterwarnung, Patroullie sofort abbrechen!")
elif temperatur < -5 and windstärke > 20:
    print("Schlecht Wetter, Patroullie abkürzen!")
else:
    print("Alles in Ordnung")
```

**Ellie**: Zufrieden?  
**Maria**: Hm, ja ... fast. Mir ist gerade noch was eingefallen. Wir müssen noch den Nebel berücksichtigen ...  
**Ellie**: (seufzt und fährt sich durch die Haare) Nicht schon wieder, Maria. Immer wenn ich denke, es ist fertig, kommt noch etwas dazu! Fuck, scheiße - wir sitzen hier seit zwei Stunden! Kannst du dir nicht VORHER die beschissenen Regeln überlegen!?

_Maria schaut verdutzt, und als Ellie ihre Worte realisiert, läuft sie rot an. Sie steht auf und verlässt die Zentrale ohne Maria anzuschauen. Maria folgt ihr auf den Balkon, wo sie mit verschränkten Armen in die Ferne starrt._

**Maria**: (lehnt sich neben sie ans Geländer) Hey, der Code funktioniert übrigends super. Wirklich.  
**Ellie**: (leise, ohne sie anzusehen) Sorry für vorhin. Das war ... übertrieben.  
**Maria**: Es ist nicht nur der Nebel, oder? Irgendwas beschäftigt schon länger.  
**Ellie**: (zögert) Es ist nur ... ich sitze da drin und du diktierst mir Regeln. Es fühlt sich an, als wäre ich nur eine Übersetzungsmaschine. Als hätte das alles nichts mit mir zu tun. (sie macht eine kurze Pause) Ach, vergiss es. Ist kompliziert.  
**Maria**: Nein, ich glaube, ich weiß, was du meinst. Manchmal, wenn ich die Dienstpläne mache, geht es mir ähnlich. Dann vergesse ich für einen Moment, dass ich da gerade meine Freunde in die Kälte schicke. Man verliert sich in der Organisation und spürt nichts mehr dabei.

_Ellie wendet zum ersten Mal den Kopf und sieht Maria direkt an. Ihr harter Blick wird weicher._

**Ellie**: Vielleicht. Ich habe nachgedacht .. ich will etwas Eigenes anfangen. Ein Projekt.  
**Maria**: (lächelt vorsichtig) Fürs Dorf?  
**Ellie**: Nein. (schüttelt den Kopf) Nur für mich. Ich ... ich kann noch nicht darüber reden. Aber es ist wichtig für mich. Und dafür bräuchte ich den Laptop für mich alleine.  
**Maria**: Aber, Ellie .. das Programm für die Patroullie ist überlebenswichtig. Einen zweiten Laptop finden wir schon, aber wer programmiert ihn?  
**Ellie**: Ich weiß. Deshalb dachte ich ... ich kann dir zeigen, wie du selbst die Nebel-Abfrage einbaust. Es ist nicht schwer und du verstehst das sicher schnell. Dann kannst du deine Regeln so oft ändern, wie du Lust drauf hast.

_Maria blickt überrascht, Sie denkt einen Moment nach, dann hellt sich ihr Gesicht auf._

**Maria**: Haha, dann wären wir schon zu zweit?  
**Ellie**: Zwei Programmiererinnen ...  
**Maria**: ... retten die Welt!  
**Ellie**: Huray!

_Die beiden verbringen noch eine Weile auf dem Balkon und genießen die Aussicht auf die Berge, bevor sie sich wieder mit Python beschäftigen._
