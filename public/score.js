import { socket } from "./clientSocketConnection.js";
import { session, websocket } from "./requestRoom.js";
// import level from "./level.js";

let scoreBoard = document.getElementById("punktestand");
let ownScore = 0;
let opponentScore = 0;

socket.on("initScore", (score) => {
    scoreBoard.innerText = score;
});

socket.on("updateScore", (obj) => {
    if (obj.websocket !== websocket) {
        ownScore = obj.ownScore;
        opponentScore = obj.opponentScore;
        scoreBoard.innerText = `${ownScore} : ${opponentScore}`;
    }
    // if (ownScore == 5 || opponentScore == 5) {  // set new level parameters at specific score
    //     level();
    // }
});

export default function updateScore() {
    opponentScore += 1;

    scoreBoard.innerText = `${ownScore} : ${opponentScore}`;

    socket.emit("goal", { session, websocket, opponentScore, ownScore });
}
