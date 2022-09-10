// Diese Datei kümmert sich um alles, was über das (HTML) diolog-Elements zur Verfügung gestellt wird.
// Dieses Element muss jedem Spieler zu Beginn angezeit werden, soll im späteren Verlauf aber nicht mehr stören.
// Ein wichtiger Bestandteil ist der Zugang zum Gyroskop-Sensor des Endgerätes.

export const dialog = document.getElementById("welcomeDialog");
const requestBtn = document.getElementById("requestPermission");
let isIOS;
let isMobile;

window.addEventListener("load", handleDialog());
requestBtn.addEventListener("click", getGyroPermission);

// Prüft den Zugriff auf Gerätesensoren und fragt ggf. eine Berechtigung an. Der Nutzer wird über alle Schritte informiert.
function getGyroPermission() {
  if (typeof (DeviceMotionEvent) !== "undefined" && typeof (DeviceMotionEvent.requestPermission) === "function") {
    let informUser = confirm("Beachte: Deine Wahl wird vom Betriebssystem gespeichert und lässt sich nur ein mal treffen.");
    if (informUser) {
      DeviceMotionEvent.requestPermission()
        .then(response => {
          if (response == "granted") {
            localStorage.setItem("gyroAccessGranted", "yes");
            window.location.reload();
          }
          else messageUnplayable("Lösche deine Browserdaten, um die Entscheidung zu revidieren.");
        })
        .catch(console.error)
    } else messageUnplayable();
  } else {
    alert("Diese Funktion wird von deinem Gerät nicht unterstützt.");
  }
}

// Stellt sicher, dass der Nutzer den Dialog nur sieht, wenn es notwendig ist.
export function handleDialog() {
  isMobile = (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent));

  isIOS = (/iPad|iPhone|iPod/.test(navigator.platform) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) &&
    !window.MSStream;

  if (localStorage.getItem("gyroAccessGranted") != "yes" ||
    !isIOS ||
    sessionStorage.getItem("websocketID") == null) {
    dialog.show();
    if (!isIOS) localStorage.setItem("gyroAccessGranted", "yes");
  }

  // Kümmert sich um eine nachvollziehbare Reihenfolge von Input-Aufforderungen.
  if (isMobile && (localStorage.getItem("gyroAccessGranted") === "yes" || !isIOS)) document.getElementById("connectToServer").setAttribute("style", "display: block;")
  else document.getElementById("requestPermission").setAttribute("style", "display: block;")
}

// Schließt den Dialog nur, wenn alle Voraussetzungen zum Spielen erfüllt sind.
export function closeDialog() {
  if (localStorage.getItem("gyroAccessGranted") == "yes" && sessionStorage.getItem("websocketID") != null) dialog.close();
  else messageUnplayable();
}

// Überladene Funktion zur Benachrichtung des Nutzers.
function messageUnplayable(additionalMessage) {
  if (arguments.length == 0) alert("Dieses Spiel nutzt den Gyroskop-Sensor. Ohne Zustimmung kannst Du leider nicht spielen.");
  else {
    let appendix = additionalMessage;
    alert(`Dieses Spiel nutzt den Gyroskop-Sensor. Ohne Zustimmung kannst Du leider nicht spielen. ${appendix}`);
  }
}