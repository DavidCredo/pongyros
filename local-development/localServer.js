import { readFileSync } from "fs";
import express from "express";
import { createServer } from "https";
import { Server } from "socket.io";

export let localApp = express();
const sslOptions = {
    key: readFileSync('local-development/ssl/key.pem'),
    cert: readFileSync('local-development/ssl/cert.pem')
};

export const httpsServer = createServer(sslOptions, localApp);

export let localIO = new Server(httpsServer, {
    cors: {
        origin: "https://localhost:8080",
        methods: ["GET", "POST"]
    }
});