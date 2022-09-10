// Für bessere Separation of Concerns und Lesbarkeit
// wird der Code für den Ball in eine Klasse ausgelagert
import updateScore from "./score.js";
import { resetSwipeVectors } from "./swipe.js";
import { makeItBall, schlaeger } from "./app.js";
import { swipeVectorX, swipeVectorY } from "./swipe.js";
import { crossDaBorder } from "./crossBorder.js";

const inVW = 1 / 100 * window.innerWidth;
const inVH = 1 / 100 * document.body.clientHeight;
export default class Ball {

  constructor(domElement, ballData) {
    this.initialized = ballData.initialized;
    this.domElement = domElement;
    this.velocity = { x: ballData.velocity.x, y: ballData.velocity.y };
    this.xPosition = ballData.x;
    this.yPosition = ballData.y;
  }

  /* Kleine Hilfsfunktion die ein Rectangle zurückgibt, dass die Maße des Balls umfasst, 
    um die Kollisionen leichter zu ermitteln */
  getBoundingBox() {
    return this.domElement.getBoundingClientRect();
  }

  // Getter und Setter, die die X- und Y- Koordinaten sowie die Maße des Balls aus dem CSS-Sheet holen/setzen
  get xPosition() {
    return parseFloat(
      getComputedStyle(this.domElement).getPropertyValue("--xPosition")
    );
  }
  set xPosition(value) {
    this.domElement.style.setProperty("--xPosition", value);
  }

  get yPosition() {
    return parseFloat(
      getComputedStyle(this.domElement).getPropertyValue("--yPosition")
    );
  }

  set yPosition(value) {
    this.domElement.style.setProperty("--yPosition", value);
  }

  get ballWidth() {
    return parseFloat(
      getComputedStyle(this.domElement).getPropertyValue("--diameter")
    )
  }

  // Hauptfunktion um die Position und ggf. Kollisionen des Balls auszuwerten
  updatePosition() {

    this.xPosition += this.velocity.x;
    this.yPosition += this.velocity.y;
    
    this.detectBorderCollision();
    if (this.detectPaddleCollision()) this.resolveCollision();

  }

  detectBorderCollision() {
    // Bounding Box des Ball Dom Elements 
    let boundingBox = this.getBoundingBox();

    if (boundingBox.bottom >= window.innerHeight) {
      this.initBallPosition();
      this.handleGoal();
    } else if (this.yPosition <= 1) {
      // for testing
      //this.velocity.y *= -1;
      let ballData = {
        x: this.xPosition,
        y: this.yPosition,
        initialized: true,
        velocity: {
          x: this.velocity.x,
          y: this.velocity.y
        }
      };
      crossDaBorder(ballData);
      this.domElement.remove();
    }
    else if (boundingBox.left <= 0 || boundingBox.right >= window.innerWidth) {
      this.velocity.x *= -1;
    }
  }

  initBallPosition() {
    this.velocity.x = swipeVectorX;
    this.velocity.y = swipeVectorY;

    this.initialized = true;
  }

  detectPaddleCollision() {
    // Alle Angaben sind relativ und werden zur Berechnung der Kollision in absolute Pixel-Werte umgerechnet.
    let ballX = this.xPosition * inVW;
    let ballY = this.yPosition * inVH;
    let ballR = this.ballWidth * inVW;
    let schlaegerX = schlaeger.position * inVW;
    let schlaegerY = window.innerHeight - schlaeger.height * inVH;
    let schlaegerW = 0.75 * schlaeger.width * inVW;
    let testX = ballX;

    if (ballX <= schlaegerX) testX = schlaegerX;
    else if (ballX > schlaegerX + schlaegerW) testX = schlaegerX + schlaegerW;

    const circleDistanceX = ballX - testX;
    const circleDistanceY = ballY - schlaegerY;
    const distance = Math.sqrt((circleDistanceX * circleDistanceX) + (circleDistanceY * circleDistanceY))
    return distance <= ballR;
  }

  resolveCollision() {
    // Alle Angaben sind relativ und werden zur Berechnung der Kollision in absolute Pixel-Werte umgerechnet.
    let ballX = this.xPosition * inVW;
    let ballY = this.yPosition * inVH;
    let ballR = this.ballWidth * inVW;
    let schlaegerX = schlaeger.position * inVW;
    let schlaegerY = window.innerHeight - schlaeger.height * inVH;
    // Schläger Geschwindigkeit wird von Ball Geschwindigkeit komponentenweise subtrahiert => Richtung des Kollisionsvektors
    let collisionVector = { x: ballX, y: ballY + ballR };
    // Distanz des Kollisionsvektors errechnet durch Betragsformel für Vektoren
    let collisionDistance = Math.sqrt((schlaegerX - ballX) * (schlaegerX - ballX) + (schlaegerY - ballY) * (schlaegerY - ballY))
    // Kollisionsvektor wird normalisiert um im nächsten Schritt geeignete Werte 
    const collisionNormal = { x: collisionVector.x / collisionDistance, y: collisionVector.y / collisionDistance }

    this.velocity.x -= collisionNormal.x;
    this.velocity.y -= collisionNormal.y;
  }

  handleGoal() {
    let torlinie = document.getElementById("torlinie");
    torlinie.style.setProperty("display", "block");
    setTimeout(() => { torlinie.style.setProperty("display", "none") }, 100);
    updateScore();
    resetSwipeVectors();
    this.domElement.remove();
    makeItBall();
  }
}
