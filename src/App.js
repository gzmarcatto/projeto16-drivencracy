import express from "express"
import cors from "cors"
import {} from "response.js"

const PORT = 5000;
const server = express();
server.use(cors());
server.use(express.json());

server.listen(PORT, listenServer)