// TODO: Was tut diese Datei? Beschreiben…

/** Weitere Ideen zum Einbinden:
 * DOM-Events:
 *  offline: mindestens den Nutzer benachrichtigen und ggf. einen Dialog zum Wiederverbinden bauen (zurückkehren zur offenen Sitzung ermöglichen?)
 *  message: wichtig zur Kommunikation mit dem Server
 *  devicemotion: spannend? -> accelaration, rotationRate, etc.
 */

import Ball from "./Ball.js";
import Schlaeger from "./Schlaeger.js";
import swipe from "./swipe.js";
import { swipeVectorX, swipeVectorY } from "./swipe.js";
import { socket } from "./clientSocketConnection.js";
import { dialog } from "./dialog.js";
export let ball = null;
export const schlaeger = new Schlaeger(document.getElementById("schlaeger"));

window.addEventListener("load", checkCompatibility);

// Prüft zu Beginn die Startbedingungnen
function checkCompatibility() {
  
  checkDeviceOrientation();
  
  // TODO: npm install sweetalert and change from console.log
  if (!window.DeviceOrientationEvent) console.log("DeviceOrientation wird nicht unterstützt");
  if (!window.Touch) console.log("Touch wird nicht unterstützt");
  
  // If a reaload happens, you dont have to leaf the session anymore.
  if (sessionStorage.getItem("websocketID") != null) dialog.show(); // TODO: set cookie and compare, better: Save everything per session
}

function checkDeviceOrientation() {
  const isLandscape = window.innerWidth > window.innerHeight;
  if (!isLandscape) console.log("Dieses Spiel funktioniert nur im Querformat.");
}

// TODO: beschreiben…
swipe();


let stop = false;
let fpsInterval, startTime, now, then, elapsed;
let fps = 60;

function startAnimating(fps) {
  fpsInterval = 1000 / fps;
  then = window.performance.now();
  startTime = then;
  updateGame();
}


function updateGame(newtime) {

  if (stop) {
    return;
  }

  requestAnimationFrame(updateGame);

  // calc elapsed time since last loop

  now = newtime;
  elapsed = now - then;

  // if enough time has elapsed, draw the next frame

  if (elapsed > fpsInterval) {

    // Get ready for next frame by setting then=now, but...
    // Also, adjust for fpsInterval not being multiple of 16.67
    then = now - (elapsed % fpsInterval);

    if (ball !== null) {
      requestAnimationFrame(updateGame);
      if (swipeVectorX != null && swipeVectorY != null && !ball.initialized) {
        ball.initBallPosition();
      }
      if (ball.initialized) { // Sobald Koordinaten durch swipe.js gesetzt, startet der Ball seine Bewegung.
        ball.detectPaddleCollision();
        ball.updatePosition();
      }
    }
  }
}

function handleGyroInput(event) {
  schlaeger.updatePosition(event);
}

// Spiel startet erst nachdem alle Voraussetzungen erfüllt sind.
if (localStorage.getItem("gyroAccessGranted") == "yes") {
  window.addEventListener("deviceorientation", handleGyroInput);
}

export function makeItBall() {
  let ballDOM = document.getElementById('ballNest').appendChild(document.createElement('div'));
  ballDOM.setAttribute("id", "ball");
  ballDOM.setAttribute("style", "--xPosition: 50; --yPosition: 30;");
  let ballData = {
    x: 50, // TODO: later -> query selector
    y: 30,
    initialized: false,
    velocity: {
      x: null,
      y: null
    }
  };
  ball = new Ball(ballDOM, ballData);
  startAnimating(fps);
}

socket.on("crossingBorder", (ballData) => {
  let ballDOM = document.getElementById('ballNest').appendChild(document.createElement('div'));
  ballDOM.setAttribute("id", "ball");
  ball = new Ball(ballDOM, ballData);
  ball.velocity.x *= -1;
  ball.velocity.y *= -1;
  ball.xPosition = 100 - ballData.x + 2 * 5; // TODO: 5 entspricht --diameter von ballDOM, later -> query selector 
  startAnimating(fps);
});

socket.on("whoami", (player) => {
  if (player == "playerOne") {
    makeItBall();
  }
  else if (player == "playerTwo") {
    console.log("you don't get no ball")
  }
});
