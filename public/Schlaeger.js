// TODO: Was macht diese Datei? Beschreiben…


export default class Schlaeger {

    constructor(domElement) {
        this.domElement = domElement;
        this.position;
        this.width = getComputedStyle(this.domElement).getPropertyValue("--width");
        this.height = getComputedStyle(this.domElement).getPropertyValue("--height");
        this.sensitivity = 2.2; // TODO: Könnte man je nach Level verändern.
    }

    // Getter und Setter, die die X- Koordinate des Balls aus dem CSS-Sheet holen/setzen
    get position() {
        return parseFloat(
            getComputedStyle(this.domElement).getPropertyValue("--xPosition")
        );
    }
  
    set position(value) {
        this.domElement.style.setProperty("--xPosition", value);
    }

    // Der Sensor liefert Werte von -180 bis 180°, dieser große Bewegungsradius ist für den Nutzer nicht sinnvoll.
    // Dieser wiederum muss dann für im CSS verwendete vw-Werte (also 0 bis 100) nutzbar gemacht werden.
    normalize(data) {
        let factoredData = data * this.sensitivity; // Potenziert die Eingabe -> geringere Bewegung hat einen großeren Effekt.
        let flippedData; // Berücksichtigt die Orientierung des Endgerätes, sodass der Schläger sich beim Neigen immer gleich verhält.

        if (window.orientation == 90) flippedData = factoredData; 
        else if (window.orientation == -90) flippedData = factoredData * -1;
        else alert("Bitte drehe dein Gerät um 90°. Das Spiel funktioniert nur im 'landscape'-Modus.");

        const limit = 50;
        let value = (flippedData + limit); // Verschiebung in einen Bereich von 0 bis 100.
        
        if (flippedData < (limit * -1)) value = 0;
        else if (flippedData > limit) value = 100;

        return value - (this.width * 0.5); // Positioniert wird ab der Hälfte des Schlägers in Prozent der Bildschirmweite.
    }

    // (Nur) Diese Methode sollte von Außerhalb aufgerufen werden.
    updatePosition(event) {
        this.position = this.normalize(event.beta);
    }
}
