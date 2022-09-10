// Swipe

export let swipeVectorX = null;
export let swipeVectorY = null;
// import { ballInitialized } from "./Ball.js";
import { ball } from "./app.js";

export default function swipe() {
  
  const durationMin = 100; // Mindestdauer Swipe
  let spielfeld = document.getElementById("spielfeld");
  let startX;
  let startY;
  let endX;
  let endY;
  let starttime;
  let endtime;

  spielfeld.ontouchstart = (e) => { // für die Startposition gehen wir von den relativen Werten des Balls aus
   if (!ball.initialzed) {
    startX = getComputedStyle(document.getElementById("ball")).getPropertyValue("--xPosition");
    startY = getComputedStyle(document.getElementById("ball")).getPropertyValue("--yPosition");
    starttime = new Date().getTime();
  }
}

  spielfeld.ontouchend = (e) => { // Endwerte werden direkt in relative Werte umgewandelt
    const inVW = 1 / window.innerWidth * 100;
    const inVH = 1 / window.innerHeight * 100;
    if (!ball.initialized) {
    endX = e.changedTouches[0].pageX * inVW;
    endY = e.changedTouches[0].pageY * inVH;
    endtime = new Date().getTime();
    verifySwipe();
    }
  };

  function verifySwipe() {
    let duration = endtime - starttime; // Dauer der Touchgeste
    if (duration >= durationMin) { // richtige Vorzeichen bei den swipeVektoren
      swipeVectorX = (endX - startX) / startX;
      swipeVectorY = (endY - startY) / startY;
      }
  }
  
  spielfeld.ontouchmove = function (e) {
    e.preventDefault(); // Verhindert Zoom oder scrollen
  };
}

export function resetSwipeVectors(){
  swipeVectorX = null;
  swipeVectorY = null;
}