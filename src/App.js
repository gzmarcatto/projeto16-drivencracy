import express from 'express';
import cors from 'cors';

import { listenServer, postNewPoll, getPoll, postChoice } from './response.js';

const PORT = process.env.PORT || 5000;
const server = express();
server.use(cors());
server.use(express.json());



server.post(`/poll`, postNewPoll);
server.get(`/poll`, getPoll);
server.post(`/choice`, postChoice);

server.listen(PORT, listenServer(PORT));
