# Maria

_Ein paar Tage später, nach dem Ende der Dorfversammlung._

**Maria**: Na, du fleißige Biene? Schon die Welt gerettet? (sie lehnt sich grinsend über Ellies Schulter)  
**Ellie**: (starrt weiter auf ihren Bildschirm) Sehr witzig.  
**Maria**: Uff, das Gesicht kenne ich. Das ist der 'Ich-werfe-diesen-Computer-gleich-aus-dem-Fenster'-Blick. Komm, ich geb dir einen aus. Limo wie immer?  
**Ellie**: (seufzt, aber ein kleines Lächeln huscht über ihr Gesicht) Ja, bitte.

_Maria holt sich einen Kaffee und Ellie eine Limonade, sie setzt sich zu Ellie an den Tisch._

**Maria**: Also, sprich mit mir. Nach deiner großen Ankündigung letztens dachte ich, du wärst nicht mehr zu bremsen.  
**Ellie**: Welche Ankündigung? Die, bei der ich großspurig meinte, ich würde die Probleme des Dorfes mit Code lösen? Ich komme voran, aber es ist so ... langsam. Ich lerne lauter kleine, nutzlose Tricks, aber ich habe keine Ahnung, wie daraus jemals was Nützliches werden soll.  
**Maria**: Nichts ist am Anfang nützlich. Zeig mal her, was ist denn der neuste nutzlose Trick?  
**Ellie**: (dreht den Laptop leicht zu Maria) Schleifen. Damit kann man dem Ding sagen, dass es etwas immer und immer wieder tun soll:

```py
for i in range(100):
    print("Buh!")
```

Siehst du? Hundermal "Buh!". Als ob das irgendwem im Lager helfen würde (sie rollt die Augen).  
**Maria**: Okay, verstehe. Und könntest du ihm auch sagen, er soll es nur fünfmal machen, wenn ich das will?  
**Ellie**: Ja klar. Dafür gibt's diesen `input()`-Befehl. Aber das ist auch wieder so eine Sache ... du gibst eine Zahl ein und das ganze Ding stürzt ab, nur weil man diesen dämlichen `int()`-Befehle drumherum packen muss. Ich habe Stunden gebraucht, um das zu kapieren!

```py
n = int(input())
for i in range(n):
    print("Ha!")
```

**Maria**: Und ist es Absicht, dass dieses `print()` da so eingerückt ist?  
**Ellie**: Oh ja, das auch! Das hat auch ewig gedauert. Alle Befehle, die wiederholt werden sollen, müssen eingerückt sein. Dafür gibt es die Tab-Taste. Der Computer ist total stur. Wenn du es vergisst, funktioniert einfach gar nichts mehr.  
**Maria**: Weißt du was? Du findest das vielleicht nutzlos, aber für mich klingt das schon ziemlich mächtig. Du sagst einer Maschine, was sie tun soll, wie oft sie es tun soll und welche Befehle dazugehören.  
**Ellie**: Es fühlt sich aber nicht mächtig an.  
**Maria**: Kopf hoch. Du lernst gerade das Fundament. Gib nicht auf, du bist näher dran, als du denkst!
