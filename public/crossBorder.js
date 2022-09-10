import { socket } from "./clientSocketConnection.js";
import { session, websocket } from "./requestRoom.js";

export function crossDaBorder(ballData) {
    socket.emit("crossBorder", { session, websocket, ballData });
    // flieg aus dem Bild und kann kein Tor mehr verusachen. Beim nächsten Mal wird ball wieder neu instantiiert, wird also angezeigt und kann unabhängig interagieren -> siehe new Ball in app.js
};