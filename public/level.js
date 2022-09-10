import { socket } from "./clientSocketConnection.js";
import { session } from "./requestRoom.js";
let schlaegerWidth = getComputedStyle(document.getElementById("schlaeger")).getPropertyValue("--width");

export default function level() {
  let backgroundR = Math.random() * (255 - 1) + 1; // create new random backgroundcolor
  let backgroundG = Math.random() * (255 - 1) + 1;
  let backgroundB = Math.random() * (255 - 1) + 1;
  let rgb = "rgb(" + backgroundR + "," + backgroundG + "," + backgroundB + ")";
  document.getElementById("spielfeld").style.backgroundColor = rgb; // set new backgroundcolor

  schlaegerWidth -= 5;
  schlaeger.style.setProperty("--width", schlaegerWidth); //set new schlaegerWidth
  console.log(schlaegerWidth);

  socket.emit("levelUp", { session, schlaegerWidth });
  socket.emit("changeColor", { session, rgb });
}

socket.on("setLevelColor", (rgb) => {
    document.getElementById("spielfeld").style.backgroundColor = rgb;
})
socket.on("setLevel", (schlaegerWidth) => {
    schlaeger.style.setProperty('--width', schlaegerWidth);
})