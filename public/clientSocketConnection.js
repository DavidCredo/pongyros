import "/socket.io/socket.io.js";
export const socket = io();

socket.on("connect", () => {
    console.log("WebSocket found!");
    console.log(socket.id);
    document.getElementById('websocket').value = socket.id;
})

socket.on("disconnect", () => {
    
})

