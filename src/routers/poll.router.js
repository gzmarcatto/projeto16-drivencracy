import { Router } from "express";
import * as pollController from "../controllers/poll.controller.js";
import {pollSchema} from "../schemas/poll.schema.js";
import { validateSchemaMiddleware } from "../middlewares/index.js";


const pollRouter = Router();

pollRouter.post(`/poll`, validateSchemaMiddleware(pollSchema), pollController.postNewPoll);
pollRouter.get(`/poll`, validateSchemaMiddleware(pollSchema), pollController.getPoll);

export default pollRouter;
