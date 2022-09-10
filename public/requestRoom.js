import { socket } from "./clientSocketConnection.js";
import { closeDialog } from "./dialog.js";

export let session;
export let websocket;

async function requestRoom() {
    
    session = document.getElementById("session").value;
    websocket = document.getElementById("websocket").value;

    if (localStorage.getItem("gyroAccessGranted") == "yes") {
        socket.emit("wannajoin", {session, websocket});
        sessionStorage.setItem("websocketID", websocket)
        closeDialog();
    }
    else alert("Bitte gewähre zuerst den Zugriff auf dein Gyroskop.");
}

document.getElementById("submit_button").addEventListener("click", requestRoom);