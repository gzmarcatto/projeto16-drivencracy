import express from "express";
import cors from "cors";
import "dotenv/config"

import { listenServer } from "./response.js";
import pollRouter from "./routers/poll.router.js";
import choiceRouter from "./routers/choice.router.js";

const PORT = process.env.PORT || 5000;
const server = express();
server.use(cors());
server.use(express.json());
server.use(pollRouter).use(choiceRouter);

server.listen(PORT, listenServer(PORT));
