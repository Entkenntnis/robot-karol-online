# Dart

_Abends in der Bar. Es ist der einzige Ort im Dorf, an dem nach Einbruch der Dunkelheit noch ein Generator für Strom sorgt. Ellie sitzt in einer Ecke an ihrem Laptop, die kleine Karol-Figur baumelt am Netzkabel. Tommy und seine Freunde spielen lautstark Dart. Zwischen zwei Runden setzt sich Tommy zu Ellie._

**Tommy**: Na Ellie, so spät noch am Lernen?  
**Ellie**: (blickt müde auf) Ich wäre gern schon fertig, aber die Sonderschicht wegen der Infizierten hat meinen Zeitplan durcheinandergebracht. Danke nochmal, dass ihr auf uns gewartet habt.  
**Tommy**: Kein Ding, Jackson bleibt standhaft. Wir passen aufeinander auf. (er nickt Richtung Laptop) Apropos, Maria meinte, du bringst der Kiste da Rechnen bei.  
**Ellie**: Sozusagen. Ist aber langweiliger, als es klingt.  
**Tommy**: Langweilig? Ich könnte gerade jemanden gebrauchen, der für uns rechnet. Jim vergisst nach zwei Bier immer die Hälfte der Punkte ...

_Ellie zuckt mit den Schultern, aber in ihrem Kopf beginnt es zu ratten. Beim Dart fängt man mit 501 Punkten an. Ein fester Startwert. Eine Variable, Punkte abziehen. Eine Subtraktion. Immer und immer wieder ... wie die Schleife, die sie Maria gezeigt hat. Ein Gedanke formt sich._

**Ellie**: Warte mal ... wie viele Würfe braucht ihr so für ein Spiel?  
**Tommy**: Puh, wenn wir gut sind, vielleicht zwanzig. Wenn wir schlecht sind ... oder viel getrunken haben ... auch mal dreißig oder vierzig.  
**Ellie**: Okay ... okay, ich glaube, ich hab was. (sie beugt sich über die Tastatur und fängt an zu tippen, dabei murmelt sie zu sich) Also, zuerst der Startwert:

```py
punktzahl = 501
print("Neues Spiel! Start bei 501 Punkten.")
```

Und dann wiederholen wir das Abziehen einfach ... sagen wir, 50 Mal. Das sollte reichen. Das ist diese `for`-Schleife:

```py
for i in range(50):
    wurf = int(input())
    punktzahl = punktzahl - wurf

    print("Neue Punktzahl:")
    print(punktzahl)
```

Das Programm fragt jetzt immer wieder nach einem Wurf und zieht die Punkte ab. Es merkt sich den aktuellen Stand in der `punktzahl`-Variable. Das ist ... das ist nicht mehr ein dämlicher Trick. Das ist ein Punktezähler! Schau her Tommy, ich habe einen Punktezähler gebaut!  
**Tommy**: (blinzelt, dann bricht ein Lächeln auf seinem Gesicht durch) Wow. Okay, Kiddo. Endlich ein Punktezähler, der mal nicht betrunken oder müde ist.  
**Jim**: Hey Tommy, ich kann euch beide hören!  
**Ellie**: (lehnt sich stolz zurück) Komm, lass mich mal eine Runde mitspielen. Ich will sehen, ob mein Programm funktioniert.
