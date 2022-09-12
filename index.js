import express from "express";
import * as http from "http";
import { Server } from "socket.io";
import { localIO, localApp, httpsServer } from "./local-development/localServer.js";

let environment = process.env.NODE_ENV || 'development';
let io = null;
let app = null;
let port = parseInt(process.env.PORT) || 8080;

if (environment === 'development') {
  io = localIO;
  app = localApp;
  httpsServer.listen(port, () => {
    console.log(`Running locally on PORT: ${port}`);
  });
} else {
  app = express();
  const httpServer = http.createServer(app);
  io = new Server(httpServer);
  httpServer.listen(port, () => {
    console.log(`Running in deployment on PORT: ${port}`);
  });
}

const rooms = [{
  roomId: null,
  playerOne: null,
  playerTwo: null
}];

//Express middleware to serve static files and parse HTTP requests
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
//Express route where index.html is served
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
})

/*
checkRoom() checks if a game room exists and assigns players ID to the correct room and slot.
If the provided room ID doesn't exist, new room is created and playerId is pushed to it's first slot.
Otherwise, playerId is pushed to second slot or player receives messages that the requested room is already full.
*/

function checkRoom(socketId, newRoomId) {
  const room = rooms.find(({ roomId }) => roomId == newRoomId);

  if (!room) {
    const room = {
      roomId: newRoomId,
      playerOne: socketId,
      playerTwo: null
    };
    rooms.push(room);
    console.log("A new room was created, PlayerOne joined.");
    console.log(rooms);
    return true;

  } else if (room.playerOne != null && room.playerOne != socketId && room.playerTwo == null) {
    room.playerTwo = socketId;
    console.log("PlayerTwo joined an existing room.");
    console.log(rooms);
    return true;

  } else {
    console.log("Requested room not available.");
    console.log(rooms);
    return false;
  }
}

//WebSocket communication realized through socket.io library
io.on("connection", (socket) => {

  // initializes the score for all clients
  socket.emit("initScore", "0 : 0");

  // synchs the score after a goal
  socket.on("goal", (obj) => {
    let websocket = obj.websocket;
    let ownScore = obj.opponentScore;
    let opponentScore = obj.ownScore;
    let info = { websocket, ownScore, opponentScore }
    io.to(obj.session).emit("updateScore", info);
  });

  // // initializes schlaegerWidth for all clients
  // socket.emit("setLevel", 20);

  // // synchs schlaegerWidth after a goal
  // socket.on("levelUp", (obj) => {
  //   io.to(obj.session).emit("setLevel", obj.schlaegerWidth);
  // });

  // // initializes backgroundcolor for all clients
  // socket.emit("setLevelColor", "rgb(" + 0 + "," + 0 + "," + 0 + ")");

  // // synchs backgroundcolor after a goal
  // socket.on("changeColor", (obj) => {
  //   io.to(obj.session).emit("setLevelColor", obj.rgb);
  // });

  // handles requests from clients that want to join a room
  socket.on("wannajoin", (obj) => {

    if (checkRoom(obj.websocket, obj.session)) {
      socket.join(obj.session);
      console.log("joined successfully");

      const socketIdent = rooms.find(({ roomId }) => roomId == obj.session);
      if (socketIdent.playerOne == obj.websocket) socket.emit("whoami", "playerOne");
      else if (socketIdent.playerTwo == obj.websocket) socket.emit("whoami", "playerTwo");
      else socket.emit("whoami", "nobody");

      console.log("told the player who he is")
    } else {
      console.log("Room unavailable, notifiy user to try again.");
    }
  });
  //Sends ball coordinates to other player when ball passes boundaries of players viewport
  socket.on("crossBorder", (obj) => {

    const room = rooms.find(({ roomId }) => roomId == obj.session);
    if (obj.websocket == room.playerOne) {
      console.log("From player one: " + JSON.stringify(obj));

      io.to(room.playerTwo).emit("crossingBorder", obj.ballData);

    } else if (obj.websocket == room.playerTwo) {
      console.log("From player two: " + JSON.stringify(obj));

      io.to(room.playerOne).emit("crossingBorder", obj.ballData);
    }
  });
});